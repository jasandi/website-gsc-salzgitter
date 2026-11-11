import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function initTodayHighlight() {
  const now = new Date();
  const day = now.getDay();
  const items = document.querySelectorAll<HTMLElement>('.schedule-row[data-day-indices]');

  items.forEach((item) => {
    const indices = (item.dataset.dayIndices || '')
      .split(',')
      .map((n) => parseInt(n, 10));
    if (indices.includes(day)) {
      item.classList.add('is-today');
      const tag = item.querySelector<HTMLElement>('.today-tag');
      if (tag) tag.hidden = false;
    }
  });
}

function initTrackTabs() {
  const tabs = document.querySelectorAll<HTMLButtonElement>('[data-track-tab]');
  const cards = document.querySelectorAll<HTMLElement>('[data-track-panel]');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.trackTab;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      cards.forEach((c) => {
        const match = c.dataset.trackPanel === targetId;
        c.classList.toggle('is-focused', match);
        if (match) {
          c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  });
}

function initIcsDownload() {
  document.querySelectorAll<HTMLButtonElement>('.ics-download-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const title = btn.dataset.icsTitle || 'GSC Salzgitter Termin';
      const desc = btn.dataset.icsDesc || '';
      const start = btn.dataset.icsStart || '20260926T100000';
      const end = btn.dataset.icsEnd || '20260926T180000';

      const ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//GSC Salzgitter e.V.//DE',
        'BEGIN:VEVENT',
        `SUMMARY:${title} – GSC Salzgitter`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        'LOCATION:GSC Salzgitter e.V., Eisenhüttenstraße, 38239 Salzgitter',
        `DESCRIPTION:${desc}`,
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');

      const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  });
}

function initScrollAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Highlight active section in desktop & mobile nav with sliding indicator
  const sectionLabels: Record<string, string> = {
    startseite: 'Startseite',
    oeffnungszeiten: 'Training',
    termine: 'Termine',
    strecke: 'Strecken',
    verein: 'Verein',
    initiativen: 'Initiativen',
  };
  const sectionIds = Object.keys(sectionLabels);
  const indicator = document.getElementById('desktop-nav-indicator');

  function updateHeaderIndicator(activeId: string) {
    document.querySelectorAll<HTMLElement>('[data-nav-section]').forEach((link) => {
      link.classList.toggle('is-active', link.dataset.navSection === activeId);
    });

    const activeDesktopLink = document.querySelector<HTMLElement>(
      `#desktop-nav a[data-nav-section="${activeId}"]`
    );
    if (indicator && activeDesktopLink) {
      indicator.style.width = `${activeDesktopLink.offsetWidth}px`;
      indicator.style.transform = `translateX(${activeDesktopLink.offsetLeft}px)`;
    }
  }

  // Initial position
  setTimeout(() => updateHeaderIndicator('startseite'), 50);
  window.addEventListener('resize', () => {
    const current =
      document.querySelector<HTMLElement>('#desktop-nav a.is-active')?.dataset.navSection ||
      'startseite';
    updateHeaderIndicator(current);
  });

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 55%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (self.isActive) {
          updateHeaderIndicator(id);
        }
      },
    });
  });

  if (prefersReduced) {
    document.querySelectorAll('.gear-item').forEach((item) => item.classList.add('is-checked'));
    return;
  }

  // Subtle hero background parallax
  const heroImg = document.querySelector('.hero-bg-img');
  if (heroImg) {
    gsap.to(heroImg, {
      scale: 1.12,
      yPercent: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: '#startseite',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  // Reveal-up elements
  gsap.utils.toArray<HTMLElement>('.reveal-up').forEach((el) => {
    gsap.from(el, {
      y: 28,
      opacity: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true,
      },
    });
  });

  // Safety gear sequential check-off on scroll
  gsap.utils.toArray<HTMLElement>('.gear-item').forEach((item, i) => {
    ScrollTrigger.create({
      trigger: item,
      start: 'top 82%',
      onEnter: () => {
        setTimeout(() => item.classList.add('is-checked'), i * 110);
      },
    });
  });

  // Counter animation in Verein section
  document.querySelectorAll<HTMLElement>('[data-count-to]').forEach((el) => {
    const target = parseInt(el.dataset.countTo || '0', 10);
    const prefix = el.dataset.countPrefix || '';
    const startVal = target > 1900 ? 1950 : 0;
    const obj = { val: startVal };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(obj, {
          val: target,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(obj.val)}`;
          },
        });
      },
    });
  });
}

function initUpcomingEventsFilter() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const todayNum = parseInt(`${y}${m}${d}`, 10);

  const cards = document.querySelectorAll<HTMLElement>('.race-event-card[data-event-date]');
  const grid = document.getElementById('events-grid');
  const placeholder = document.getElementById('no-events-placeholder');

  let visibleCount = 0;
  cards.forEach((card) => {
    const eventNum = parseInt(card.dataset.eventDate || '0', 10);
    if (eventNum >= todayNum) {
      card.hidden = false;
      visibleCount++;
    } else {
      card.hidden = true;
      card.style.display = 'none';
    }
  });

  if (visibleCount === 0) {
    if (grid) grid.hidden = true;
    if (placeholder) placeholder.hidden = false;
  } else {
    if (grid) grid.hidden = false;
    if (placeholder) placeholder.hidden = true;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initTodayHighlight();
  initUpcomingEventsFilter();
  initTrackTabs();
  initIcsDownload();
  initScrollAnimations();
});
