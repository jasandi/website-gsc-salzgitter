# Anleitung: Eigene Unterseiten erstellen (für Nicht-Programmierer)

Diese Anleitung erklärt dir Schritt für Schritt, wie du auf der GSC Salzgitter Website Unterseiten aktualisieren (Initiativen, Strecken, Verein) oder Neuigkeiten (News) erstellen kannst, ohne Programmieren zu müssen.

## 1. Was ist "Markdown"?
Wir nutzen für die Inhalte eine sehr einfache Schreibweise namens **Markdown** (Dateiendung `.md`). Du schreibst einfach normalen Text. Mit ein paar simplen Zeichen kannst du den Text formatieren:

- **Überschrift (sehr klein / farbig):** Setze drei Rauten: `### Farbige Info-Überschrift`
- **Mittelgroße Überschrift:** Setze zwei Rauten: `## Ein neuer Abschnitt`
- **Große Seiten-Überschrift:** Setze eine Raute vor den Text: `# Seiten-Titel`
- **Fett schreiben:** Setze zwei Sterne um ein Wort: `**Wichtiges Wort**`
- **Aufzählungen:** Setze einen Stern und ein Leerzeichen: `* Erster Punkt`

---

## 2. Wie man eine statische Unterseite bearbeitet (Verein, Strecken, Initiativen)

Wenn du die Inhalte der aktuellen Unterseiten ändern willst (z.B. Angaben zur Motocross-Strecke oder Vorstandsmitglieder anpassen):
1. Öffne den Ordner `content` und navigiere in den entsprechenden Unterordner (`strecken`, `verein` oder `initiativen`).
2. Öffne die dort bereits **existierende Markdown-Datei** (z. B. `motocross.md` oder `verein.md`).
3. Ändere den Text einfach nach deinen Wünschen ab und speichere die Datei. Fertig!

**Beispiel für eine normale Unterseite (`neue-strecke.md`):**
```text
---
titel: Die neue Supercross Strecke
bild: ../assets/strecken_bild.png
kurzbeschreibung: Hier steht ein kurzer Einleitungstext
---

Hier startet dein normaler, formatierter Text für die Website! Du kannst **fett** schreiben oder Listen anlegen.
```

*(Tipp: Wenn dein Bild im zentralen `assets`-Ordner liegt, schreibe vor den Bildnamen einfach `../assets/`. Wenn du noch gar kein Bild hast, kannst du die Zeile `bild:` auch einfach weglassen.)*

---

## 3. Wie man Neuigkeiten (News) erstellt
Neuigkeiten sind ein bisschen besonders. Sie tauchen nicht nur als eigene Seite auf, sondern landen auch automatisch als kleine Karte im "Neuigkeiten"-Schieberegler auf deiner Startseite!

1. Öffne den Ordner `content/neuigkeiten`.
2. Erstelle für deine Neuigkeit einen **komplett neuen Ordner**. Benenne ihn am besten mit dem Datum rückwärts und einem Schlagwort (z. B. `2026-04-15-ostertraining`).
3. Speicher das Foto für deinen News-Post direkt **in diesen neuen Ordner** (z. B. als `bild.jpg`).
4. Erstelle ebenfalls in diesem Ordner eine Textdatei namens `post.md`.

**Beispiel für eine Neuigkeit (`post.md`):**
```text
---
titel: Großes Ostertraining am Sonntag
datum: 15. Apr 2026
bild: bild.jpg
kurzbeschreibung: Wir laden alle Vereinsmitglieder zum gemeinsamen Eiersuchen auf der Strecke ein. Komm vorbei!
---

Hier kommt nun der ausführliche Bericht über das geplante Ostertraining...
```

---

## 4. Wie mache ich meine geschriebenen Texte sichtbar? (Der Build-Prozess)
Wenn du deine Textdatei (`.md`) fertig geschrieben und gespeichert hast, existiert diese Seite erst mal nur als purer Text im Ordner `content`. Damit die Website daraus eine schicke, stylische HTML-Seite mit deinem Layout zusammenbaut, musst du einmal kurz das Website-Skript ausführen.

1. Öffne dein Programm, in dem du Befehle eingeben kannst (das "Terminal" auf dem Mac oder direkt in Visual Studio Code).
2. Stelle sicher, dass du dich im Hauptordner der Website befindest.
3. Tippe folgenden Befehl ein und drücke Enter (Return):

   **`node buildPages.js`**

Das war's schon! Das Tool durchsucht nun automatisch die Ordner, findet deine neuen Markdown-Dateien und baut in wenigen Millisekunden die fertigen Webseiten (z. B. `strecken/neue-strecke.html`) daraus. Deine Startseite wurde ebenfalls blitzschnell mit den neuen News-Karten aktualisiert. 

(Anschließend kannst du prüfen, ob in deinem Dateisystem alles okay aussieht und deinen neuen Content einfach über deine Git-Befehle, so wie immer, zu GitHub hochladen.)
