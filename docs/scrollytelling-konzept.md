# Scrollytelling 2.0 — Konzept & Implementationsplan

Überarbeitung der Abschnitte **Termine**, **Verein** und **Initiativen**.
Leitprinzip: *Desktop pinnt, Mobil scrollt nativ* — eine gemeinsame Engine für beides.

---

## 1. Ist-Zustand

### Was heute existiert

| Abschnitt | Klasse | Engine | Höhe | Zustand |
|---|---|---|---|---|
| Training | `.interactive-timetable-section` | `initInteractiveTimetableSections` | `200vh` | Nur Fortschrittsbalken |
| Termine | `.interactive-stepped-section` | `initSteppedVerticalScroll` | `400vh`, dynamisch überschrieben | Platzhalterdaten, Debug-Overlay aktiv |
| Strecken | `.interactive-track-section` | `initInteractiveTrackSections` | `480vh` | Funktioniert, sauberstes Muster |
| Verein | `.section` | — | auto | Kein Scrollytelling |
| Initiativen | `.interactive-story-section` | `initInteractiveStorySections` | `480vh` | Wort-Füll-Effekt, aufwendigste Engine |

Alle vier Engines berechnen denselben Fortschrittswert:

```js
const scrolled = -rect.top;
const progress = Math.max(0, Math.min(1, scrolled / (rect.height - window.innerHeight)));
```

### Konkrete Probleme

**Blocker (unabhängig vom Redesign zu beheben)**

1. **Debug-Overlay ist live.** `js/script.js:776–791` erzeugt ein rotes Kästchen mit Messwerten, `:827–830` aktualisiert es bei jedem Frame. Für Besucher sichtbar.
2. **Termine enthält Platzhalter.** „Arbeitseinsatz", „Sommerfest", „Tag der offenen Tür" statt der echten Saisontermine.

**Strukturell**

3. **Feste Scrollhöhen.** `480vh` bedeutet auf einem iPhone rund fünf Bildschirmlängen Daumenarbeit für drei Karten — unabhängig davon, wie viel Inhalt tatsächlich da ist.
4. **Kein `prefers-reduced-motion`.** Weder im CSS noch im JS. Nutzer mit aktivierter Bewegungsreduktion bekommen die volle Animation.
5. **Vier Engines, eine Formel.** Jede Änderung am Scrollverhalten muss an vier Stellen nachgezogen werden.
6. **Messhack für Safari.** `calculateRows()` versucht bis zu 20-mal im 50-ms-Takt zu messen, weil Safari Layout außerhalb des Viewports verzögert (`js/script.js:735–744`).
7. **Teure Wort-Animation.** Der Füll-Effekt in Initiativen schaltet pro Frame Klassen an *jedem* Wort-Span einzeln (`js/script.js:938–944`). Bei ~40 Wörtern × 3 Kacheln sind das bis zu 120 DOM-Schreibzugriffe pro Frame.
8. **`100dvh` + sticky auf Mobil.** Beim Ein- und Ausblenden der Browserleiste ändert sich die Viewporthöhe, der gepinnte Container springt.
9. **Kein JS-Fallback.** Schlägt das Skript fehl, sind die Kacheln in Initiativen dauerhaft `opacity: 0` — der Abschnitt ist leer.

---

## 2. Zielbild

### Adaptive Regel

```
Gepinnt wird nur, wenn ALLE Bedingungen erfüllt sind:
  • Viewport ≥ 768px
  • Viewport-Höhe ≥ 600px
  • prefers-reduced-motion: no-preference
  • JavaScript läuft

Sonst: normaler Dokumentfluss, Inhalte erscheinen beim Eintreten.
```

Das ist keine Notlösung, sondern für Mobil die bessere Variante: kürzere Wege, kein Sticky-Ruckeln, native Scroll-Performance. Der Inhalt bleibt identisch — nur die Inszenierung unterscheidet sich.

### Gemeinsame Engine

Eine Datei, ein Scroll-Listener, ein `requestAnimationFrame`-Loop. Szenen melden sich per Attribut an:

```html
<section id="termine" data-scene="timeline" data-scene-steps="auto">
```

