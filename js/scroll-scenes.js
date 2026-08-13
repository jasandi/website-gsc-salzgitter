/* ==========================================================================
   ScrollScenes — gemeinsame Engine für gepinnte Scroll-Sektionen
   --------------------------------------------------------------------------
   Leitprinzip: Desktop pinnt, Mobil scrollt nativ.

   Gepinnt wird nur, wenn alle Bedingungen erfüllt sind:
     • Viewport-Breite >= 768px
     • Viewport-Höhe   >= 600px
     • prefers-reduced-motion: no-preference

   Trifft eine Bedingung nicht zu, bekommt die Sektion die Klasse `is-static`
   und läuft im normalen Dokumentfluss. Das CSS macht in diesem Fall alle
   Inhalte sichtbar — ohne JavaScript ist der statische Zustand der Standard.

   Die Scrollhöhe entsteht aus dem gemessenen Inhalt, nicht aus einer
   Konstante: wenig Inhalt = kurze Sektion.
   ========================================================================== */

window.ScrollScenes = (function () {
    'use strict';

    var scenes = [];
    var ticking = false;
    var started = false;

    var mqSize = window.matchMedia('(min-width: 768px) and (min-height: 600px)');
    var mqMotion = window.matchMedia('(prefers-reduced-motion: no-preference)');

    function canPin() {
        return mqSize.matches && mqMotion.matches;
    }

    /**
     * Szene anmelden.
     *
     * @param {Element}  el                Die Sektion mit der Scrollstrecke
     * @param {Object}   opts
     * @param {Function} opts.render       (progress 0..1, scene) => void
     * @param {Function} [opts.measure]    (scene) => Anzahl Schritte
     * @param {Function} [opts.onStatic]   (scene) => void, beim Wechsel in den statischen Modus
     * @param {number}   [opts.stepVh=60]  Scrollstrecke pro Schritt in vh
     */
    function register(el, opts) {
        if (!el || !opts || typeof opts.render !== 'function') return null;

        var scene = {
            el: el,
            render: opts.render,
            measure: opts.measure || null,
            onStatic: opts.onStatic || null,
            stepVh: typeof opts.stepVh === 'number' ? opts.stepVh : 60,
            steps: 0,
            pinned: false,
            lastProgress: -1
        };

        scenes.push(scene);
        layout(scene);
        observe(scene);
        return scene;
    }

    /* ----------------------------------------------------------------------
       Messung und Moduswahl
       ---------------------------------------------------------------------- */
    function layout(scene) {
        if (!canPin()) {
            scene.pinned = false;
            scene.steps = 0;
            scene.lastProgress = -1;
            scene.el.classList.remove('is-pinned');
            scene.el.classList.add('is-static');
            scene.el.style.height = '';
            if (scene.onStatic) scene.onStatic(scene);
            return;
        }

        scene.el.classList.add('is-pinned');
        scene.el.classList.remove('is-static');

        // Vor dem Messen die Höhe freigeben, sonst misst man den alten Wert mit
        scene.el.style.height = '';

        var steps = scene.measure ? scene.measure(scene) : 1;
        if (!isFinite(steps) || steps < 0) steps = 0;

        scene.steps = steps;
        scene.pinned = true;
        scene.lastProgress = -1;

        if (steps > 0) {
            scene.el.style.height = (100 + steps * scene.stepVh) + 'vh';
        } else {
            // Nichts zu durchlaufen: Sektion verhält sich wie eine normale Section
            scene.el.style.height = '';
            scene.pinned = false;
            scene.el.classList.remove('is-pinned');
            scene.el.classList.add('is-static');
            if (scene.onStatic) scene.onStatic(scene);
        }
    }

    /* ----------------------------------------------------------------------
       Ersetzt die Retry-Schleife für Safari: neu messen, sobald Layout steht
       ---------------------------------------------------------------------- */
    function observe(scene) {
        if (!('ResizeObserver' in window)) return;

        var timer = null;
        var ro = new ResizeObserver(function () {
            // Der eigene Höhenwechsel darf keine Endlosschleife auslösen
            clearTimeout(timer);
            timer = setTimeout(function () {
                layout(scene);
                update();
            }, 120);
        });

        // Den Inhalt beobachten, nicht die Sektion selbst
        var target = scene.el.querySelector('[data-scene-content]') || scene.el.firstElementChild;
        if (target) ro.observe(target);
        scene._ro = ro;
    }

    /* ----------------------------------------------------------------------
       Fortschritt berechnen und rendern
       ---------------------------------------------------------------------- */
    function update() {
        var viewportHeight = window.innerHeight;

        for (var i = 0; i < scenes.length; i++) {
            var scene = scenes[i];
            if (!scene.pinned) continue;

            var rect = scene.el.getBoundingClientRect();

            // Szenen außerhalb des Sichtfelds kosten keine Rechenzeit
            if (rect.bottom < 0 || rect.top > viewportHeight) continue;

            var distance = rect.height - viewportHeight;
            if (distance <= 0) continue;

            var progress = -rect.top / distance;
            if (progress < 0) progress = 0;
            if (progress > 1) progress = 1;

            // Nur rendern, wenn sich etwas Sichtbares geändert hat
            if (Math.abs(progress - scene.lastProgress) < 0.0005) continue;
            scene.lastProgress = progress;

            scene.render(progress, scene);
        }

        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }

    function refresh() {
        for (var i = 0; i < scenes.length; i++) layout(scenes[i]);
        update();
    }

    /* ----------------------------------------------------------------------
       Listener
       ---------------------------------------------------------------------- */
    function start() {
        if (started) return;
        started = true;

        window.addEventListener('scroll', onScroll, { passive: true });

        // Breitenwechsel neu messen, reine Höhenänderung ignorieren.
        // Auf Mobil ändert das Ein-/Ausblenden der Browserleiste nur die Höhe —
        // ein refresh() dabei würde bei jedem Scrollimpuls springen.
        var lastWidth = window.innerWidth;
        window.addEventListener('resize', function () {
            if (window.innerWidth !== lastWidth) {
                lastWidth = window.innerWidth;
                refresh();
            }
        }, { passive: true });

        window.addEventListener('orientationchange', function () {
            setTimeout(refresh, 200);
        });

        var onModeChange = function () { refresh(); };
        if (typeof mqSize.addEventListener === 'function') {
            mqSize.addEventListener('change', onModeChange);
            mqMotion.addEventListener('change', onModeChange);
        } else if (typeof mqSize.addListener === 'function') {
            mqSize.addListener(onModeChange);   // Safari < 14
            mqMotion.addListener(onModeChange);
        }

        // Bilder verschieben das Layout nach dem Laden
        window.addEventListener('load', refresh);

        update();
    }

    return {
        register: register,
        refresh: refresh,
        update: update,
        start: start,
        canPin: canPin,
        get scenes() { return scenes.slice(); }
    };
})();
