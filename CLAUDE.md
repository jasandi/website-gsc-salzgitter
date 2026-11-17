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
3. Die Änderung als **neuen Stand ganz oben im Änderungsprotokoll** mit
   Screenshots eintragen (siehe Abschnitt 2).
4. Das Protokoll veröffentlichen, dem Nutzer **im Chat verlinken** (siehe Abschnitt 2) und **auf ausdrückliche Bestätigung warten**.
5. **Erst nach Bestätigung des Nutzers** wird der Branch in `main` zurückgeführt
   (Merge bzw. Pull Request). Ohne Freigabe: kein Merge, kein Push auf `main`.

Wünscht der Nutzer Korrekturen, werden diese im selben Branch umgesetzt, das
Protokoll samt Screenshots aktualisiert und erneut im Chat angezeigt und zur
Freigabe vorgelegt.

## 2. Änderungsprotokoll (Pflicht für jede Änderung)

Es gibt **genau ein fortlaufendes Änderungsprotokoll**. Es ist keine
Markdown-Datei, sondern eine HTML-Seite, die als Claude-Artifact unter
**immer demselben Link** veröffentlicht wird:

**https://claude.ai/artifact/CQnxeuzkmqo2pkPP4wtFHy**

Jede Änderung (und jede Korrekturrunde, die eine Änderung sichtbar verändert)
wird dort als **neuer Stand ganz oben** ergänzt. Ältere Stände bleiben
unverändert darunter stehen; nur ihr Status wird bei Bedarf aktualisiert.
Niemals ein zweites Protokoll anlegen.

```
aenderungsprotokoll/
├── protokoll.html                 ← das eine Protokoll (Quelle des Artifacts)
├── VORLAGE-eintrag.html           ← Vorlage für einen neuen Stand
└── <JJJJ-MM-TT>-<kurzer-name>/
    └── screenshots/               ← Screenshots zu diesem Stand
```

### Neuen Stand eintragen

Den `<article>`-Block aus `VORLAGE-eintrag.html` in `protokoll.html` direkt
unter dem Kommentar „NEUE EINTRÄGE HIER OBEN EINFÜGEN“ einsetzen, die
Platzhalter ersetzen und die Schritte aus dem Kommentar der Vorlage befolgen
(fortlaufende Nummer, Zeile in der Liste aller Stände oben, Klasse `neu` nur
beim obersten Eintrag). Jeder Stand enthält:

- **Nummer, Titel, Datum, Branch** (mit Link auf GitHub) und **Status**
  (`Wartet auf Freigabe` → `In main übernommen am …`)
- **Was wurde geändert?** – verständlich, auch für Nicht-Programmierer
- **Warum?** – Anlass / Wunsch des Nutzers
- **Betroffene Seiten und Dateien**
- **Screenshots** – je betroffener Seite ein Block mit **iPhone 17** und
  **Laptop** (diese beiden Formate reichen aus); die Aufnahmen der ganzen Seite
  öffnen sich per Knopf. Bei Bedarf Vorher/Nachher als zwei Blöcke.
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

Jeweils als erster Bildschirm direkt nach dem Laden (`*-ansicht.jpg`) und als
ganze Seite (`*-ganzeseite.jpg`), als JPEG komprimiert. Für einen Vorher-Vergleich das Skript zusätzlich
auf dem Stand von `main` ausführen und in `screenshots/vorher/` ablegen.

Die Screenshots selbst prüfen (Layout, Umbrüche, abgeschnittene Texte,
Kontraste, Animationen/Scrollytelling), bevor das Protokoll dem Nutzer
vorgelegt wird. Auffälligkeiten ehrlich im Protokoll vermerken.

### Protokoll veröffentlichen und im Chat zeigen (Pflicht nach jeder Änderung)

Nach **jeder** Änderung, auch nach jeder Korrekturrunde:

1. `aenderungsprotokoll/protokoll.html` mit dem Artifact-Werkzeug
   veröffentlichen, **immer mit `url` = dem Link oben**, damit kein neues
   Artifact entsteht (in einer neuen Sitzung vorher mit `action: "read"`
   lesen). `root` = `aenderungsprotokoll`, die Screenshots des neuen Stands als
   `files` mitgeben (Pfad z. B. `2026-11-20-faq/screenshots/start-laptop-ansicht.jpg`).
   Bereits veröffentlichte Screenshots älterer Stände bleiben erhalten und
   müssen nicht erneut mitgegeben werden.
2. In der Chat-Antwort den **Link zum Protokoll** nennen und den neuen Stand
   kurz zusammenfassen: was geändert wurde, welche Seiten betroffen sind,
   Branch, Prüfhinweise.
3. **Am Ende ausdrücklich um Freigabe bitten**, z. B. „Soll ich die Änderung
   nach `main` übernehmen?“
4. Nach Freigabe und Übernahme nach `main` den Status des Stands (im Eintrag
   und in der Liste oben) auf „In main übernommen am …“ setzen und erneut
   veröffentlichen.

Steht das Artifact-Werkzeug nicht zur Verfügung, die Screenshots und die Seite
als Dateien an den Nutzer senden und die Beschreibung vollständig in die
Chat-Antwort übernehmen.

## 3. Sonstiges

- `npm run build` muss fehlerfrei durchlaufen, bevor zur Freigabe vorgelegt wird.
- Texte und Commit-Nachrichten auf Deutsch.
- Das `postbuild`-Skript kopiert `dist/` ins Repository-Wurzelverzeichnis;
  dadurch entstehende Änderungen an gebauten Dateien gehören mit in den Commit.
