# Infra

Tout tourne dans Docker : rien à installer sur la machine hors Docker (et `adb` optionnel).

| Fichier | Rôle |
|---|---|
| `docker-compose.yml` | Services `db` (MySQL 8), `api`, `web`, et `mobile` (profil, build APK) |
| `docker/api.Dockerfile` | Image de l'API Node |
| `docker/web.Dockerfile` | Serveur Vite du back-office |
| `docker/mobile.Dockerfile` | Toolchain Flutter + SDK Android |
| `scripts/up.sh` | Crée `backend/.env` si absent puis lance DB + API + web |
| `scripts/mobile.sh` | Build l'APK, l'installe en USB, `adb reverse` vers l'API |
| `scripts/down.sh` | Arrête tout (`--purge` : supprime base, caches et images) |

```bash
infra/scripts/up.sh       # web : http://localhost:5173 · API : http://localhost:4000
infra/scripts/mobile.sh   # téléphone branché en USB, débogage USB activé
infra/scripts/down.sh
```

Ports : web `5173`, API `4000`, MySQL `3307` (user `stalla` / `stalla_pass`).