Die Engine übernimmt Messung, Fortschrittsberechnung, Gating und Aufräumen. Jede Szene liefert nur noch eine `render(progress)`-Funktion.

---

## 3. Die drei Abschnitte im Detail

### 3.1 Termine — „Saison-Achse"

**Idee:** Links eine vertikale Monatsleiste, die den aktuellen Monat mitzieht. Rechts die Termine, die zeilenweise nach oben wandern. Der Nutzer sieht jederzeit, wo im Jahr er sich befindet.

```
┌─────────────────────────────────────────────┐
│  Kommende Termine                           │
├──────────┬──────────────────────────────────┤
│   APR    │  ┌────────────────────────────┐  │
│   MAI    │  │ 09 APR  GSChool Lehrgang   │  │
│ ▸ JUN ◂  │  ├────────────────────────────┤  │
│   JUL    │  │ 04 JUN  Freies SX Training │  │ ← aktiv
│   AUG    │  ├────────────────────────────┤  │
│   SEP    │  │ 21 JUN  Vereinsrennen Kids │  │
│          │  └────────────────────────────┘  │
└──────────┴──────────────────────────────────┘
```

**Desktop:** Gepinnt. Fortschritt verschiebt die Terminliste in Zeilenschritten (Logik aus `initSteppedVerticalScroll`, aber ohne Messhack — siehe unten). Der Monat in der Leiste, zu dem die oberste sichtbare Zeile gehört, wird orange hervorgehoben.

**Mobil:** Kein Pinning. Monatsleiste wird zu einer horizontal scrollbaren Chip-Reihe, die unter der Navigation klebt. Termine als normale Liste, jede Zeile faded beim Eintreten ein.

**Rückbau der Filter:** Die Filter-Chips (Lehrgänge / Training / Rennen) aus der vorherigen Iteration kommen zurück. Wichtig: Beim Filterwechsel muss die Engine neu messen, sonst stimmt die Schrittzahl nicht mehr — dafür bekommt die Engine eine öffentliche `refresh()`-Methode.

**Datenherkunft:** Statt Termine im HTML zu pflegen, eine Datei `content/termine.json`. `buildPages.js` rendert daraus die Zeilen zwischen zwei Markern — analog zum bestehenden News-Mechanismus. Die Auto-Expiry-Logik für vergangene Termine bleibt erhalten.

---

### 3.2 Verein — „Zeitstrahl 1985 bis heute"

**Idee:** Der Abschnitt bekommt erstmals eine Dramaturgie. Links bleibt eine große Jahreszahl mit Bild stehen, rechts laufen die Meilensteine durch. Die Jahreszahl zählt beim Wechsel hoch.

```
┌──────────────────────┬──────────────────────┐
│                      │  ○ 1985              │
│      ┌────────┐      │    Gründung          │
│      │  1985  │      │                      │
│      │ [Bild] │      │  ● Erfolge           │
│      └────────┘      │    Vizeweltmeister,  │
│                      │    US Supercross     │
│   sticky, wechselt   │                      │
│   mit Fortschritt    │  ○ 2025 ADAC         │
│                      │  ○ Heute — 600       │
└──────────────────────┴──────────────────────┘
```

**Vier Meilensteine** (alle aus vorhandenem Text, nichts erfunden):

| Jahr | Titel | Inhalt |
|---|---|---|
| 1985 | Gründung | Der Verein wird gegründet |
| — | Erfolge | Ein ehemaliger Vizeweltmeister und ein US-Supercross-Fahrer |
| 2025 | ADAC Ortsclub | Zusammenhalt, Sicherheitsstandards, Ehrenamt |
| heute | 600 Mitglieder | Darunter über 140 Kinder und Jugendliche |

**Kennzahlenleiste** am Ende des Abschnitts, Zahlen zählen einmalig beim Sichtbarwerden hoch:

```
   1985          600+           140+            3
gegründet    Mitglieder    Jugendliche     Strecken
```

**Desktop:** Gepinnt, linke Spalte wechselt Bild und Jahreszahl, rechte Spalte scrollt.
**Mobil:** Klassischer vertikaler Zeitstrahl — durchgehende Linie links, Punkte an den Meilensteinen, Karten daneben. Kein Pinning, reines Reveal beim Eintreten.

