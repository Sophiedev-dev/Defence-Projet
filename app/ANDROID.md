# Tester l'application sur un téléphone Android

L'application est empaquetée avec Capacitor : le dossier `android/` est un
projet Android Studio qui contient l'appli web (images, sons et polices compris).

Le téléphone et le PC doivent être sur **le même réseau Wi-Fi**.

---

## 1. Trouver l'adresse IP du PC

Dans PowerShell :

```powershell
ipconfig
```

Prends la carte qui a une **« Passerelle par défaut »** remplie (par ex.
`192.168.4.1`) : son **« Adresse IPv4 »** est l'adresse du PC sur le Wi-Fi,
par exemple `192.168.4.56`.

- Le nom de la carte varie : en général « Carte réseau sans fil Wi-Fi ».
  Sur ce PC, le Wi-Fi passe par **« vEthernet (WSL-Bridge) »** (pont créé par
  WSL) : c'est donc celle-là.
- Ignore les cartes sans passerelle (« vEthernet (Default Switch) » en `172.x.x.x`…).
- Cette adresse peut changer quand le PC se reconnecte au Wi-Fi : refais
  `ipconfig` si l'appli n'arrive plus à joindre le serveur.

L'adresse du serveur à saisir dans l'appli est alors : `http://192.168.4.56:8000`

---

## 2. Rendre OpenPronounce joignable depuis le téléphone

### a. Lancer le serveur sur toutes les interfaces

`start_server.bat` le fait déjà (`--host 0.0.0.0`). Depuis le dossier `OpenPronounce` :

```powershell
.\start_server.bat
```

Avec `--host 127.0.0.1` (ou sans `--host`), seul le PC lui-même pourrait le joindre.

### b. Ouvrir le port 8000 dans le pare-feu Windows (une seule fois)

Ouvre PowerShell **en administrateur** (clic droit sur PowerShell →
« Exécuter en tant qu'administrateur ») :

```powershell
New-NetFirewallRule -DisplayName "OpenPronounce 8000" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -Profile Private
```

La règle vaut pour les réseaux **privés**. Vérifie que ton Wi-Fi est bien en privé :

```powershell
Get-NetConnectionProfile
```

Si `NetworkCategory` vaut `Public` (c'est le cas sur ce PC), passe-le en privé
(toujours en administrateur, avec le nom affiché dans `InterfaceAlias`) :

```powershell
Set-NetConnectionProfile -InterfaceAlias "vEthernet (WSL-Bridge)" -NetworkCategory Private
```

Ne le fais que sur un Wi-Fi de confiance (maison, école), pas sur un Wi-Fi public.
Si Windows refuse de changer le profil, crée plutôt la règle pour tous les
profils (`-Profile Any` au lieu de `-Profile Private`) et pense à la désactiver
hors de ce réseau :

```powershell
Disable-NetFirewallRule -DisplayName "OpenPronounce 8000"
```

### c. Vérifier depuis le téléphone

Dans Chrome **sur le téléphone**, ouvre `http://192.168.4.56:8000/health`.
Tu dois voir `{"status":"ok"}`. Sinon : même Wi-Fi ? serveur lancé ? pare-feu ?

---

## 3. Générer l'APK avec Android Studio

### Prérequis (une seule fois)

Le projet utilise Capacitor 8, qui demande **Android Studio 2025 ou plus récent**
et **Java 21**.

- Mettre à jour Android Studio : **Help → Check for Updates…** (ou télécharger
  la dernière version sur developer.android.com/studio). Android Studio 2024.1
  (Koala) est trop ancien : la synchronisation Gradle échoue.
- Vérifier le Java utilisé : **File → Settings → Build, Execution, Deployment →
  Build Tools → Gradle → Gradle JDK** → choisir une version **21**
  (« jbr-21 » fourni avec Android Studio, ou
  `C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot`). Avec Java 17, la
  compilation échoue avec « invalid source release: 21 ».

### Étapes

1. Construire l'appli web et la copier dans le projet Android (à refaire après
   chaque modification du code) :

   ```powershell
   cd app
   npm run android
   ```

2. Ouvrir le projet dans Android Studio :

   ```powershell
   npm run android:ouvrir
   ```

   (ou dans Android Studio : **File → Open…** → choisir le dossier `app/android`).

3. Attendre la fin de **« Gradle sync »** (barre en bas de la fenêtre ; la
   première fois, plusieurs minutes).

4. Menu **Build → Generate App Bundles or APKs → Generate APKs**
   (selon la version : **Build → Build Bundle(s) / APK(s) → Build APK(s)**).

5. À la fin, une bulle « APK(s) generated successfully » apparaît : clique sur
   **locate**. Le fichier est :

   ```
   app/android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Sans Android Studio (ligne de commande)

Possible même avec un Android Studio ancien, tant que Java 21 et le SDK Android sont installés :

```powershell
cd app
npm run android
cd android
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
.\gradlew.bat assembleDebug
```

L'APK est au même endroit : `app\android\app\build\outputs\apk\debug\app-debug.apk`.

---

## 4. Installer l'APK sur le téléphone

### Méthode A — câble USB (la plus pratique pour tester souvent)

1. Sur le téléphone : **Paramètres → À propos du téléphone** → touche
   **7 fois « Numéro de build »** (« Vous êtes développeur »).
2. **Paramètres → Système → Options pour les développeurs** → active
   **« Débogage USB »**.
3. Branche le téléphone au PC, accepte **« Autoriser le débogage USB »** sur le téléphone.
4. Dans Android Studio, choisis ton téléphone dans la liste des appareils en
   haut, puis clique sur **▶ Run**. L'appli s'installe et se lance.

### Méthode B — copier le fichier APK

1. Copie `app-debug.apk` sur le téléphone (câble, Google Drive, e-mail…).
2. Sur le téléphone, ouvre le fichier depuis l'application **Fichiers**.
3. Android demande d'autoriser **« Installer des applis inconnues »** pour
   cette application : accepte, puis **Installer**.

---

## 5. Premier lancement

1. Au premier appui sur le micro, Android demande l'accès au micro : **Autoriser**.
2. Si la correction ne marche pas (écran « La correction ne marche pas pour le
   moment ») : retourne au choix du niveau, touche le **cadenas** en bas à droite,
   corrige l'adresse du serveur et touche **« Enregistrer et tester »**.

L'adresse proposée au premier lancement vient de `VITE_OPENPRONOUNCE_URL`
dans `.env.local` ; ensuite, c'est celle des Réglages qui compte.
