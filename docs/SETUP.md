# Installation

## 1. Stack complète (Docker)

```bash
infra/scripts/up.sh      # crée backend/.env depuis .env.example si absent
docker compose -f infra/docker-compose.yml ps
```

| Variable (`backend/.env`) | Rôle |
|---|---|
| `JWT_SECRET` | Clé de signature des tokens (à changer) |
| `WEB_BASE_URL` | URL du web, utilisée dans les liens d'email |
| `ALLOW_ADMIN_SELF_REGISTRATION` | `false` : un seul admin possible via l'API |
| `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` | Envoi d'emails (optionnel : sans clé, le mot de passe initial n'est renvoyé que dans la réponse de l'API) |

Les variables `DB_*` sont fournies par `infra/docker-compose.yml`.
Arrêt : `infra/scripts/down.sh` (`--purge` pour supprimer la base et les caches).

## 2. Application mobile (téléphone USB)

Prérequis : débogage USB activé sur le téléphone.

```bash
infra/scripts/mobile.sh                              # API via adb reverse (localhost:4000)
infra/scripts/mobile.sh http://192.168.1.10:4000/api # ou API joignable en Wi-Fi
```

Le script build l'APK dans Docker (Flutter + SDK Android), l'installe puis lance `adb reverse tcp:4000 tcp:4000`.
Cette redirection est perdue au débranchement du câble : relancer `adb reverse tcp:4000 tcp:4000`.

## 3. Développement sans Docker

```bash
cd backend && npm install && npm run dev      # nécessite MySQL 8
cd stalla_web && npm install && npm run dev   # VITE_API_BASE_URL pour changer l'API
```

## Dépannage

- **401 / « Token manquant ou invalide »** : web ou mobile pointe vers une autre API, ou le token a expiré.
- **Lien de réinitialisation inaccessible depuis le téléphone** : `WEB_BASE_URL` ne doit pas être `localhost`.
- **Logs API** : `docker compose -f infra/docker-compose.yml logs -f api`.
