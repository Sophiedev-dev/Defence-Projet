"""
Partie B — Préparation du contenu pédagogique
==============================================
Lit tous les fichiers JSON de contenu/, puis pour chaque écran :
  1. Découpe expected_text en liste de mots  { "id": n, "t": "mot" }
     (ponctuation supprimée, casse conservée)
  2. Génère deux fichiers audio via l'API /tts d'OpenPronounce :
       audio/{unit_id}_s{screen}_texte.wav     ← le texte attendu
       audio/{unit_id}_s{screen}_consigne.wav  ← la consigne audio

Produit ensuite contenu_prepare.json utilisé par envoyer.py.

Usage :
    python preparer.py [--tts-url URL]

Prérequis :
    Le serveur OpenPronounce doit tourner sur http://localhost:8000
    Lancez-le avec :  ..\\.venv\\Scripts\\uvicorn.exe server:app --port 8000
"""

import argparse
import json
import re
import sys
import time
from pathlib import Path

import requests

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_DIR        = Path(__file__).parent
CONTENU_DIR     = BASE_DIR / "contenu"
AUDIO_DIR       = BASE_DIR / "audio"
SORTIE          = BASE_DIR / "contenu_prepare.json"
TTS_URL_DEFAUT  = "http://localhost:8000/tts"
LANG_DEFAUT     = "en"

# Ponctuation à supprimer pour la liste de mots
_RE_PONCTUATION = re.compile(r"[^\w\s''-]", re.UNICODE)
_RE_ESPACES     = re.compile(r"\s+")

# ---------------------------------------------------------------------------
# Découpage en mots
# ---------------------------------------------------------------------------

def decouper_en_mots(texte: str) -> list[dict]:
    """
    Retourne [ {"id": 1, "t": "mot"}, ... ] sans ponctuation.
    Les apostrophes et tirets à l'intérieur des mots sont conservés
    (ex. "it's" → "it's", "well-known" → "well-known").
    """
    propre = _RE_PONCTUATION.sub(" ", texte)
    propre = _RE_ESPACES.sub(" ", propre).strip()
    mots = [m for m in propre.split(" ") if m]
    return [{"id": i + 1, "t": mot} for i, mot in enumerate(mots)]


# ---------------------------------------------------------------------------
# Génération audio
# ---------------------------------------------------------------------------

def generer_audio(texte: str, chemin: Path, tts_url: str, lang: str, label: str) -> bool:
    """
    Appelle POST /tts et sauvegarde le WAV retourné dans chemin.
    Retourne True si succès, False sinon (avec message d'erreur).
    """
    if chemin.exists():
        print(f"    ↩  (déjà présent) {chemin.name}")
        return True

    try:
        resp = requests.post(
            tts_url,
            data={"text": texte, "lang": lang},
            timeout=60,
        )
        resp.raise_for_status()
    except requests.exceptions.ConnectionError:
        print(f"    [ERREUR] Impossible de joindre {tts_url}")
        print("             Démarrez le serveur OpenPronounce, puis relancez preparer.py.")
        return False
    except requests.exceptions.Timeout:
        print(f"    [ERREUR] Timeout sur {label}")
        return False
    except requests.exceptions.HTTPError as e:
        print(f"    [ERREUR] HTTP {e.response.status_code} sur {label} : {e}")
        return False

    chemin.write_bytes(resp.content)
    print(f"    ✓  {chemin.name}")
    return True


# ---------------------------------------------------------------------------
# Chargement des fichiers source
# ---------------------------------------------------------------------------

def charger_ecrans() -> list[dict]:
    fichiers = sorted(CONTENU_DIR.glob("*.json"))
    if not fichiers:
        print(f"[ERREUR] Aucun fichier JSON dans {CONTENU_DIR}")
        sys.exit(1)

    ecrans = []
    for f in fichiers:
        with open(f, encoding="utf-8") as fh:
            data = json.load(fh)
        ecrans.extend(data)
    return ecrans


# ---------------------------------------------------------------------------
# Regroupement : niveau → matière → unité → écrans
# ---------------------------------------------------------------------------

def regrouper(ecrans: list[dict]) -> dict:
    """
    Retourne un dict imbriqué :
      {
        "Nursery 2": {
          "subject": {           ← valeur de ecran["subject"] ou "General"
            "unit_01_school": {
              "meta": { unit_title, unit_order, level, subject },
              "ecrans": [ ... ]
            }
          }
        }
      }
    """
    arbre: dict = {}

    for ecran in ecrans:
        niveau  = ecran["level"]
        matiere = ecran.get("subject") or "General"
        uid     = ecran["unit_id"]

        arbre.setdefault(niveau, {})
        arbre[niveau].setdefault(matiere, {})

        if uid not in arbre[niveau][matiere]:
            arbre[niveau][matiere][uid] = {
                "meta": {
                    "unit_id":    uid,
                    "unit_title": ecran.get("unit_title", ""),
                    "unit_order": ecran.get("unit_order"),   # None si absent
                    "level":      niveau,
                    "subject":    matiere,
                },
                "ecrans": [],
            }

        arbre[niveau][matiere][uid]["ecrans"].append(ecran)

    # Trier les écrans de chaque unité par screen_number
    for niveau in arbre:
        for matiere in arbre[niveau]:
            for uid in arbre[niveau][matiere]:
                arbre[niveau][matiere][uid]["ecrans"].sort(
                    key=lambda e: e.get("screen_number", 0)
                )

    return arbre


