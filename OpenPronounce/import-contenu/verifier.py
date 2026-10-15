"""
Partie A — Vérification du contenu pédagogique
===============================================
Lit tous les fichiers JSON de contenu/ et vérifie :
  • Champs obligatoires présents sur chaque écran
  • Champs optionnels présents (avertissement si absent)
  • Fichier image référencé dans images/ (si le champ image est renseigné)

Usage :
    python verifier.py
"""

import json
import os
import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_DIR   = Path(__file__).parent
CONTENU_DIR = BASE_DIR / "contenu"
IMAGES_DIR  = BASE_DIR / "images"

# Champs dont l'absence bloque l'import
CHAMPS_OBLIGATOIRES = [
    "level",
    "unit_id",
    "unit_title",
    "screen_number",
    "expected_text",
    "audio_instruction",
]

# Champs utiles mais non bloquants (avertissement seulement)
CHAMPS_OPTIONNELS = [
    "subject",
    "unit_order",
    "activity_type",
    "block_type",
    "image",
    "visual_description",
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def charger_fichiers():
    """Retourne la liste de tous les écrans issus des JSON de contenu/."""
    fichiers = sorted(CONTENU_DIR.glob("*.json"))
    if not fichiers:
        print(f"[ERREUR] Aucun fichier JSON trouvé dans {CONTENU_DIR}")
        sys.exit(1)

    ecrans = []
    for f in fichiers:
        try:
            with open(f, encoding="utf-8") as fh:
                data = json.load(fh)
            if not isinstance(data, list):
                print(f"[ERREUR] {f.name} : le contenu doit être une liste JSON.")
                sys.exit(1)
            for ecran in data:
                ecran["_source"] = f.name   # on garde la provenance pour les messages
            ecrans.extend(data)
        except json.JSONDecodeError as e:
            print(f"[ERREUR] {f.name} : JSON invalide — {e}")
            sys.exit(1)
    return ecrans


def label(ecran):
    """Identifiant lisible pour les messages d'erreur."""
    src    = ecran.get("_source", "?")
    uid    = ecran.get("unit_id", "?")
    screen = ecran.get("screen_number", "?")
    return f"{src} › {uid} › écran {screen}"


# ---------------------------------------------------------------------------
# Vérifications
# ---------------------------------------------------------------------------

def verifier_champs(ecran):
    """Retourne (erreurs, avertissements) pour un écran."""
    erreurs = []
    avertissements = []

    for champ in CHAMPS_OBLIGATOIRES:
        valeur = ecran.get(champ)
        if valeur is None or (isinstance(valeur, str) and not valeur.strip()):
            erreurs.append(f"Champ obligatoire manquant ou vide : « {champ} »")

    for champ in CHAMPS_OPTIONNELS:
        if ecran.get(champ) is None:
            avertissements.append(f"Champ optionnel absent : « {champ} »")

    return erreurs, avertissements


def verifier_image(ecran):
    """Retourne une erreur si le champ image est renseigné mais le fichier absent."""
    image = ecran.get("image")
    if not image:
        return None
    chemin = IMAGES_DIR / image
    if not chemin.exists():
        return f"Image introuvable dans images/ : « {image} »"
    return None


# ---------------------------------------------------------------------------
# Point d'entrée
# ---------------------------------------------------------------------------

def main():
    print("=" * 60)
    print("  VÉRIFICATION DU CONTENU PÉDAGOGIQUE")
    print("=" * 60)

    ecrans = charger_fichiers()
    print(f"\n{len(ecrans)} écran(s) chargé(s) depuis {CONTENU_DIR.name}/\n")

    total_erreurs = 0
    total_avertissements = 0

    for ecran in ecrans:
        lbl = label(ecran)
        erreurs, avertissements = verifier_champs(ecran)

        err_image = verifier_image(ecran)
        if err_image:
            erreurs.append(err_image)

        if erreurs:
            print(f"  ✗  {lbl}")
            for e in erreurs:
                print(f"       [ERREUR]  {e}")
            total_erreurs += len(erreurs)

        if avertissements:
            # N'afficher les avertissements que si pas d'erreur sur cet écran
            # (pour ne pas noyer les erreurs bloquantes)
            if not erreurs:
                print(f"  ⚠  {lbl}")
            for a in avertissements:
                print(f"       [AVERT.]  {a}")
            total_avertissements += len(avertissements)

        if not erreurs and not avertissements:
            print(f"  ✓  {lbl}")

    # --- Résumé ---
    print("\n" + "=" * 60)
    if total_erreurs == 0:
        print(f"  ✅ Aucune erreur bloquante. ({total_avertissements} avertissement(s))")
        print("  Vous pouvez lancer preparer.py.")
    else:
        print(f"  ❌ {total_erreurs} erreur(s) bloquante(s) à corriger.")
        print(f"     {total_avertissements} avertissement(s) non bloquant(s).")
        print("  Corrigez les erreurs avant de lancer preparer.py.")
    print("=" * 60)

    sys.exit(0 if total_erreurs == 0 else 1)


if __name__ == "__main__":
    main()
