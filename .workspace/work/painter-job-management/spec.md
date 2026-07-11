# painter-job-management — Spec

## Ziel

Ein Selbstständiger mit Ein-Mann-Betrieb (kein IT-Hintergrund) braucht
eine Software, die ihm die Auftragsverwaltung erleichtert: Anfragen,
Angebote, Termine, laufende Arbeiten, Rechnungen, Kunden. Ursprünglich
für einen Malermeister gebaut; in Ausbaustufe 3 auf alle Handwerks-
Gewerke sowie Transport & Umzug verallgemeinert (App liegt jetzt unter
`apps/auftragsverwaltung/`, Exe heißt `Auftragsverwaltung.exe`).

## Ausbaustufe 3 (Verallgemeinerung)

- Branchenwahl mit Preislisten-Vorlagen (Maler, Elektro, Sanitär/
  Heizung, Garten, Transport & Umzug, Allgemein), frei anpassbar.
- Neue Einheiten in Positionen und Notiz-Parser: m³, km, kg, Karton,
  Fahrt, Tag; strengere Preiserkennung (nur „à …“ oder Betrag mit €).
- Einsatz-/Ladeadresse und Zieladresse je Auftrag, auch auf dem
  Angebots-/Rechnungsdruck („Von … Nach …“).
- Beispieldaten enthalten einen Umzugsauftrag; Texte neutralisiert.
- Speicher-Schlüssel (localStorage/IndexedDB) bewusst unverändert,
  damit bestehende Daten den Namenswechsel überleben.

## Done heißt

- App läuft ohne Installation/Server/Abo auf Handy und PC.
- Kunden und Aufträge anlegen, suchen, filtern; Status-Pipeline
  Anfrage → Angebot → Beauftragt → In Arbeit → Fertig → Bezahlt.
- Positionen mit Live-Summe (netto/USt/brutto), Kleinunternehmer-Modus.
- Angebot und Rechnung als Druck/PDF mit fortlaufender Nummer.
- Datensicherung per JSON-Export/-Import.
- Deutsche Oberfläche und Anleitung.

## Ausbaustufe 2 (Nutzer-Feedback)

- Fotos mit dem Handy aufnehmen, je Auftrag abgelegt.
- Automatische Synchronisierung im Heimnetz mit einem PC-Programm
  (`server.js`, nur Node-Bordmittel; Daten + Fotos unter `daten/`).
- Offline beim Kunden weiterarbeiten; ausstehende Änderungen und
  Fotos werden nachgereicht (Anzeige im Kopf der App).
- Notiz-Assistent: Notizzeilen → Angebots-Positionen (Mengen-,
  Preis- und Preislisten-Erkennung; Preisliste + Stundensatz in den
  Einstellungen pflegbar).

## Ausbaustufe 4 (echte Handy-Apps)

- **Android:** echte APK (`android/`): WebView mit eingebetteter
  index.html unter https://app.local; PC-API über konfigurierbare
  `serverBasis` (Einstellungen), Server per CORS freigegeben.
  Build ohne Gradle: build-apk.sh (javac + dx von Maven Central +
  aapt/zipalign/apksigner aus Ubuntu-Paketen; android.jar-Stubs von
  Sable/android-platforms) — dl.google.com ist im Proxy gesperrt.
  CI-Job `android-apk` baut identisch; Debug-Keystore eingecheckt,
  damit Updates installierbar bleiben.
- **iOS:** ohne Apple-Entwicklerkonto + Mac nicht baubar (harte
  Apple-Sperre) → Home-Bildschirm-Web-App bleibt der iPhone-Weg;
  dem User transparent kommuniziert.
- Betriebsarten der Oberfläche: SERVER_SELBST (vom PC geladen,
  relative API), IN_APP (UA-Kennung „AuftragsApp“/app.local →
  serverBasis), Einzeldatei (file://, serverBasis optional).

## Entscheidungen

- **Single-File-HTML + localStorage** statt Server-App: Zielnutzer hat
  keine Infrastruktur; Datenschutz trivial (Daten bleiben lokal);
  Verteilung = eine Datei. Bewusster Trade-off: kein Multi-Device-Sync,
  dafür Export/Import als Brücke.
- Keine externen Abhängigkeiten (offlinefähig, kein CDN).
- Beispieldaten als geführter Einstieg statt Onboarding-Assistent.

## Verifikation

Playwright-Smoke-Test (Scratchpad, nicht eingecheckt) deckt ab:
Leerzustand, Beispieldaten, Kunde/Auftrag anlegen, Live-Suche,
Summenberechnung 19 % USt, Rechnungsdruck + stabile Nummernvergabe,
Persistenz über Reload, Kleinunternehmer-Modus, Exportstruktur.

## Status

Umgesetzt in `apps/malermeister/` (index.html + README.md);
PR über Branch `claude/painter-job-management-jzi9b0`.
