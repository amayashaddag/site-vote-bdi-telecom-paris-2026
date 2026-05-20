# site-vote-bdi-telecom-paris-2026

Site web React + TypeScript pour voter pour la meilleure culture culinaire du Village International de Télécom Paris 2026.

## Installation

1. Copier les variables d’environnement :

```bash
cp .env.example .env
```

2. Installer les dépendances :

```bash
npm install
```

3. Lancer le serveur de développement :

```bash
npm run dev
```

Le script `npm run dev` démarre à la fois Vite et le backend Express.

## Configuration OIDC

Remplissez `.env` avec les valeurs de votre fournisseur OIDC :

- `VITE_OIDC_AUTHORITY` : URL de l’autorité OIDC
- `VITE_OIDC_CLIENT_ID` : identifiant du client
- `VITE_OIDC_REDIRECT_URI` : URL de redirection après connexion
- `VITE_OIDC_POST_LOGOUT_REDIRECT_URI` : URL de redirection après déconnexion
- `VITE_OIDC_RESPONSE_TYPE` : généralement `code`
- `VITE_OIDC_SCOPE` : `openid profile email`

## Scripts utiles

- `npm run dev` : lance le serveur de développement
- `npm run build` : construit l’application pour la production
- `npm run preview` : prévisualise le build localement
- `npm run lint` : exécute ESLint
- `npm run format` : formate le code avec Prettier
- `npm run typecheck` : vérifie les types TypeScript