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
3. Für die Änderung ein **Änderungsprotokoll** mit Screenshots als Claude-Artifact
   erstellen (siehe Abschnitt 2).
4. Das Protokoll veröffentlichen, dem Nutzer **im Chat verlinken** (siehe Abschnitt 2) und **auf ausdrückliche Bestätigung warten**.
5. **Erst nach Bestätigung des Nutzers** wird der Branch in `main` zurückgeführt
   (Merge bzw. Pull Request). Ohne Freigabe: kein Merge, kein Push auf `main`.

Wünscht der Nutzer Korrekturen, werden diese im selben Branch umgesetzt, das
Protokoll samt Screenshots aktualisiert und erneut im Chat angezeigt und zur
Freigabe vorgelegt.

## 2. Änderungsprotokoll (Pflicht für jede Änderung)

Das Änderungsprotokoll ist **keine Markdown-Datei**, sondern eine
**HTML-Seite, die als Claude-Artifact veröffentlicht wird**. So kann der Nutzer
es mit allen Screenshots direkt in Claude ansehen.

Für jede Änderung wird ein Ordner angelegt:

```
aenderungsprotokoll/<JJJJ-MM-TT>-<kurzer-name>/
├── protokoll.html     ← Protokollseite (Vorlage: aenderungsprotokoll/VORLAGE.html)
└── screenshots/       ← automatisch erzeugte Screenshots
```

In `aenderungsprotokoll/README.md` (Übersicht) wird eine Zeile mit Datum,
Titel, Branch, Status und dem **Link zum Artifact** ergänzt.

### Inhalt der Protokollseite

Die Vorlage `VORLAGE.html` kopieren und alle Platzhalter ersetzen:

- **Titel, Datum, Branch** (mit Link auf GitHub) und **Status**
  (`Wartet auf Freigabe` → `Freigegeben am …` → `In main übernommen am …`)
- **Was wurde geändert?** – verständlich, auch für Nicht-Programmierer
- **Warum?** – Anlass / Wunsch des Nutzers
- **Betroffene Seiten und Dateien**
- **Screenshots** – je betroffener Seite ein Block mit **iPhone 17**, **Laptop**
  und **Desktop**; die Aufnahmen der ganzen Seite öffnen sich per Knopf.
  Bei Bedarf Vorher/Nachher als zwei Blöcke.
- **Prüfhinweise** – worauf bei der Qualitätsprüfung zu achten ist,
  Auffälligkeiten ehrlich nennen

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
| `iphone17`| iPhone 17 (Playwright-Geräteprofil; WebKit, falls installiert, sonst Chromium) |
| `laptop`  | 1366 × 768                                   |
| `desktop` | 1920 × 1080                                  |

Jeweils als erster Bildschirm direkt nach dem Laden (`*-ansicht.jpg`) und als
ganze Seite (`*-ganzeseite.jpg`), als JPEG komprimiert. Für einen Vorher-Vergleich das Skript zusätzlich
auf dem Stand von `main` ausführen und in `screenshots/vorher/` ablegen.

Die Screenshots selbst prüfen (Layout, Umbrüche, abgeschnittene Texte,
Kontraste, Animationen/Scrollytelling), bevor das Protokoll dem Nutzer
vorgelegt wird. Auffälligkeiten ehrlich im Protokoll vermerken.

### Protokoll als Artifact veröffentlichen und im Chat zeigen (Pflicht nach jeder Änderung)

Nach **jeder** Änderung, auch nach jeder Korrekturrunde:

1. `protokoll.html` mit dem Artifact-Werkzeug veröffentlichen. Alle verwendeten
   Screenshots als zugehörige Dateien mitgeben (`files`, Pfade
   `screenshots/<datei>.jpg`, `root` = Änderungsordner), damit sie in der Seite
   angezeigt werden. Bei einer Korrekturrunde dieselbe Datei erneut
   veröffentlichen, damit der Link gleich bleibt.
2. In der Chat-Antwort den **Link zum Artifact** nennen und kurz
   zusammenfassen: was geändert wurde, welche Seiten betroffen sind, Branch,
   Prüfhinweise.
3. **Am Ende ausdrücklich um Freigabe bitten**, z. B. „Soll ich die Änderung
   nach `main` übernehmen?“
4. Nach Freigabe und Übernahme nach `main` den Status in der Seite auf
   „In main übernommen am …“ setzen und erneut veröffentlichen.

Steht das Artifact-Werkzeug nicht zur Verfügung, die Screenshots und die Seite
als Dateien an den Nutzer senden und die Beschreibung vollständig in die
Chat-Antwort übernehmen.

## 3. Sonstiges

- `npm run build` muss fehlerfrei durchlaufen, bevor zur Freigabe vorgelegt wird.
- Texte und Commit-Nachrichten auf Deutsch.
- Das `postbuild`-Skript kopiert `dist/` ins Repository-Wurzelverzeichnis;
  dadurch entstehende Änderungen an gebauten Dateien gehören mit in den Commit.
