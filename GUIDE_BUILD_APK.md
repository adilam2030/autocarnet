# 📱 AutoCarnet — Guide complet : Build APK depuis Termux

---

## PARTIE 1 — Configuration Firebase (à faire avant tout)

### Étape 1 : Créer le projet Firebase

1. Aller sur https://console.firebase.google.com
2. Cliquer **"Ajouter un projet"** → nommer : `autocarnet`
3. Désactiver Google Analytics (optionnel)
4. Cliquer **Créer**

### Étape 2 : Activer l'authentification Google

1. Dans Firebase Console → **Authentication** → **Sign-in method**
2. Activer **Google**
3. Mettre votre e-mail comme e-mail d'assistance
4. **Enregistrer**

### Étape 3 : Créer Firestore

1. **Firestore Database** → **Créer une base de données**
2. Mode **Production** → Région : `europe-west1`
3. Une fois créé, aller dans **Règles** et coller le contenu de `firestore.rules`

### Étape 4 : Activer Firebase Storage

1. **Storage** → **Commencer**
2. Mode Production → Même région
3. Dans **Règles** → coller le contenu de `storage.rules`

### Étape 5 : Ajouter l'app Android

1. Dans Firebase Console → ⚙️ **Paramètres du projet** → **Vos applications**
2. Cliquer l'icône Android **</>**
3. Nom du package : `com.autocarnet.app`
4. Télécharger le fichier **`google-services.json`**
5. Le placer dans le dossier `autocarnet/` (racine du projet)

### Étape 6 : Récupérer le Web Client ID

1. Firebase Console → Authentication → Sign-in method → Google → Modifier
2. Copier le **Web Client ID**
3. Ouvrir `src/context/AuthContext.js`
4. Remplacer `'VOTRE_WEB_CLIENT_ID.apps.googleusercontent.com'` par votre valeur

---

## PARTIE 2 — Installation de l'environnement dans Termux

### Étape 1 : Installer Termux

Télécharger Termux depuis **F-Droid** (pas Play Store) :
https://f-droid.org/packages/com.termux/

### Étape 2 : Mise à jour et packages de base

```bash
pkg update && pkg upgrade -y
pkg install git nodejs-lts -y
pkg install openjdk-17 -y
```

### Étape 3 : Vérifier les versions

```bash
node --version    # doit afficher v18.x ou v20.x
npm --version     # doit afficher 9.x ou 10.x
java --version    # doit afficher openjdk 17
```

### Étape 4 : Installer EAS CLI (Expo Application Services)

```bash
npm install -g eas-cli expo-cli
```

### Étape 5 : Créer un compte Expo (gratuit)

Aller sur https://expo.dev → **Sign up** → créer un compte gratuit

---

## PARTIE 3 — Préparer le projet AutoCarnet

### Étape 1 : Créer le dossier du projet

```bash
mkdir -p ~/storage/shared/autocarnet
cd ~/storage/shared/autocarnet
```

> Si la commande `~/storage` ne fonctionne pas :
> ```bash
> termux-setup-storage
> ```
> Puis accepter la permission de stockage.

### Étape 2 : Copier les fichiers du projet

Transférer tous les fichiers du projet `autocarnet/` sur votre téléphone.
(Via câble USB, Google Drive, ou tout autre moyen)

Structure attendue :
```
autocarnet/
├── App.js
├── app.json
├── eas.json
├── package.json
├── babel.config.js
├── google-services.json       ← OBLIGATOIRE (téléchargé depuis Firebase)
└── src/
    ├── context/
    ├── navigation/
    ├── screens/
    └── utils/
```

### Étape 3 : Aller dans le dossier du projet

```bash
cd ~/storage/shared/autocarnet
```

### Étape 4 : Installer les dépendances

```bash
npm install
```

> ⚠️ Cette étape peut prendre 5 à 10 minutes et consommer ~500 Mo.

---

## PARTIE 4 — Connexion à Expo et build APK

### Étape 1 : Se connecter à Expo

```bash
eas login
```
Entrer votre e-mail et mot de passe Expo.

### Étape 2 : Configurer EAS pour votre projet

```bash
eas build:configure
```
Répondre **Android** quand demandé.

### Étape 3 : Lancer le build APK

```bash
eas build --platform android --profile preview
```

> Le profil `preview` est configuré pour générer un fichier `.apk` directement installable (pas un `.aab`).

### Étape 4 : Suivre le build

- EAS va uploader votre code sur les serveurs Expo
- Le build se fait dans le cloud (vous n'avez pas besoin de SDK Android sur votre téléphone)
- Durée : **5 à 15 minutes**
- Vous recevrez une notification et un lien de téléchargement

### Étape 5 : Télécharger et installer l'APK

```bash
# Le lien de téléchargement s'affiche dans le terminal
# Vous pouvez aussi le télécharger depuis https://expo.dev/accounts/[votre-compte]/builds
```

Sur votre téléphone :
1. Activer **"Sources inconnues"** dans les paramètres Android
2. Ouvrir le fichier `.apk` téléchargé
3. Installer

---

## PARTIE 5 — Configuration post-installation

### Empreinte SHA-1 pour Google Sign-In

Après avoir généré votre première build, vous devez ajouter l'empreinte SHA-1 à Firebase.

```bash
# Récupérer l'empreinte depuis EAS
eas credentials
```

Puis dans Firebase Console :
1. ⚙️ Paramètres du projet → Vos applications → Android
2. **Ajouter une empreinte** → coller le SHA-1
3. Re-télécharger `google-services.json` → remplacer l'ancien

Relancer :
```bash
eas build --platform android --profile preview
```

---

## PARTIE 6 — Mises à jour futures

Pour mettre à jour l'application :

```bash
cd ~/storage/shared/autocarnet
# Modifier vos fichiers...

# Incrémenter la version dans app.json
# "versionCode": 2  (incrementer à chaque build)

eas build --platform android --profile preview
```

---

## RÉSUMÉ DES COMMANDES

```bash
# 1. Setup Termux
pkg update && pkg upgrade -y
pkg install git nodejs-lts openjdk-17 -y
npm install -g eas-cli

# 2. Projet
cd ~/storage/shared/autocarnet
npm install

# 3. Build
eas login
eas build:configure
eas build --platform android --profile preview
```

---

## PROBLÈMES COURANTS

| Problème | Solution |
|----------|----------|
| `termux-setup-storage` bloqué | Aller dans Paramètres → Apps → Termux → Autorisations → Stockage → Activer |
| `java: not found` | `pkg install openjdk-17 -y` |
| `npm install` échoue | `npm install --legacy-peer-deps` |
| Google Sign-In ne fonctionne pas | Vérifier SHA-1 dans Firebase + re-télécharger google-services.json |
| Build échoue sur EAS | Vérifier que `google-services.json` est présent à la racine |
| `eas login` échoue | Créer compte sur https://expo.dev d'abord |

---

## NOTES IMPORTANTES

- **Le build se fait dans le cloud** : vous n'avez pas besoin du SDK Android sur votre téléphone
- **Plan gratuit Expo** : 30 builds/mois gratuits
- **APK vs AAB** : Le profil `preview` génère un `.apk` installable directement. Le profil `production` génère un `.aab` pour le Play Store
- **google-services.json** : Ne jamais le partager publiquement (contient vos clés Firebase)

---

*AutoCarnet v1.0.0 — Généré avec Expo + EAS Build*