**Bildmaterial:** Vorhanden ist `assets/verein_img.jpeg`. Für vier Meilensteine wären drei weitere Bilder schön — solange sie fehlen, nutzt die linke Spalte eine typografische Darstellung (große Jahreszahl auf dunklem Grund mit Orange-Akzent), die auch ohne Bild trägt.

---

### 3.3 Initiativen — „Karten-Stapel"

**Idee:** Statt Karten, die ein- und ausgeblendet werden, stapeln sie sich sichtbar übereinander. Die vorherige Karte bleibt am oberen Rand angeschnitten stehen und wird leicht kleiner — man sieht, wie viel noch kommt.

```
        ┌──────────────────────────┐  ← GSC School (skaliert, dunkler)
      ┌─┴────────────────────────┬─┘
      │  Cross Kids              │     ← aktiv, volle Größe
      │  [Bild]  Text            │
      └──────────────────────────┘
        ┌──────────────────────────┐  ← Girlsday (wartet unten)
```

**Desktop:** Gepinnt. Jede Karte fährt von unten ein, die vorherige rutscht nach oben, verkleinert sich auf `scale(0.94)` und dunkelt ab. Kein Ausblenden auf `opacity: 0` mehr — der Stapel bleibt sichtbar.

**Mobil:** Kein Pinning, kein Stapel. Die drei Karten stehen untereinander im normalen Fluss und erscheinen beim Eintreten. Bild oben, Text darunter.

**Wort-Füll-Effekt neu gebaut.** Statt Klassen an einzelnen Spans zu schalten, ein einziger CSS-Custom-Property-Schreibvorgang pro Frame:

```css
.story-fill-text {
  background-image: linear-gradient(90deg, #fff 0%, #fff var(--fill), rgba(255,255,255,.28) var(--fill));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```

```js
el.style.setProperty('--fill', (p * 100).toFixed(1) + '%');
```

Statt bis zu 120 DOM-Schreibzugriffen pro Frame genau einer pro Karte. Nebeneffekt: Das Aufteilen des Textes in `<span class="word">` entfällt komplett — der Text bleibt für Screenreader und Übersetzer unversehrt.

---

## 4. Technische Umsetzung

### 4.1 Die Engine

Neue Datei `js/scroll-scenes.js`, eingebunden **vor** `script.js`.

```js
const ScrollScenes = (() => {
  const scenes = [];
  let ticking = false;

  const mqDesktop = window.matchMedia('(min-width: 768px) and (min-height: 600px)');
  const mqMotion  = window.matchMedia('(prefers-reduced-motion: no-preference)');
  const canPin = () => mqDesktop.matches && mqMotion.matches;

  function register(el, { render, measure, stepVh = 60 }) {
    const scene = { el, render, measure, stepVh, steps: 0, pinned: false };
    scenes.push(scene);
    layout(scene);
    return scene;
  }

  // Höhe aus dem Inhalt ableiten statt fest zu setzen
  function layout(scene) {
    const pin = canPin();

    if (!pin) {
      scene.el.classList.remove('is-pinned');
      scene.el.classList.add('is-static');
      scene.el.style.height = '';
      scene.render?.(1, scene);          // Endzustand: alles sichtbar
      scene.pinned = false;
      return;
    }

    scene.el.classList.add('is-pinned');
    scene.el.classList.remove('is-static');
    scene.steps = scene.measure ? scene.measure(scene) : 1;
    scene.el.style.height = (100 + scene.steps * scene.stepVh) + 'vh';
    scene.pinned = true;
  }

  function update() {
    for (const scene of scenes) {
      if (!scene.pinned) continue;
      const rect = scene.el.getBoundingClientRect();

      // Nur rechnen, wenn die Szene den Viewport berührt
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

      const distance = rect.height - window.innerHeight;
      if (distance <= 0) continue;

      const progress = Math.min(1, Math.max(0, -rect.top / distance));
      scene.render(progress, scene);
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }

  function refresh() { scenes.forEach(layout); update(); }

  window.addEventListener('scroll', onScroll, { passive: true });
  mqDesktop.addEventListener('change', refresh);
  mqMotion.addEventListener('change', refresh);

  // Breitenänderung neu messen, reine Höhenänderung (Browserleiste) ignorieren
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth !== lastW) { lastW = window.innerWidth; refresh(); }
  }, { passive: true });

  // Ersetzt den Safari-Messhack: misst erst, wenn Layout wirklich steht
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => refresh());
    scenes.forEach(s => ro.observe(s.el));
  }

  return { register, refresh, update };
})();
```