# ---------------------------------------------------------------------------
# Construction du document préparé
# ---------------------------------------------------------------------------

def preparer_ecran(ecran: dict, tts_url: str, lang: str) -> dict:
    """Retourne le dict enrichi d'un écran : mots + chemins audio."""
    uid    = ecran["unit_id"]
    screen = ecran["screen_number"]
    prefix = f"{uid}_s{screen}"

    chemin_texte    = AUDIO_DIR / f"{prefix}_texte.wav"
    chemin_consigne = AUDIO_DIR / f"{prefix}_consigne.wav"

    # Chemins relatifs pour Firestore (stockage Cloud ultérieur)
    audio_texte    = f"audio/{chemin_texte.name}"
    audio_consigne = f"audio/{chemin_consigne.name}"

    print(f"  Écran {screen} — {uid}")

    # Génération audio texte
    ok_texte = generer_audio(
        texte    = ecran["expected_text"],
        chemin   = chemin_texte,
        tts_url  = tts_url,
        lang     = lang,
        label    = f"{prefix}_texte",
    )

    # Génération audio consigne
    ok_consigne = generer_audio(
        texte    = ecran.get("audio_instruction", ""),
        chemin   = chemin_consigne,
        tts_url  = tts_url,
        lang     = lang,
        label    = f"{prefix}_consigne",
    )

    return {
        "screen_number":      screen,
        "activity_type":      ecran.get("activity_type") or ecran.get("block_type") or "paragraph",
        "expected_text":      ecran["expected_text"],
        "mots":               decouper_en_mots(ecran["expected_text"]),
        "audio_instruction":  ecran.get("audio_instruction", ""),
        "image":              ecran.get("image"),
        "visual_description": ecran.get("visual_description", ""),
        "audio_texte":        audio_texte    if ok_texte    else None,
        "audio_consigne":     audio_consigne if ok_consigne else None,
        "audio_ok":           ok_texte and ok_consigne,
    }


# ---------------------------------------------------------------------------
# Point d'entrée
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Prépare le contenu pédagogique (mots + audio).")
    parser.add_argument(
        "--tts-url",
        default=TTS_URL_DEFAUT,
        help=f"URL du endpoint /tts (défaut : {TTS_URL_DEFAUT})",
    )
    parser.add_argument(
        "--lang",
        default=LANG_DEFAUT,
        help=f"Code langue pour le TTS (défaut : {LANG_DEFAUT})",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("  PRÉPARATION DU CONTENU PÉDAGOGIQUE")
    print("=" * 60)
    print(f"  TTS : {args.tts_url}  |  Langue : {args.lang}")
    print()

    AUDIO_DIR.mkdir(exist_ok=True)
    ecrans = charger_ecrans()
    arbre  = regrouper(ecrans)

    document = []   # liste plate de niveaux enrichis → pour envoyer.py
    erreurs_audio = 0

    for niveau, matieres in arbre.items():
        print(f"Niveau : {niveau}")
        niv_doc = {"niveau": niveau, "matieres": {}}

        for matiere, unites in matieres.items():
            print(f"  Matière : {matiere}")
            niv_doc["matieres"][matiere] = []

            for uid, unite in unites.items():
                print(f"  Unité : {uid} — {unite['meta']['unit_title']}")
                ecrans_prepares = []

                for ecran in unite["ecrans"]:
                    ep = preparer_ecran(ecran, args.tts_url, args.lang)
                    ecrans_prepares.append(ep)
                    if not ep["audio_ok"]:
                        erreurs_audio += 1

                niv_doc["matieres"][matiere].append({
                    **unite["meta"],
                    "ecrans": ecrans_prepares,
                })

        document.append(niv_doc)

    # Sauvegarde
    with open(SORTIE, "w", encoding="utf-8") as fh:
        json.dump(document, fh, ensure_ascii=False, indent=2)

    print()
    print("=" * 60)
    if erreurs_audio == 0:
        print(f"  ✅ Préparation terminée. Fichier généré :")
        print(f"     {SORTIE.name}")
        print("  Vous pouvez lancer envoyer.py.")
    else:
        print(f"  ⚠  Préparation terminée avec {erreurs_audio} écran(s) sans audio.")
        print(f"     Vérifiez que le serveur OpenPronounce tourne, puis relancez.")
        print(f"     Fichier partiel : {SORTIE.name}")
    print("=" * 60)

    sys.exit(0 if erreurs_audio == 0 else 1)


if __name__ == "__main__":
    main()
