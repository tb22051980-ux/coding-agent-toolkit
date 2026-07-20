# Auftragsverwaltung für Handwerk, Transport & Umzug (Ein-Mann-Betrieb)

Eine kleine, kostenlose Auftragsverwaltung für Selbstständige mit
kleinem Betrieb — Maler, Elektriker, Sanitär, Gartenbau, Umzugs- und
Transportunternehmer und alle anderen Gewerke: Aufträge, Kunden,
Fotos vom Einsatzort, Angebote und Rechnungen. Kein Abo, keine Cloud,
keine Anmeldung — die Daten bleiben zu Hause auf dem eigenen PC.

Es gibt zwei Betriebsarten:

| | Ohne PC-Programm | Mit PC-Programm (empfohlen) |
|---|---|---|
| Start | `index.html` doppelklicken | `Auftragsverwaltung.exe` doppelklicken |
| Daten liegen | im Browser des einen Geräts | zentral auf dem PC |
| Handy ↔ PC | manuell per Sicherungsdatei | **automatisch im Heimnetz** |
| Fotos | ja (nur lokal) | ja, landen automatisch auf dem PC |

## Einrichtung mit PC-Programm (einmalig, ca. 5 Minuten)

1. `Auftragsverwaltung.exe` herunterladen — sie wird automatisch
   gebaut und liegt bei den GitHub-**Releases** dieses Projekts (bzw.
   als Artefakt des Workflows „Auftragsverwaltung Windows-Exe bauen“).
   Es muss nichts weiter installiert werden.
2. Die Datei in einen eigenen Ordner legen, z. B. `C:\MeinBetrieb`,
   und doppelklicken. Windows fragt beim ersten Start eventuell nach
   („Weitere Informationen“ → „Trotzdem ausführen“ und ggf. die
   Firewall-Freigabe fürs Heimnetz erlauben). Der Browser öffnet sich
   automatisch; im schwarzen Fenster stehen zwei Adressen:
   - **Am PC öffnen:** `http://localhost:8722`
   - **Am Handy öffnen:** `http://192.168.…:8722` (gleiches WLAN nötig)
3. Handy einrichten — je nach System:
   - **Android — echte App (empfohlen):** `Auftragsverwaltung.apk`
     aufs Handy übertragen (z. B. per USB, Messenger an sich selbst
     oder Download) und antippen. Android fragt einmalig, ob die
     Installation aus dieser Quelle erlaubt werden soll → zulassen.
     Die App **sucht den PC beim ersten Start automatisch im WLAN** und
     verbindet sich selbst; sonst unter **Einstellungen → Verbindung
     zum PC-Programm → „🔍 PC automatisch suchen“** (oder die Adresse
     aus dem schwarzen Fenster von Hand eintragen). Die App startet ab
     dann **auch unterwegs ohne Heimnetz** sofort und gleicht
     automatisch ab, sobald der PC erreichbar ist.
   - **Android — ohne Installation:** Adresse in Chrome öffnen →
     Menü ⋮ → „App installieren“ (Web-App, braucht das Heimnetz zum
     Laden).
   - **iPhone/iPad (Safari):** Adresse in **Safari** öffnen →
     **Teilen-Knopf** (Viereck mit Pfeil) → **„Zum Home-Bildschirm“**.
     Auf dem iPhone geht das nur mit Safari. Eine „echte“ iOS-App
     ließe sich nur mit Apple-Entwicklerkonto (99 €/Jahr) und Mac
     erstellen — der Home-Bildschirm-Weg ist Apples offizieller Weg
     für Betriebs-Apps ohne App Store.
4. In den **Einstellungen** die eigene **Branche** wählen und
   „Preisliste mit Branchen-Vorlage füllen“ klicken — dann die Preise
   an den eigenen Betrieb anpassen.
5. Optional: eine Verknüpfung der Exe in den Windows-Autostart legen
   (Windows-Taste + R → `shell:startup`), dann läuft die
   Synchronisierung nach jedem PC-Start automatisch.

Das schwarze Fenster muss laufen, solange synchronisiert werden soll.
Alle Daten und Fotos liegen im Ordner `daten` neben der Exe (falls
dort nicht geschrieben werden darf, im Benutzerprofil unter
`Auftragsverwaltung`) — diesen Ordner sichern heißt alles sichern.

