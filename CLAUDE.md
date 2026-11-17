# CLAUDE.md – Arbeitsregeln für dieses Repository

Website des **GSC Salzgitter e.V. im ADAC** (Astro + GSAP, statisch, Deployment über
GitHub Pages bei jedem Push auf `main` – siehe `.github/workflows/deploy.yml`).
Inhalte liegen als Markdown in `src/content/` (Details: `CONTENT_GUIDE.md`).

## 1. Grundregel: Niemals direkt auf `main` arbeiten

Jeder Push auf `main` geht **sofort live** auf www.gsc-salzgitter.de. Deshalb gilt:

1. Für jede Änderung zuerst einen **eigenen Branch** anlegen
   (z. B. `aenderung/2026-11-17-faq-arbeitsstunden`), sofern nicht bereits ein
   Arbeits-Branch vorgegeben ist.
2. Alle Änderungen dort **committen und pushen** – mit aussagekräftiger
   Commit-Nachricht auf Deutsch.
3. Für die Änderung ein **Änderungsprotokoll** mit Screenshots erstellen (siehe Abschnitt 2).
4. Das Protokoll dem Nutzer **direkt hier im Chat anzeigen** (siehe Abschnitt 2,
   „Protokoll im Chat anzeigen“) und **auf ausdrückliche Bestätigung warten**.
5. **Erst nach Bestätigung des Nutzers** wird der Branch in `main` zurückgeführt
   (Merge bzw. Pull Request). Ohne Freigabe: kein Merge, kein Push auf `main`.

Wünscht der Nutzer Korrekturen, werden diese im selben Branch umgesetzt, das
Protokoll samt Screenshots aktualisiert und erneut im Chat angezeigt und zur
Freigabe vorgelegt.

## 2. Änderungsprotokoll (Pflicht für jede Änderung)

Für jede Änderung wird ein Ordner angelegt:

```
aenderungsprotokoll/<JJJJ-MM-TT>-<kurzer-name>/
├── README.md          ← Beschreibung der Änderung (Vorlage: aenderungsprotokoll/VORLAGE.md)
└── screenshots/       ← automatisch erzeugte Screenshots
```

Zusätzlich wird in `aenderungsprotokoll/README.md` (Übersicht) eine Zeile mit
Datum, Titel, Branch und Status ergänzt.

### Inhalt der Beschreibung (`README.md` im Änderungsordner)

- **Was wurde geändert?** – verständlich, auch für Nicht-Programmierer
- **Warum?** – Anlass / Wunsch des Nutzers
- **Betroffene Seiten und Dateien**
- **Screenshots** – je betroffene Seite für **iPhone 17** und **Desktop/Laptop**
  eingebunden, idealerweise Vorher/Nachher
- **Prüfhinweise** – worauf bei der Qualitätsprüfung besonders zu achten ist
- **Status** – `Wartet auf Freigabe` → `Freigegeben am …` → `In main übernommen`

### Screenshots direkt aus dem System erzeugen

Screenshots werden **nicht** von Hand gemacht, sondern aus der tatsächlich
gebauten Website erstellt – so sieht der Nutzer, wie es live aussehen würde:

```bash
npm install
npm run build
npx astro preview --port 4321 &          # gebaute Seite lokal bereitstellen
node scripts/screenshots.mjs aenderungsprotokoll/<ordner>/screenshots / /faq
```

Das Skript (`scripts/screenshots.mjs`) erstellt für jede angegebene Seite
Aufnahmen in diesen Ansichten:

| Ansicht   | Gerät / Fenstergröße                         |
|-----------|----------------------------------------------|
| `iphone17`| iPhone 17 (Playwright-Geräteprofil, Safari/WebKit-Emulation) |
| `laptop`  | 1366 × 768                                   |
| `desktop` | 1920 × 1080                                  |

Jeweils als erster Bildschirm direkt nach dem Laden (`*-ansicht.jpg`) und als
ganze Seite (`*-ganzeseite.jpg`), als JPEG komprimiert. Für einen Vorher-Vergleich das Skript zusätzlich
auf dem Stand von `main` ausführen und in `screenshots/vorher/` ablegen.

Die Screenshots selbst prüfen (Layout, Umbrüche, abgeschnittene Texte,
Kontraste, Animationen/Scrollytelling), bevor das Protokoll dem Nutzer
vorgelegt wird. Auffälligkeiten ehrlich im Protokoll vermerken.

### Protokoll im Chat anzeigen (Pflicht nach jeder Änderung)

Ein Protokoll, das nur im Repository liegt, reicht nicht. Nach **jeder**
Änderung, auch nach jeder Korrekturrunde, wird es dem Nutzer im Chat gezeigt,
damit er es dort prüfen kann:

1. **Protokolldatei und Screenshots als Dateien an den Nutzer senden**
   (z. B. mit dem Werkzeug zum Senden von Dateien, Anzeigemodus „render“):
   die `README.md` des Änderungsordners und die `*-ansicht.jpg`-Bilder für
   iPhone 17, Laptop und Desktop jeder betroffenen Seite. Die Aufnahmen der
   ganzen Seite mitsenden, wenn sich die Änderung weiter unten auf der Seite befindet.
2. **In der Chat-Antwort zusammenfassen:** was geändert wurde, welche Seiten
   betroffen sind, Branch und Link zum Branch auf GitHub, Prüfhinweise und
   Auffälligkeiten.
3. **Am Ende ausdrücklich um Freigabe bitten**, z. B. „Soll ich die Änderung
   nach `main` übernehmen?“

Gibt es kein Werkzeug zum Senden von Dateien, die Pfade der Protokolldatei und
der Screenshots im Chat nennen und die Beschreibung vollständig in die Antwort
übernehmen.

## 3. Sonstiges

- `npm run build` muss fehlerfrei durchlaufen, bevor zur Freigabe vorgelegt wird.
- Texte und Commit-Nachrichten auf Deutsch.
- Das `postbuild`-Skript kopiert `dist/` ins Repository-Wurzelverzeichnis;
  dadurch entstehende Änderungen an gebauten Dateien gehören mit in den Commit.
