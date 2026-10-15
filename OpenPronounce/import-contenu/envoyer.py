"""
Partie C — Envoi du contenu pédagogique dans Firestore
=======================================================
Lit contenu_prepare.json (produit par preparer.py) et écrit dans Firestore :

  Collection  niveaux/
    Document  {niveau_id}          ← ex. "nursery_2"
      id, nom, ordre

  Collection  unites/
    Document  {unit_id}            ← ex. "unit_01_school"
      id, niveau, matiere, titre, ordre
      ecrans: [ { screen_number, activity_type, expected_text,
                  mots, audio_instruction, image,
                  visual_description, audio_texte, audio_consigne } ]

Si le script est relancé, chaque document est remplacé (set avec merge=False).

Usage :
    python envoyer.py [--dry-run]

  --dry-run  Affiche ce qui serait envoyé sans toucher Firestore.
"""

import argparse
import json
import re
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_DIR         = Path(__file__).parent
CONTENU_PREPARE  = BASE_DIR / "contenu_prepare.json"
SERVICE_ACCOUNT  = BASE_DIR / "serviceAccount.json"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def slugifier(texte: str) -> str:
    """'Nursery 2' → 'nursery_2'  |  'General' → 'general'"""
    s = texte.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "_", s)
    return s.strip("_")


def ordre_niveau(nom: str) -> int:
    """Extrait un entier d'un nom de niveau pour le tri : 'Nursery 2' → 2."""
    chiffres = re.findall(r"\d+", nom)
    return int(chiffres[0]) if chiffres else 0


def init_firebase():
    """Initialise l'app Firebase Admin et retourne le client Firestore."""
    import firebase_admin
    from firebase_admin import credentials, firestore

    if not SERVICE_ACCOUNT.exists():
        print(f"[ERREUR] Fichier introuvable : {SERVICE_ACCOUNT}")
        print("         Placez serviceAccount.json dans le dossier import-contenu/")
        sys.exit(1)

    # Supprime toute app existante pour repartir proprement
    for app in list(firebase_admin._apps.values()):
        firebase_admin.delete_app(app)

    cred = credentials.Certificate(str(SERVICE_ACCOUNT))
    firebase_admin.initialize_app(cred)

    return firestore.client()


# ---------------------------------------------------------------------------
# Envoi
# ---------------------------------------------------------------------------

def envoyer_niveau(db, niveau_id: str, nom: str, ordre: int, dry_run: bool):
    doc = {"id": niveau_id, "nom": nom, "ordre": ordre}
    if dry_run:
        print(f"    [DRY] niveaux/{niveau_id}  ←  {doc}")
    else:
        db.collection("niveaux").document(niveau_id).set(doc)
        print(f"    ✓  niveaux/{niveau_id}")


def envoyer_unite(db, unite: dict, niveau_id: str, dry_run: bool):
    """
    Construit et envoie (ou affiche) le document d'une unité.
    Les écrans sont inclus directement dans le document de l'unité.
    """
    uid = unite["unit_id"]

    ecrans_clean = []
    for e in unite["ecrans"]:
        ecrans_clean.append({
            "screen_number":      e["screen_number"],
            "activity_type":      e["activity_type"],
            "expected_text":      e["expected_text"],
            "mots":               e["mots"],
            "audio_instruction":  e["audio_instruction"],
            "image":              e.get("image"),
            "visual_description": e.get("visual_description", ""),
            "audio_texte":        e.get("audio_texte"),
            "audio_consigne":     e.get("audio_consigne"),
        })

    doc = {
        "id":       uid,
        "niveau":   niveau_id,
        "matiere":  unite.get("subject", "General"),
        "titre":    unite.get("unit_title", ""),
        "ordre":    unite.get("unit_order"),   # None si non renseigné
        "ecrans":   ecrans_clean,
    }

    if dry_run:
        apercu = {k: v for k, v in doc.items() if k != "ecrans"}
        apercu["ecrans"] = f"[{len(ecrans_clean)} écran(s)]"
        print(f"    [DRY] unites/{uid}  ←  {apercu}")
    else:
        db.collection("unites").document(uid).set(doc)
        print(f"    ✓  unites/{uid}  ({len(ecrans_clean)} écran(s))")


# ---------------------------------------------------------------------------
# Point d'entrée
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Envoie le contenu préparé dans Firestore."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Affiche ce qui serait envoyé sans écrire dans Firestore.",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("  ENVOI DANS FIRESTORE")
    if args.dry_run:
        print("  ⚠  MODE DRY-RUN — aucune écriture réelle")
    print("=" * 60)

    # Chargement du contenu préparé
    if not CONTENU_PREPARE.exists():
        print(f"[ERREUR] {CONTENU_PREPARE.name} introuvable.")
        print("         Lancez d'abord preparer.py.")
        sys.exit(1)

    with open(CONTENU_PREPARE, encoding="utf-8") as fh:
        data = json.load(fh)

    # Connexion Firestore (ignorée en dry-run)
    db = None
    if not args.dry_run:
        print("\nConnexion à Firestore…")
        db = init_firebase()
        print("Connecté.\n")
    else:
        print()

    total_niveaux = 0
    total_unites  = 0

    for bloc_niveau in data:
        nom_niveau  = bloc_niveau["niveau"]
        niveau_id   = slugifier(nom_niveau)
        ordre_niv   = ordre_niveau(nom_niveau)

        print(f"Niveau : {nom_niveau}  (id={niveau_id}, ordre={ordre_niv})")
        envoyer_niveau(db, niveau_id, nom_niveau, ordre_niv, args.dry_run)
        total_niveaux += 1

        for matiere, unites in bloc_niveau["matieres"].items():
            print(f"  Matière : {matiere}")
            for unite in unites:
                envoyer_unite(db, unite, niveau_id, args.dry_run)
                total_unites += 1

    # Résumé
    print()
    print("=" * 60)
    if args.dry_run:
        print(f"  🔍 Dry-run terminé : {total_niveaux} niveau(x), {total_unites} unité(s).")
        print("     Relancez sans --dry-run pour écrire dans Firestore.")
    else:
        print(f"  ✅ Envoi terminé : {total_niveaux} niveau(x), {total_unites} unité(s).")
        print("     Les données sont disponibles dans Firestore.")
    print("=" * 60)


if __name__ == "__main__":
    main()