Alternative ohne Exe: [Node.js](https://nodejs.org) installieren und
`start-windows.bat` doppelklicken (startet `node server.js`).

## Der typische Ablauf

1. **Beim Kunden (Handy):** Neuen Auftrag anlegen, Notizen ins Feld
   tippen — Handwerk („Wände 62 m² streichen, Anfahrt 45 €“) genauso
   wie Umzug („3 Helfer 8 Std, 40 Kartons, LKW 1 Tag, Halteverbot“) —
   speichern, dann **📷 Fotos aufnehmen** (Aufmaß, Ladung, Schäden).
   Bei Transport/Umzug: **Ladeadresse und Zieladresse** eintragen.
2. **Zu Hause im WLAN:** Das Handy überträgt alles automatisch zum PC —
   oben rechts zeigt die App „✓ Mit PC synchron“. War der PC unterwegs
   nicht erreichbar, bleibt alles auf dem Handy gespeichert und wird
   nachgereicht, sobald das Heimnetz wieder da ist.
3. **Am PC:** Auftrag öffnen, **🪄 Positionen aus Notizen** klicken —
   die App erkennt Mengen (m², m³, Std., Stk., lfm, km, kg, Kartons,
   Fahrten, Tage, Liter), Preise („à 12,50“ oder „45 €“) und Begriffe
   aus der eigenen **Preisliste** (Einstellungen) und macht daraus
   fertige Angebots-Positionen mit Summe. Prüfen, ggf. anpassen,
   **Angebot drucken** — oder später direkt die **Rechnung**.

Wichtig unterwegs: Die App auf dem Handy im Browser **geöffnet
lassen** (Tab nicht schließen). Neu laden funktioniert nur im
Heimnetz, weil die Seite vom PC kommt; eine bereits geöffnete App
arbeitet unterwegs normal weiter und speichert alles lokal.

## Alle Funktionen

- **Übersicht:** offene Anfragen, geplante Aufträge, laufende
  Arbeiten, offene Rechnungen mit Summe, nächste Termine.
- **Aufträge:** Status-Pipeline (Anfrage → Angebot → Beauftragt →
  In Arbeit → Fertig/Rechnung offen → Bezahlt), Suche, Statusfilter,
  Termin, Einsatz-/Ladeadresse und Zieladresse, Beschreibung,
  Material-/Packliste, interne Notizen.
- **Branchen-Vorlagen:** fertige Preislisten für Maler, Elektro,
  Sanitär/Heizung, Garten, Transport & Umzug, Allgemein — als
  Startpunkt, frei anpassbar.
- **Fotos je Auftrag:** direkt aus der Handykamera, Miniaturansichten
  mit Großansicht, automatische Übertragung zum PC.
- **Notiz-Assistent:** Notizzeilen werden zu Positionen; Preise kommen
  aus der Notiz, der Preisliste oder dem Stundensatz. Zeilen ohne
  Menge/Preis (reine Beschreibung) bleiben unangetastet.
- **Terminkalender:** Monatsansicht aller Auftragstermine plus Liste
  „Als Nächstes“; Tippen auf einen Termin öffnet den Auftrag.
- **Umsatzübersicht:** bezahlte Rechnungen je Monat (Jahressumme) und
  offene Rechnungen auf einen Blick. „Bezahlt“ zählt ab dem Tag, an
  dem der Auftrag auf „Bezahlt“ gesetzt wird.
- **Stundenzettel je Auftrag:** Arbeitszeiten per Start/Stopp-Stoppuhr
  oder von Hand erfassen; die Summe lässt sich mit einem Klick als
  Position (Std. × Stundensatz) übernehmen.
- **Angebot & Rechnung** als **PDF** (direkt per WhatsApp/E-Mail
  teilen oder herunterladen) und als Browser-Druck — mit Firmenkopf,
  Kundenadresse, Von-/Nach-Adressen, Positionstabelle, Summenblock und
  automatisch fortlaufender, pro Auftrag stabiler Nummer (`2026-001`, …).
- **Rabatt** je Auftrag (in % oder als €-Betrag) — wirkt korrekt auf
  Netto, USt und Brutto und erscheint auf Angebot/Rechnung.
- **Materialverwaltung:** Materialliste mit Preisen (Einstellungen);
  im Auftrag über „📦 Material“ mit Menge als Position einfügen.
- **Kunden-Unterschrift:** der Kunde unterschreibt die Abnahme direkt
  auf dem Display; die Unterschrift erscheint auf Rechnung/Ausdruck
  und im geteilten PDF.
- **Wiederkehrende Termine (Serie):** aus einem Auftrag mit einem Klick
  regelmäßige Folgetermine (wöchentlich bis vierteljährlich) anlegen —
  praktisch für Wartung und Pflege.
- **Auftrag duplizieren:** bestehenden Auftrag als Vorlage kopieren.
- **PC automatisch im WLAN finden:** die Handy-App sucht das laufende
  PC-Programm selbständig (kein manuelles Eintippen der IP nötig).
- **Dark Mode & Designs:** unter Einstellungen → 🎨 Design; „Automatisch“
  folgt der Hell-/Dunkel-Einstellung des Geräts, dazu mehrere Farbwelten
  (Blau, Grün, Anthrazit, Bordeaux, Sand) — in App und am PC.
- **14-Tage-Demo & Freischaltung:** die App läuft 14 Tage voll; danach
  bleiben Ansehen und Synchronisieren erlaubt, aber neue Aufträge sowie
  PDF/Ausdruck erst nach Freischalten der Vollversion (Einstellungen →
  🔑 Vollversion). Der Verkäufer erzeugt den Schlüssel aus dem Firmennamen
  des Kunden mit `lizenz-generator.html`.
- **Kleinunternehmer-Modus (§ 19 UStG)** umschaltbar; USt-Satz,
  Zahlungsziel und Stundensatz einstellbar.
- **Kunden** mit Adresse, Kontakt, Notizen und allen Aufträgen.
- **Datensicherung** zusätzlich per JSON-Export/-Import.

## Wichtig zu wissen

- Ohne PC-Programm liegen die Daten nur im Browser des einen Geräts —
  dann regelmäßig **Einstellungen → Sicherung herunterladen**.
- Die Synchronisierung ist für **einen** Benutzer gedacht: Es gewinnt
  immer der zuletzt gespeicherte Stand. Nicht gleichzeitig am PC und
  am Handy denselben Auftrag bearbeiten.
- Der Server ist nur für das eigene Heimnetz gedacht (keine
  Anmeldung, keine Verschlüsselung) — nicht ins Internet freigeben.
- Die App ersetzt keine Steuerberatung; Pflichtangaben auf Rechnungen
  bitte fachlich prüfen. Die Vorlagen-Preise sind nur Platzhalter.

## Technik

- `index.html` — die komplette App, ohne Abhängigkeiten (Vanilla JS).
  Daten im localStorage, Fotos in IndexedDB. Im Server-Modus als
  installierbare Web-App (Manifest + Icons, `display: standalone`)
  für Android und iOS.
- `server.js` — Heimnetz-Server, nur Node.js-Bordmittel. REST-API:
  `GET/PUT /api/daten`, `POST/GET/DELETE /api/fotos`, Ablage in
  `daten/daten.json` und `daten/fotos/*.jpg` (atomares Schreiben).
- `Auftragsverwaltung.exe` — derselbe Server als eigenständiges
  Windows-Programm (Node „Single Executable Application“ mit
  eingebetteter `index.html`, siehe `sea-config.json`); gebaut vom
  Workflow `.github/workflows/auftragsverwaltung-exe.yml`. Ein
  Release entsteht beim Taggen mit `auftragsverwaltung-v*`.
- `android/` — echte Android-App (`Auftragsverwaltung.apk`): ein
  WebView lädt die eingebettete `index.html` unter `https://app.local`
  (eigener sicherer Ursprung → localStorage/IndexedDB stabil) und
  spricht die PC-API über die in den Einstellungen hinterlegte
  Adresse an (der PC-Server erlaubt das per CORS). Gebaut ohne
  Gradle/Android Studio: `android/build-apk.sh` (aapt, dx, zipalign,
  apksigner); derselbe Weg läuft im CI-Job `android-apk`. Signiert
  mit dem eingecheckten Debug-Schlüssel (`android/debug.keystore`,
  Passwort „android“) — nur für Eigenvertrieb gedacht; Updates müssen
  mit demselben Schlüssel signiert sein, sonst verlangt Android eine
  Neuinstallation.
- Abgleich: letzter Stand gewinnt (Zeitstempel `stand`); ausstehende
  Änderungen und Fotos werden alle 20 s nachgereicht.
- `lizenz-generator.html` — **nur für den Verkäufer.** Erzeugt aus dem
  Firmennamen des Kunden den namensgebundenen Freischalt-Schlüssel
  (gleicher Algorithmus wie in `index.html`, `LIZENZ_SALT` muss
  übereinstimmen). Lokal im Browser öffnen, nicht an Kunden weitergeben.
  Die Prüfung ist bewusst schlank (offline, ohne Server); sie hält
  Gelegenheits-Weitergabe auf, ist aber kein Kopierschutz gegen
  technisch versierte Nutzer.