Der wichtigste Unterschied zur heutigen Lösung steckt in `layout()`: Die Scrollhöhe entsteht aus dem gemessenen Inhalt, nicht aus einer Konstante. Zwei Termine ergeben eine kurze Sektion, zwölf eine längere.

**`measure` pro Szene:**

```js
// Termine: wie viele Zeilen passen nicht ins Bild?
measure: (scene) => {
  const rows    = scene.el.querySelectorAll('.agenda-row:not(.is-hidden)');
  const rowH    = rows[1] ? rows[1].offsetTop - rows[0].offsetTop : rows[0]?.offsetHeight || 0;
  const visible = Math.max(1, Math.floor(scene.viewport.clientHeight / rowH));
  return Math.max(0, rows.length - visible);
}

// Verein und Initiativen: ein Schritt pro Meilenstein/Karte
measure: (scene) => scene.el.querySelectorAll('[data-step]').length - 1
```

### 4.2 CSS-Gating

Pinning-Styles greifen nur noch unter der `.is-pinned`-Klasse, die die Engine setzt. Damit ist der statische Zustand der Standard:

```css
/* Basis: normaler Fluss, funktioniert ohne JS */
.scene { position: relative; }
.scene__sticky { display: flow-root; }

/* Nur wenn die Engine gepinnt hat */
.scene.is-pinned .scene__sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (prefers-reduced-motion: reduce) {
  .scene { height: auto !important; }
  .scene.is-pinned .scene__sticky { position: static; height: auto; overflow: visible; }
  .scene * { animation: none !important; transition: none !important; }
}
```

`100dvh` entfällt bewusst — auf Mobil wird ohnehin nicht gepinnt, und auf dem Desktop ist `100vh` stabiler.

### 4.3 Reveal ohne Pinning

Im statischen Modus übernimmt ein `IntersectionObserver` — er existiert bereits als `scrollObserver` in `script.js:176` und wird nur um die neuen Elemente erweitert:

```js
document.querySelectorAll('.agenda-row, .milestone, .initiative-card')
  .forEach(el => { el.classList.add('fade-in'); scrollObserver.observe(el); });
```

---

## 5. Umsetzung in Etappen

Jede Etappe ist für sich lauffähig und deploybar.

### Etappe 0 — Aufräumen (~30 Min)

- Debug-Overlay aus `initSteppedVerticalScroll` entfernen (`js/script.js:776–791`, `827–830`)
- Doppelten Kommentar `<!-- Termine Section -->` in `index.html:230–231` bereinigen
- Baseline sichern: `git commit` vor dem Umbau

*Ergebnis: Live-Seite ohne sichtbaren Bug, unabhängig vom Rest.*

### Etappe 1 — Engine einziehen (~2 Std)

- `js/scroll-scenes.js` anlegen
- In `index.html` vor `script.js` einbinden
- **Strecken** als erste Szene migrieren — der Abschnitt ist am einfachsten und dient als Testfall
- `initInteractiveTrackSections` entfernen, sobald die Migration steht

*Ergebnis: Engine bewährt sich an einem Abschnitt, Rest läuft unverändert weiter.*

### Etappe 2 — Termine (~3 Std)

- `content/termine.json` mit den echten Saisonterminen anlegen
- `buildPages.js` um Termin-Rendering zwischen Markern erweitern
- Monatsleiste, Agenda-Zeilen und Filter-Chips als Szene `timeline` umsetzen
- `refresh()` an den Filterwechsel hängen
- Auto-Expiry aus der bestehenden Logik übernehmen
- `initSteppedVerticalScroll` entfernen

*Ergebnis: Echte Daten, funktionierender Filter, pflegbar über JSON.*

### Etappe 3 — Verein (~3 Std)

