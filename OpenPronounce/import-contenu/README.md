# import-contenu — Outil d'import pédagogique

Prépare le contenu pédagogique (JSON → Firestore) en trois étapes.

---

## Prérequis (à faire une seule fois)

### 1. Créer le venv et installer les dépendances

```powershell
cd import-contenu
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 2. Activer l'API Firestore sur ton projet Google Cloud

Ouvre ce lien et clique sur **Activer** :  
https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=reader-2a2dd

### 3. Placer `serviceAccount.json` dans ce dossier

Le fichier est dans `.gitignore` et ne sera jamais commité.

---

## Utilisation — les 3 scripts dans l'ordre

### Étape A — Vérifier le contenu

```powershell
.\.venv\Scripts\python.exe verifier.py
```

- Lit tous les fichiers JSON de `contenu/`
- Vérifie les champs obligatoires et les images
- **Erreurs** = bloquantes (à corriger avant de continuer)
- **Avertissements** = champs optionnels absents (non bloquants)

### Étape B — Préparer le contenu

> Le serveur OpenPronounce doit tourner sur `http://localhost:8000`  
> Lance-le dans un autre terminal :
> ```powershell
> cd ..
> .\.venv\Scripts\uvicorn.exe server:app --port 8000
> ```

```powershell
.\.venv\Scripts\python.exe preparer.py
```

Ce script :
- Découpe chaque `expected_text` en liste de mots `{ "id": n, "t": "mot" }` sans ponctuation
- Génère les fichiers audio dans `audio/` via l'API `/tts` :
  - `audio/{unit_id}_s{screen}_texte.wav`
  - `audio/{unit_id}_s{screen}_consigne.wav`
- Produit `contenu_prepare.json` (utilisé par l'étape suivante)

Si un fichier audio existe déjà, il n'est pas re-téléchargé. Tu peux relancer le script sans risque.

### Étape C — Envoyer dans Firestore

```powershell
.\.venv\Scripts\python.exe envoyer.py
```

- Envoie les données dans les collections `niveaux/` et `unites/`
- Chaque relance **remplace** les données existantes (pas de doublons)

Pour tester sans écrire dans Firestore :

```powershell
.\.venv\Scripts\python.exe envoyer.py --dry-run
```

---

## Structure Firestore

```
niveaux/
  nursery_2          ← { id, nom: "Nursery 2", ordre: 2 }

unites/
  unit_01_school     ← { id, niveau, matiere, titre, ordre,
                          ecrans: [
                            { screen_number, activity_type,
                              expected_text,
                              mots: [{ id, t }],
                              audio_instruction,
                              audio_texte, audio_consigne,
                              image, visual_description }
                          ] }
  unit_02_kitchen
  unit_03_fruit
```

---

## Structure des fichiers JSON source (`contenu/`)

Chaque fichier est une liste d'écrans. Champs reconnus :

| Champ | Obligatoire | Description |
|---|---|---|
| `level` | ✅ | Nom du niveau (`"Nursery 2"`) |
| `unit_id` | ✅ | Identifiant de l'unité (`"unit_01_school"`) |
| `unit_title` | ✅ | Titre de l'unité |
| `screen_number` | ✅ | Numéro de l'écran dans l'unité |
| `expected_text` | ✅ | Texte que l'élève doit lire |
| `audio_instruction` | ✅ | Consigne audio |
| `subject` | ⚠️ optionnel | Matière (`"English"`) — défaut : `"General"` |
| `unit_order` | ⚠️ optionnel | Ordre d'affichage de l'unité |
| `activity_type` | ⚠️ optionnel | Type d'activité — défaut : valeur de `block_type` |
| `image` | ⚠️ optionnel | Nom du fichier image dans `images/` |
| `visual_description` | ⚠️ optionnel | Description de l'image |
| `block_type` | ⚠️ optionnel | Type de bloc (`"paragraph"`) |
