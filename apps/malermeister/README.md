# Auftragsverwaltung für Malermeister (Ein-Mann-Betrieb)

Eine kleine, kostenlose Auftragsverwaltung für einen selbstständigen
Malermeister ohne Angestellte. Keine Installation, kein Server, kein
Abo, keine Anmeldung: **eine einzige Datei**, die im Browser läuft —
auf dem Handy, Tablet oder PC. Alle Daten bleiben lokal auf dem Gerät.

## Loslegen (2 Minuten)

1. Die Datei [`index.html`](index.html) herunterladen (oder per E-Mail
   ans eigene Handy schicken).
2. Doppelklick / antippen — sie öffnet sich im Browser.
3. Unter **Einstellungen** einmalig die Firmendaten eintragen
   (erscheinen später auf Angeboten und Rechnungen).
4. Optional: unten in den Einstellungen **Beispieldaten laden**, um
   sich erst einmal umzusehen.

Tipp fürs Handy: die geöffnete Seite über „Zum Startbildschirm
hinzufügen“ ablegen — dann fühlt sie sich an wie eine App.

## Was die App kann

- **Übersicht (Startseite):** offene Anfragen, geplante Aufträge,
  laufende Arbeiten, offene Rechnungen mit Summe, die nächsten Termine
  und die zuletzt bearbeiteten Aufträge.
- **Aufträge:** Kunde, Titel, Termin, Beschreibung, Status-Pipeline
  (Anfrage → Angebot → Beauftragt → In Arbeit → Fertig/Rechnung offen
  → Bezahlt), Suche und Statusfilter.
- **Positionen mit automatischer Summe:** Leistung, Menge, Einheit
  (m², Std., Stk., lfm, pauschal, Liter), Einzelpreis — Netto, USt und
  Brutto werden live berechnet.
- **Angebot & Rechnung drucken:** ein Klick erzeugt ein sauberes
  Dokument mit Firmenkopf, Kundenadresse, Positionstabelle und
  Summenblock; über den Browser-Druckdialog auch als PDF speicherbar.
  Angebots-/Rechnungsnummern werden automatisch fortlaufend vergeben
  (z. B. `2026-001`) und bleiben pro Auftrag stabil.
- **Kleinunternehmer-Modus (§ 19 UStG):** in den Einstellungen
  umschaltbar; Rechnungen tragen dann den Pflichthinweis statt
  USt-Ausweis. USt-Satz und Zahlungsziel sind einstellbar.
- **Kunden:** Adresse, Telefon, E-Mail, Notizen (z. B. „Schlüssel beim
  Nachbarn“), alle Aufträge des Kunden auf einen Blick, direkter
  Absprung „+ Auftrag für diesen Kunden“.
- **Material / Einkaufsliste** und **interne Notizen** je Auftrag.
- **Datensicherung:** Export als JSON-Datei mit einem Klick, Import
  auf einem neuen Gerät. So wechselt man auch vom Handy auf den PC.

## Wichtig zu wissen

- Die Daten liegen **nur in diesem Browser auf diesem Gerät**
  (localStorage). Wer Browserdaten löscht, löscht auch die Aufträge —
  deshalb regelmäßig **Einstellungen → Sicherung herunterladen**.
- Es gibt bewusst keine Cloud und keinen Mehrbenutzerbetrieb: für
  einen Ein-Mann-Betrieb reicht ein Gerät plus Sicherungsdatei, und
  Kundendaten verlassen das Haus nicht.
- Die App ersetzt keine Steuerberatung; Pflichtangaben auf Rechnungen
  (z. B. Steuernummer, § 19-Hinweis) müssen fachlich geprüft werden.

## Technik

Eine einzelne HTML-Datei ohne Abhängigkeiten (Vanilla JS, kein Build,
kein Netzzugriff). Datenmodell: `einstellungen`, `kunden[]`,
`auftraege[]` unter dem localStorage-Schlüssel
`maler-auftragsverwaltung-v1`; die Sicherungsdatei ist genau dieses
JSON.
