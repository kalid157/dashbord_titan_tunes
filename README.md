# 🎵 Titan Tunes Admin - Guide d'Installation et Exécution Locale

Ce guide détaille pas à pas comment installer et exécuter l'application sur votre machine locale (`localhost`) et communiquer directement avec votre backend / API Swagger (Spring Boot, Docker, etc.).

---

## 🏗️ Architecture de Communication Locale

L'application utilise une architecture **BFF (Backend-For-Frontend)** intégrée :

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│       Navigateur Client         │       │    Serveur BFF (Node/Express)   │       │       Votre Backend API         │
│     http://localhost:3000       │ ────> │     http://localhost:3000       │ ────> │      http://localhost:8081      │
│  (Interface React + Tailwind)   │       │   (Proxy transparent intégré)   │       │   (Spring Boot / Swagger API)   │
└─────────────────────────────────┘       └─────────────────────────────────┘       └─────────────────────────────────┘
```

### ✨ Avantages immédiats en local :
- **Zéro problème de CORS** : Le navigateur envoie toutes ses requêtes sur le même port (`:3000`). Le serveur Express relaie directement vers votre backend (`:8081`).
- **Tolérance aux pannes** : Si votre backend n'est pas encore démarré, l'application fonctionne avec les données de simulation locales et bascule automatiquement dès que le backend démarre.
- **Modification d'URL à chaud** : Vous pouvez modifier l'URL du backend en direct depuis l'interface sans redémarrer le serveur.

---

## 📋 Prérequis

- **Node.js** : Version 18 ou supérieure (`node -v`)
- **npm** (ou **pnpm** / **yarn** / **bun**)
- Votre **API Backend** lancée localement (ex: sur `http://localhost:8081` ou dans un conteneur Docker).

---

## 🚀 Étape 1 : Récupération du code et installation des dépendances

Dans votre terminal (Linux / macOS / Windows WSL) :

```bash
# 1. Ouvrez le dossier du projet
cd titan-tunes-admin

# 2. Installez les dépendances npm
npm install
```

---

## ⚙️ Étape 2 : Configuration de l'environnement (`.env`)

Créez un fichier `.env` à la racine du projet (vous pouvez copier `.env.example`) :

```bash
cp .env.example .env
```

Vérifiez le contenu de votre fichier `.env` :

```env
# Port du frontend / serveur Express
PORT=3000

# URL de votre API / Backend local (Spring Boot / Swagger)
SWAGGER_BACKEND_URL=http://localhost:8081
```

> 💡 **Remarque** : Si votre backend tourne sur un autre port (ex: `8080` ou `5000`), modifiez simplement la ligne `SWAGGER_BACKEND_URL=http://localhost:8080`.

---

## ▶️ Étape 3 : Démarrer l'application

Lancez la commande de développement :

```bash
npm run dev
```

L'application démarre et affiche :
```
Titan Tunes Admin API Server running on port 3000
```

Ouvrez votre navigateur sur : **[http://localhost:3000](http://localhost:3000)**.

---

## 🔌 Étape 4 : Vérification de la communication avec votre Backend

### 1. Indicateur dans l'interface
En haut à droite de l'application, un badge **Statut API & Swagger** indique en temps réel :
- 🟢 **Connecté** (avec latence en millisecondes) si votre backend répond sur `http://localhost:8081`.
- 🟡 **Mode Fallback** si le backend est éteint ou inaccessible.

### 2. Réglage en direct sans redémarrage
Cliquez sur le badge **Statut API** dans la barre de navigation :
1. Une fenêtre modale s'ouvre.
2. Entrez l'URL de votre backend (ex: `http://localhost:8081` ou `http://127.0.0.1:8081`).
3. Cliquez sur **Tester la connexion**.
4. Cliquez sur **Enregistrer & Synchroniser**.

---

## 🛣️ Routes API relayées vers votre Backend

Toutes ces requêtes envoyées par le frontend sont immédiatement transmises à votre backend Swagger :

| Domaine | Route Frontend | Route Backend | Méthode |
|---|---|---|---|
| **Artistes** | `/user/allArtist` ou `/user/artists` | `/user/allArtist` | `GET` |
| **Création Artiste** | `/user/registerArtist` | `/user/registerArtist` | `POST` |
| **Catégories** | `/categories/all` | `/categories/all` | `GET` |
| **Création Catégorie**| `/categories/create` | `/categories/create` | `POST` |
| **Suppression Cat.** | `/categories/delete/{id}` | `/categories/delete/{id}` | `DELETE`/`ALL` |
| **Chansons (Liste)** | `/song/getAll` ou `/song/all` | `/song/getAll` | `GET` |
| **Création Chanson** | `/song/create` | `/song/create` | `POST` |
| **Mise à jour Chanson**| `/song/update/{trackingIdSong}` | `/song/update/{trackingIdSong}` | `PUT` |
| **Mise à jour Audio** | `/song/updateAudio/{trackingIdSong}`| `/song/updateAudio/{trackingIdSong}` | `PUT` *(MinIO multipart)* |
| **Suppression Chanson**| `/song/delete/{trackingIdSong}` | `/song/delete/{trackingIdSong}` | `DELETE`/`ALL` |
| **Playlists** | `/playlist/all` | `/playlist/all` | `GET` |
| **Créer Playlist** | `/playlist/create/{idClient}` | `/playlist/create/{idClient}` | `POST` |
| **Albums (Liste)** | `/albums/all` | `/albums/all` | `GET` |
| **Créer Album** | `/albums/create` | `/albums/create` | `POST` |
| **Mise à jour Album**| `/albums/update/{trackingId}` | `/albums/update/{trackingId}` | `PUT` |
| **Mise à jour Image** | `/albums/updateImage/{trackingId}` | `/albums/updateImage/{trackingId}` | `PUT` *(MinIO multipart)* |
| **Supprimer Album** | `/albums/delete/{trackingId}` | `/albums/delete/{trackingId}` | `DELETE`/`ALL` |
| **Stats - Top Like** | `/stats/songWithMostLike` | `/stats/songWithMostLike` | `GET` |
| **Stats - Écoutes** | `/stats/nbrTotalEcoute/{trackingIdSong}` | `/stats/nbrTotalEcoute/{trackingIdSong}` | `GET` |

---

## 🐳 Cas particulier : Si votre backend tourne dans Docker

- Si votre backend tourne dans un conteneur Docker avec les ports mappés (ex: `-p 8081:8081`), l'adresse `http://localhost:8081` fonctionne directement.
- Si vous lancez le frontend également dans Docker : utilisez `http://host.docker.internal:8081` pour joindre l'hôte.

---

## 🛠️ Commandes Utiles

```bash
# Vérifier la compilation TypeScript
npm run lint

# Compiler pour la production
npm run build

# Démarrer en mode production
npm start
```