- Markup auf Meilenstein-Struktur umbauen (`[data-step]`)
- Sticky-Spalte mit Jahreszahl, rechte Spalte mit Meilensteinen
- Kennzahlenleiste mit Zähl-Animation (einmalig, per IntersectionObserver)
- Mobil-Zeitstrahl mit Linie und Punkten

*Ergebnis: Der Abschnitt bekommt erstmals eine Dramaturgie.*

### Etappe 4 — Initiativen (~2,5 Std)

- Karten aus `position: absolute` in einen Stapel überführen
- Wort-Füll-Effekt auf `background-clip: text` umstellen, Span-Wrapping entfernen
- `initInteractiveStorySections` entfernen

*Ergebnis: Deutlich weniger DOM-Arbeit pro Frame, Text bleibt zugänglich.*

### Etappe 5 — Abschluss (~2 Std)

- Training auf die Engine migrieren, letzte Alt-Engine entfernen
- Test über alle Breakpoints
- Lighthouse und Tastaturbedienung prüfen

**Gesamt: rund 13 Stunden.** Etappe 0 und 1 lohnen sich auch dann, wenn danach nichts weitergeht.

---

## 6. Abnahmekriterien

**Funktion**

- [ ] Bei deaktiviertem JavaScript sind alle Inhalte lesbar und vollständig
- [ ] Bei `prefers-reduced-motion: reduce` wird nicht gepinnt, Inhalte stehen im Fluss
- [ ] Unter 768px Breite existiert kein Pinning
- [ ] Filterwechsel in Termine berechnet die Scrollhöhe korrekt neu
- [ ] Vergangene Termine werden weiterhin automatisch ausgeblendet
- [ ] Kein Debug-Overlay

**Darstellung** — geprüft bei 375 / 768 / 1024 / 1440 / 1920 px, zusätzlich bei 1280×620 (niedriges Laptop-Fenster)

- [ ] Kein horizontaler Überlauf
- [ ] Gepinnte Inhalte passen ohne Abschneiden in 100vh
- [ ] Ein- und Ausblenden der mobilen Browserleiste verursacht keinen Sprung

**Performance**

- [ ] Scrollen bleibt bei 60 fps (DevTools Performance, 4× CPU-Drosselung)
- [ ] Keine Layout-Thrashing-Warnungen
- [ ] Lighthouse Performance ≥ 85 auf Mobil

**Zugänglichkeit**

- [ ] Alle Inhalte per Tastatur erreichbar, sichtbarer Fokus
- [ ] Wort-Füll-Text von Screenreadern zusammenhängend vorgelesen
- [ ] Monatsleiste und Filter mit `aria-pressed` ausgezeichnet

---

## 7. Risiken

| Risiko | Auswirkung | Gegenmaßnahme |
|---|---|---|
| Safari misst Layout außerhalb des Viewports verzögert | Falsche Schrittzahl | `ResizeObserver` statt Retry-Schleife; `layout()` ist jederzeit erneut aufrufbar |
| Gepinnter Inhalt zu hoch für kurze Viewports | Abgeschnittener Text | Bedingung `min-height: 600px` im Gate; Inhalte mit `clamp()` skalieren |
| `background-clip: text` in älteren Browsern | Text unsichtbar | `@supports`-Abfrage, sonst weißer Text ohne Fülleffekt |
| Umbau bricht die Live-Seite | Ausfall | Etappenweise, jede Etappe einzeln deploybar; Feature-Branch |
| Termine-JSON und `buildPages.js` driften auseinander | Leere Sektion | Marker-Mechanismus wie bei News, Build schlägt bei fehlender Datei hörbar fehl |

---

## 8. Bewusst nicht gemacht

- **GSAP ScrollTrigger.** Würde vieles abnehmen, kostet aber ~50 KB und eine externe Abhängigkeit. Die eigene Engine ist knapp 100 Zeilen.
- **CSS `animation-timeline: scroll()`.** Der saubere Weg ohne JavaScript, aber Stand heute nur in Chromium. Sobald Safari nachzieht, lässt sich die Engine schrittweise dahin überführen — das Markup bliebe gleich.
- **Pinning auf Mobil.** Technisch machbar, in der Praxis auf iOS wegen der dynamischen Viewporthöhe dauerhaft fehleranfällig.
