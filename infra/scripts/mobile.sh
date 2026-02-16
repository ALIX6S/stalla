#!/usr/bin/env sh
# Build l'APK dans Docker, l'installe sur le téléphone USB et redirige l'API.
# Usage : infra/scripts/mobile.sh [API_BASE_URL]   (défaut : http://localhost:4000/api via adb reverse)
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
export API_BASE_URL="${1:-http://localhost:4000/api}"
docker compose -f "$ROOT/infra/docker-compose.yml" --profile mobile run --rm mobile
APK=build/app/outputs/flutter-apk/app-debug.apk

if command -v adb >/dev/null 2>&1; then
  # Signature différente (autre clé debug) : désinstalle puis réinstalle
  adb install -r "$ROOT/stalla_mobile/$APK" || {
    adb uninstall com.example.stalla_mobile && adb install "$ROOT/stalla_mobile/$APK"; }
  adb reverse tcp:4000 tcp:4000
else
  # adb fourni par l'image Flutter (accès USB requis)
  docker run --rm --privileged --network host -v /dev/bus/usb:/dev/bus/usb \
    -v "$ROOT/stalla_mobile:/app" stalla-mobile-builder \
    sh -c "adb wait-for-device && adb install -r /app/$APK && adb reverse tcp:4000 tcp:4000"
fi
echo "APK installé. Relancer 'adb reverse tcp:4000 tcp:4000' après chaque rebranchement du câble."
