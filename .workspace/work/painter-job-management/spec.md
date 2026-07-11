# painter-job-management — Spec

## Ziel

Ein selbstständiger Malermeister (Ein-Mann-Betrieb, kein IT-Hintergrund)
braucht eine Software, die ihm die Auftragsverwaltung erleichtert:
Anfragen, Angebote, Termine, laufende Arbeiten, Rechnungen, Kunden.

## Done heißt

- App läuft ohne Installation/Server/Abo auf Handy und PC.
- Kunden und Aufträge anlegen, suchen, filtern; Status-Pipeline
  Anfrage → Angebot → Beauftragt → In Arbeit → Fertig → Bezahlt.
- Positionen mit Live-Summe (netto/USt/brutto), Kleinunternehmer-Modus.
- Angebot und Rechnung als Druck/PDF mit fortlaufender Nummer.
- Datensicherung per JSON-Export/-Import.
- Deutsche Oberfläche und Anleitung.

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
