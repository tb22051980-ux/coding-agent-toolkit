#!/usr/bin/env bash
# Baut die Android-App (Auftragsverwaltung.apk) ohne Android Studio / Gradle.
#
# Voraussetzungen (Ubuntu/Debian):  apt-get install aapt zipalign apksigner default-jdk
# Zusätzlich werden beim ersten Lauf heruntergeladen (in ./werkzeuge):
#   - dx (Dex-Compiler)  von Maven Central
#   - android.jar (API-25-Stubs) aus dem Sable/android-platforms-Repo
set -euo pipefail
cd "$(dirname "$0")"

WERKZEUGE=werkzeuge
BAU=bau
DX_JAR=$WERKZEUGE/dalvik-dx.jar
ANDROID_JAR=$WERKZEUGE/android.jar

mkdir -p "$WERKZEUGE"
[ -f "$DX_JAR" ] || curl -sSL -o "$DX_JAR" "https://repo1.maven.org/maven2/com/jakewharton/android/repackaged/dalvik-dx/9.0.0_r3/dalvik-dx-9.0.0_r3.jar"
[ -f "$ANDROID_JAR" ] || curl -sSL -o "$ANDROID_JAR" "https://raw.githubusercontent.com/Sable/android-platforms/master/android-25/android.jar"

rm -rf "$BAU"
mkdir -p "$BAU/classes" "$BAU/assets"

# Oberfläche als Asset einbetten
cp ../index.html "$BAU/assets/index.html"

echo "— Java kompilieren"
javac --release 8 -classpath "$ANDROID_JAR" -d "$BAU/classes" java/app/auftragsverwaltung/MainActivity.java

echo "— In Dalvik-Bytecode übersetzen (classes.dex)"
java -cp "$DX_JAR" com.android.dx.command.Main --dex --min-sdk-version=21 --output="$BAU/classes.dex" "$BAU/classes"

echo "— APK packen (Manifest, Ressourcen, Assets)"
aapt package -f \
  -M AndroidManifest.xml \
  -S res \
  -A "$BAU/assets" \
  -I "$ANDROID_JAR" \
  -F "$BAU/roh.apk"
(cd "$BAU" && aapt add roh.apk classes.dex >/dev/null)

echo "— Ausrichten und signieren"
zipalign -f 4 "$BAU/roh.apk" "$BAU/ausgerichtet.apk"
if [ ! -f debug.keystore ]; then
  keytool -genkeypair -keystore debug.keystore -storepass android -keypass android \
    -alias androiddebugkey -dname "CN=Android Debug,O=Android,C=DE" \
    -keyalg RSA -keysize 2048 -validity 10950
fi
apksigner sign --ks debug.keystore --ks-pass pass:android --key-pass pass:android \
  --out Auftragsverwaltung.apk "$BAU/ausgerichtet.apk"
apksigner verify Auftragsverwaltung.apk

echo
echo "Fertig: android/Auftragsverwaltung.apk"
