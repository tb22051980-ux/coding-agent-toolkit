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

## Ausbaustufe 5 (Alltagsfunktionen)

- Terminkalender (Monatsansicht + „Als Nächstes“), navigierbar.
- Umsatzübersicht: bezahlt je Monat/Jahr + offene Rechnungen;
  `bezahltAm` wird beim Statuswechsel auf „bezahlt“ gesetzt.
- Stundenzettel je Auftrag (`zeiten[]`): Stoppuhr + manuell, Summe →
  Position (Std. × Stundensatz).
- PDF-Ausgabe: eigener dependency-freier PDF-Erzeuger (Helvetica,
  WinAnsi, Umlaute + €), Teilen via Web Share API (Datei) mit
  Download-Fallback; Browser-Druck bleibt erhalten.
- Verifikation: smoke4.js (Kalender, Umsatz, Stundenzettel, bezahltAm,
  PDF im Chromium-Viewer + Content-Stream-Parse auf Text/Umlaute/€).

## Ausbaustufe 6 (Kaufmännisches + Abnahme)

- Rabatt je Auftrag (% oder €): zentrale `summenBerechnen(positionen,
  rabatt)` von Dialog, Druck, PDF und Umsatz gemeinsam genutzt.
- Materialverwaltung: `einstellungen.materialliste[]`; im Auftrag als
  Position einfügbar.
- Kunden-Unterschrift: Canvas → PNG in `auftrag.unterschrift`;
  Einbettung ins hand-gebaute PDF als JPEG (DCTDecode-XObject, byte-
  weiser PDF-Aufbau); auch im Browser-Druck.
- Wiederkehrende Termine: `serieAnlegen` erzeugt datierte Kopien
  (wöchentlich/14-tägig/monatlich/quartalsweise).
- Auftrag duplizieren (Ausbaustufe 5.1).
- Verifikation: smoke5.js (Rabatt %/€, Material, Unterschrift inkl.
  PDF-Bild-Einbettung im Chromium-Viewer, Serie mit Datumsprüfung);
  smoke.js/smoke2.js an neue Button-Texte angepasst; alle Suiten grün.

## Ausbaustufe 7 (Komfort)

- WLAN-Autoerkennung des PC: Server-Kennung in `/api/status`
  (app=auftragsverwaltung); Android-Brücke `AuftragsAppNative.geraeteIPs()`
  liefert den eigenen /24 für gezielten Scan; sonst Standard-Heimnetz-
  Bereiche. HTTP-Subnetz-Scan mit Parallelität + Früh-Abbruch; Auto-Suche
  beim Start (IN_APP ohne serverBasis) plus „🔍 PC suchen“-Knopf.
- Dark Mode + Designs: Token-basiertes Theme-System (`data-theme` am
  <html>), „auto“ folgt prefers-color-scheme; Designs hell/dunkel/grün/
  anthrazit/bordeaux/sand; feste #fff-Flächen auf `--karte` umgestellt;
  Auswahl in Einstellungen (`einstellungen.theme`), live + gespeichert.
- Verifikation: smoke7.js (Server-Kennung, Netzbereich-Reihenfolge,
  Auto-Verbindung beim Start, Sync danach); Theme-Sichtprüfung mehrerer
  Designs inkl. Kontrast (Listenkarten-Textfarbe gefixt); alle 7 Suiten
  grün (smoke.js-Selektor an neuen Hinweistext angepasst).

## Ausbaustufe 8 (Vertrieb: Demo + Lizenz)

- Design-Wechsel wirkt sofort auf allen Seiten: `themeWaehlen()` speichert
  die Auswahl direkt (vorher überschrieb `render()` beim Seitenwechsel die
  ungespeicherte Dropdown-Wahl mit dem alten gespeicherten Theme);
  doppelte Funktionsdefinition entfernt.
- 14-Tage-Demo: `DEMO_TAGE=14`, Startdatum in localStorage
  (`…:demostart`); `demoRestTage()`/`demoAbgelaufen()`. Nach Ablauf bleiben
  Ansehen + Sync erlaubt, aber neuer Auftrag, PDF-Ausgabe und Ausdruck
  gesperrt (`demoSperrePruefen()` öffnet stattdessen den Freischalt-Dialog).
- Freischaltung offline, namensgebunden: `lizenzSchluessel(name)` (FNV +
  djb2 über `LIZENZ_SALT|name`, Base36, `XXXX-XXXX-XXXX`); in Einstellungen
  Karte „🔑 Vollversion“. Demo-Banner (gelb Restlaufzeit / rot abgelaufen)
  in allen Ansichten außer Einstellungen.
- `lizenz-generator.html`: Verkäufer-Werkzeug, erzeugt den Schlüssel aus
  dem Kundennamen; gleicher Algorithmus/Salt wie `index.html`. Bewusst
  schlank — hält Gelegenheits-Weitergabe auf, kein harter Kopierschutz.
- Verifikation: smoke8.js (Demo aktiv 14 Tage, künstlicher Ablauf nach
  20 Tagen, Sperre neuer Auftrag, falscher Schlüssel abgelehnt, korrekter
  Schlüssel schaltet frei, Banner verschwindet, Lizenz übersteht Reload);
  alle 8 Suiten grün. APK (versionCode 9 / 1.8) und Windows-Exe neu gebaut.

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
