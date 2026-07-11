# Auftragsverwaltung für Malermeister (Ein-Mann-Betrieb)

Eine kleine, kostenlose Auftragsverwaltung für einen selbstständigen
Malermeister ohne Angestellte: Aufträge, Kunden, Fotos von der
Baustelle, Angebote und Rechnungen. Kein Abo, keine Cloud, keine
Anmeldung — die Daten bleiben zu Hause auf dem eigenen PC.

Es gibt zwei Betriebsarten:

| | Ohne PC-Programm | Mit PC-Programm (empfohlen) |
|---|---|---|
| Start | `index.html` doppelklicken | `start-windows.bat` doppelklicken (bzw. `node server.js`) |
| Daten liegen | im Browser des einen Geräts | zentral auf dem PC |
| Handy ↔ PC | manuell per Sicherungsdatei | **automatisch im Heimnetz** |
| Fotos | ja (nur lokal) | ja, landen automatisch auf dem PC |

## Einrichtung mit PC-Programm (einmalig, ca. 5 Minuten)

1. Einmalig [Node.js](https://nodejs.org) auf dem PC installieren
   (kostenlos, „LTS“-Version, immer „Weiter“ klicken).
2. Den Ordner mit `index.html`, `server.js` und `start-windows.bat`
   auf den PC kopieren, z. B. nach `C:\Malerbetrieb`.
3. `start-windows.bat` doppelklicken. Es öffnet sich ein Fenster, das
   zwei Adressen anzeigt:
   - **Am PC öffnen:** `http://localhost:8722`
   - **Am Handy öffnen:** `http://192.168.…:8722` (gleiches WLAN nötig)
4. Die Handy-Adresse einmal im Handy-Browser öffnen und über „Zum
   Startbildschirm hinzufügen“ ablegen — fertig, fühlt sich an wie
   eine App.

Das schwarze Fenster muss laufen, solange synchronisiert werden soll.
Alle Daten und Fotos liegen im Ordner `daten` neben `server.js` — den
Ordner sichern heißt alles sichern.

## Der typische Ablauf

1. **Beim Kunden (Handy):** Neuen Auftrag anlegen, Notizen ins Feld
   tippen („Wohnzimmer Wände 62 m² streichen, Decke 28 qm spachteln,
   Anfahrt 45 €“), speichern, dann **📷 Fotos aufnehmen** (Aufmaß,
   Schäden, Farbwünsche).
2. **Zu Hause im WLAN:** Das Handy überträgt alles automatisch zum PC —
   oben rechts zeigt die App „✓ Mit PC synchron“. War der PC unterwegs
   nicht erreichbar, bleibt alles auf dem Handy gespeichert und wird
   nachgereicht, sobald das Heimnetz wieder da ist.
3. **Am PC:** Auftrag öffnen, **🪄 Positionen aus Notizen** klicken —
   die App erkennt Mengen (m², Std., Stk., lfm, Liter), Preise
   („à 12,50“ oder „45 €“) und Begriffe aus der eigenen **Preisliste**
   (Einstellungen) und macht daraus fertige Angebots-Positionen mit
   Summe. Prüfen, ggf. anpassen, **Angebot drucken** — oder später
   direkt die **Rechnung**.

Wichtig unterwegs: Die App auf dem Handy im Browser **geöffnet
lassen** (Tab nicht schließen). Neu laden funktioniert nur im
Heimnetz, weil die Seite vom PC kommt; eine bereits geöffnete App
arbeitet unterwegs normal weiter und speichert alles lokal.

## Alle Funktionen

- **Übersicht:** offene Anfragen, geplante Aufträge, laufende
  Arbeiten, offene Rechnungen mit Summe, nächste Termine.
- **Aufträge:** Status-Pipeline (Anfrage → Angebot → Beauftragt →
  In Arbeit → Fertig/Rechnung offen → Bezahlt), Suche, Statusfilter,
  Termin, Beschreibung, Material-/Einkaufsliste, interne Notizen.
- **Fotos je Auftrag:** direkt aus der Handykamera, Miniaturansichten
  mit Großansicht, automatische Übertragung zum PC.
- **Notiz-Assistent:** Notizzeilen werden zu Positionen; Preise kommen
  aus der Notiz, der Preisliste oder dem Stundensatz. Zeilen ohne
  Menge/Preis (reine Beschreibung) bleiben unangetastet.
- **Angebot & Rechnung** als Druck/PDF mit Firmenkopf, Kundenadresse,
  Positionstabelle, Summenblock und automatisch fortlaufender,
  pro Auftrag stabiler Nummer (`2026-001`, …).
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
  bitte fachlich prüfen.

## Technik

- `index.html` — die komplette App, ohne Abhängigkeiten (Vanilla JS).
  Daten im localStorage, Fotos in IndexedDB.
- `server.js` — Heimnetz-Server, nur Node.js-Bordmittel. REST-API:
  `GET/PUT /api/daten`, `POST/GET/DELETE /api/fotos`, Ablage in
  `daten/daten.json` und `daten/fotos/*.jpg` (atomares Schreiben).
- Abgleich: letzter Stand gewinnt (Zeitstempel `stand`); ausstehende
  Änderungen und Fotos werden alle 20 s nachgereicht.
