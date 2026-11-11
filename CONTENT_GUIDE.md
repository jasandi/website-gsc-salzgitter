# Anleitung: Inhalte & Neuigkeiten pflegen (für Nicht-Programmierer)

Die neue **GSC Salzgitter Scrollytelling-Website** basiert auf **Astro** und **GSAP**. Alle Texte für Strecken, Verein, Initiativen und Neuigkeiten liegen weiterhin als einfache **Markdown-Dateien (`.md`)** im Ordner `src/content/`.

## 1. Unterseiten bearbeiten (Strecken, Verein, Initiativen)

Alle bestehenden Texte findest du hier:
- `src/content/strecken/` (`motocross.md`, `supercross.md`, `kids.md`)
- `src/content/verein/verein.md`
- `src/content/initiativen/` (`school.md`, `kids.md`)

Jede Datei beginnt mit einem kurzen Kopfbereich (`---`):
```markdown
---
titel: Der Hüttenring
bild: /assets/mx_track.png
kurzbeschreibung: Mit einer Länge von ca. 1900 Metern ist er mit seinem harten Lehmboden anspruchsvoll...
---

Hier folgt der normale Text in Markdown...
```

## 2. Neue Neuigkeit (News) veröffentlichen

1. Lege im Ordner `src/content/neuigkeiten/` eine neue Datei an, z. B. `2026-09-01-herbsttraining.md`.
2. Speichere das zugehörige Bild im Ordner `public/assets/` (z. B. `public/assets/herbsttraining.jpg`).
3. Fülle die Markdown-Datei:

```markdown
---
titel: Großes Herbsttraining am Hüttenring
datum: 01. Sep 2026
bild: /assets/herbsttraining.jpg
kurzbeschreibung: Gemeinsames Training für alle Klassen mit offenem Fahrerlager.
---

Hier steht der ausführliche Bericht...
```

Beim nächsten Push auf GitHub baut GitHub Actions automatisch die komplette Website neu und veröffentlicht sie auf **GitHub Pages** (`gsc-salzgitter.de`).
