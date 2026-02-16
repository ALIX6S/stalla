# Toolchain Flutter + SDK Android (inclut adb) pour builder l'APK vendeur
FROM ghcr.io/cirruslabs/flutter:stable
WORKDIR /app
ENV GRADLE_USER_HOME=/cache/gradle PUB_CACHE=/cache/pub
