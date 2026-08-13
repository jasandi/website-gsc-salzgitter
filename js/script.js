// Force scroll to top on reload/refresh
(function() {
    const isReload = (performance.getEntriesByType('navigation')[0]?.type === 'reload') || 
                     (performance.navigation && performance.navigation.type === 1);

    if (isReload) {
        if (history.scrollRestoration) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
        
        // Remove hash from URL to prevent scrolling to sections on reload
        if (window.location.hash) {
            history.replaceState(null, null, window.location.pathname + window.location.search);
        }

        // Additional scroll to top attempts to combat late layout shifts
        document.addEventListener('DOMContentLoaded', () => {
            window.scrollTo(0, 0);
        });
        window.addEventListener('load', () => {
            window.scrollTo(0, 0);
            // Backup scroll just in case of layout changes
            setTimeout(() => {
                window.scrollTo(0, 0);
            }, 50);
        });
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    // Expiration cleanup for Supercross Event (Expired on July 6th, 2026)
    const expiryDate = new Date('2026-07-06T00:00:00');
    if (new Date() >= expiryDate) {
        if (window.location.pathname.includes('2026-07-04-supercross.html')) {
            window.location.replace('../index.html');
        }
        const highlightBanner = document.getElementById('homepage-highlight-event');
        if (highlightBanner) {
            highlightBanner.remove();
        }
        document.querySelectorAll('a[href*="2026-07-04-supercross.html"]').forEach(link => {
            const card = link.closest('.event-card') || link.closest('article');
            if (card) {
                card.remove();
            }
        });
    }



    // 1. Mobile Navigation & Smart Floating Button Logic
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');
    const menuCloseBtn = document.querySelector('.menu-close-btn');

    function closeMobileMenu() {
        if (navLinks && navLinks.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isActive = navLinks.classList.contains('active');
            if (isActive) {
                closeMobileMenu();
            } else {
                menuToggle.classList.add('active');
                navLinks.classList.add('active');
                menuToggle.setAttribute('aria-expanded', 'true');
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (menuCloseBtn) {
        menuCloseBtn.addEventListener('click', closeMobileMenu);
    }

    // Close menu when tapping dark overlay outside of navigation items
    if (navLinks) {
        navLinks.addEventListener('click', (e) => {
            if (e.target === navLinks) {
                closeMobileMenu();
            }
        });
    }

    // Close mobile menu on link click
    navItems.forEach(item => {
        item.addEventListener('click', closeMobileMenu);
    });

    // 2. Smart Scroll Visibility for Floating Hamburger Button & Desktop Navbar
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    const scrollThreshold = 60;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Desktop navbar scrolled class
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Smart Floating Mobile Button & Desktop Navbar Hide/Show
        if (menuToggle && navLinks && !navLinks.classList.contains('active')) {
            if (scrollTop <= 50) {
                // At top of page -> ALWAYS SHOW
                menuToggle.classList.remove('is-hidden');
                if (navbar) navbar.classList.remove('hidden');
            } else if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
                // Scrolling DOWN -> HIDE
                menuToggle.classList.add('is-hidden');
                if (navbar) navbar.classList.add('hidden');
            } else if (scrollTop < lastScrollTop) {
                // Scrolling UP -> SHOW
                menuToggle.classList.remove('is-hidden');
                if (navbar) navbar.classList.remove('hidden');
            }
        }

        lastScrollTop = scrollTop;
    }, { passive: true }); // Passive listener for better scroll performance

    // 3. Active Nav Link on Scroll (ScrollSpy)
    const sections = document.querySelectorAll('section[id]');

    function highlightNavLink() {
        let currentSectionId = '';

        // Check if we are at the bottom of the page (to handle short final sections)
        const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 20);

        if (isAtBottom && sections.length > 0) {
            currentSectionId = sections[sections.length - 1].getAttribute('id');
        } else {
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                // Check if section is currently active in the viewport (intersection with a line at 40% height of screen)
                if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4) {
                    currentSectionId = section.getAttribute('id');
                }
            });
        }

        if (currentSectionId) {
            const navLink = document.querySelector(`.nav-links a[href*="${currentSectionId}"]`);
            if (navLink) {
                navItems.forEach(a => a.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    }

    // Call initially to highlight correct nav on page load
    highlightNavLink();

    window.addEventListener('scroll', highlightNavLink, { passive: true });

    // 4. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Trigger when 15% of element is visible
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Staggered Reveal Logic for Carousel Elements
                if (entry.target.classList.contains('events-carousel-wrapper')) {
                    const cards = Array.from(entry.target.querySelectorAll('.event-card, .track-card'));

                    // Identify visible cards roughly (or all active)
                    const activeCards = cards.filter(c => c.style.display !== 'none');

                    activeCards.forEach((card, index) => {
                        // Max 5 staggered items to prevent infinite wait
                        const delayIndex = Math.min(index, 5);
                        card.style.animationDelay = `${delayIndex * 0.15}s`;
                        card.classList.add('stagger-visible');
                    });
                }

                // Optional: stop observing once animated
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Elements to animate
    const animateElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
    animateElements.forEach(el => scrollObserver.observe(el));

    // 5. Stacked Tiles Interactive Scroll Reveal Observer (Rose Bikes Style)
    const tileObserverOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.1
    };

    const tileObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const tile = entry.target;
                const parentGrid = tile.closest('.stacked-tiles-grid');
                if (parentGrid) {
                    const visibleSiblings = Array.from(parentGrid.querySelectorAll('.tile-scroll-reveal')).filter(t => t.style.display !== 'none');
                    const index = visibleSiblings.indexOf(tile);
                    if (index >= 0) {
                        tile.style.transitionDelay = `${Math.min(index * 0.1, 0.35)}s`;
                    }
                }
                tile.classList.add('is-visible');
                observer.unobserve(tile);
            }
        });
    }, tileObserverOptions);

    document.querySelectorAll('.tile-scroll-reveal').forEach(tile => tileObserver.observe(tile));

    // 6. Date Filtering & Cleanup
    const systemDate = new Date();
    const todayStart = new Date(systemDate.getFullYear(), systemDate.getMonth(), systemDate.getDate()).getTime();

    const twelveMonthsAgo = new Date(systemDate);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const twelveMonthsAgoTime = twelveMonthsAgo.getTime();

    const monthMap = {
        'jan': 0, 'feb': 1, 'mär': 2, 'mar': 2, 'apr': 3, 'mai': 4,
        'may': 4, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9,
        'oct': 9, 'nov': 10, 'dez': 11, 'dec': 11
    };

    const parseDateHelper = (card, sectionId) => {
        if (sectionId === 'neuigkeiten') {
            const timeEl = card.querySelector('.time');
            if (timeEl) {
                const parts = timeEl.textContent.trim().toLowerCase().split(/[ .]+/);
                if (parts.length >= 3) {
                    const day = parseInt(parts[0], 10);
                    const month = monthMap[parts[1].substring(0, 3)] || 0;
                    const year = parseInt(parts[2], 10);
                    return new Date(year, month, day).getTime();
                }
            }
        } else if (sectionId === 'termine') {
            const dayEl = card.querySelector('.day');
            const monthEl = card.querySelector('.month');
            if (dayEl && monthEl) {
                const day = parseInt(dayEl.textContent, 10);
                const month = monthMap[monthEl.textContent.trim().toLowerCase().substring(0, 3)] || 0;
                let year = systemDate.getFullYear();
                let date = new Date(year, month, day);
                // Assume past months without a year might logically be next year's event
                if (date.getTime() < todayStart && (systemDate.getMonth() - month) > 5) {
                    date.setFullYear(year + 1);
                }
                return date.getTime();
            }
        }
        return null;
    };

    // Filter expired event cards in #termine
    const termineSection = document.getElementById('termine');
    if (termineSection) {
        const eventCards = termineSection.querySelectorAll('.event-card');
        eventCards.forEach(card => {
            const time = parseDateHelper(card, 'termine');
            if (time && time < todayStart) {
                card.style.display = 'none';
            }
        });
    }

    const carouselWrappers = document.querySelectorAll('.events-carousel-wrapper');
    carouselWrappers.forEach(wrapper => {
        const carousel = wrapper.querySelector('.events-carousel');
        const arrowLeft = wrapper.querySelector('.carousel-arrow-left');
        const arrowRight = wrapper.querySelector('.carousel-arrow-right');
        const sectionId = wrapper.closest('section')?.id;

        if (!carousel) return;

        let targetCard = null;

        // Hide expired items and find the target focus card
        if (sectionId === 'neuigkeiten' || sectionId === 'termine') {
            const cards = Array.from(carousel.querySelectorAll('.event-card'));
            let smallestDiff = Infinity;

            cards.forEach(card => {
                const time = parseDateHelper(card, sectionId);
                if (!time) return;

                if (sectionId === 'neuigkeiten') {
                    if (time < twelveMonthsAgoTime) {
                        card.style.display = 'none';
                    } else {
                        // Find closest news to today
                        const diff = Math.abs(todayStart - time);
                        if (diff < smallestDiff) {
                            smallestDiff = diff;
                            targetCard = card;
                        }
                    }
                } else if (sectionId === 'termine') {
                    if (time < todayStart) {
                        card.style.display = 'none';
                    } else {
                        // Find closest upcoming termin
                        const diff = time - todayStart;
                        if (diff >= 0 && diff < smallestDiff) {
                            smallestDiff = diff;
                            targetCard = card;
                        }
                    }
                }
            });
        }

        const updateArrows = () => {
            if (!arrowLeft || !arrowRight) return;

            // Show left arrow if we can scroll left
            if (carousel.scrollLeft > 10) {
                arrowLeft.classList.add('visible');
            } else {
                arrowLeft.classList.remove('visible');
            }

            // Show right arrow if we can scroll right
            // Use a small 10px threshold to handle rounding errors
            if (carousel.scrollWidth - carousel.clientWidth - carousel.scrollLeft > 10) {
                arrowRight.classList.add('visible');
            } else {
                arrowRight.classList.remove('visible');
            }
        };

        const scrollByItem = (direction) => {
            const activeCards = Array.from(carousel.querySelectorAll('.event-card, .track-card')).filter(c => c.style.display !== 'none');
            if (activeCards.length === 0) return;

            const paddingLeft = parseFloat(getComputedStyle(carousel).paddingLeft) || 0;

            // Temporarily disable scroll snapping to prevent iOS Safari from fighting smooth scroll
            carousel.style.scrollSnapType = 'none';

            // Find the index of the first card that is currently visible at the left edge of the viewport
            const carouselRect = carousel.getBoundingClientRect();
            let leftmostVisibleIndex = 0;
            for (let i = 0; i < activeCards.length; i++) {
                const cardRect = activeCards[i].getBoundingClientRect();
                // If the right side of the card is to the right of the viewport's left boundary
                if (cardRect.right > carouselRect.left + paddingLeft + 5) {
                    leftmostVisibleIndex = i;
                    break;
                }
            }

            // Determine target index based on the direction of navigation
            let targetIndex = leftmostVisibleIndex + direction;
            if (targetIndex < 0) targetIndex = 0;
            if (targetIndex >= activeCards.length) targetIndex = activeCards.length - 1;

            const targetCard = activeCards[targetIndex];
            const cardRect = targetCard.getBoundingClientRect();
            let targetLeft;
            if (window.innerWidth <= 768) {
                const offset = (carouselRect.width - cardRect.width) / 2;
                targetLeft = carousel.scrollLeft + cardRect.left - carouselRect.left - offset;
            } else {
                targetLeft = carousel.scrollLeft + cardRect.left - carouselRect.left - paddingLeft;
            }

            // Scroll programmatically utilizing native CSS scroll-behavior: smooth
            carousel.scrollLeft = targetLeft;

            // Restore scroll snap after the smooth scroll animation completes
            const restoreSnap = () => {
                carousel.style.scrollSnapType = '';
            };
            if ('onscrollend' in window) {
                carousel.addEventListener('scrollend', restoreSnap, { once: true });
            } else {
                setTimeout(restoreSnap, 600);
            }
        };

        if (arrowLeft) {
            arrowLeft.addEventListener('click', () => scrollByItem(-1));
        }
        if (arrowRight) {
            arrowRight.addEventListener('click', () => scrollByItem(1));
        }

        carousel.addEventListener('scroll', updateArrows, { passive: true });

        // Initial Layout and Scroll targeting
        setTimeout(() => {
            const activeCards = Array.from(carousel.querySelectorAll('.event-card, .track-card')).filter(c => c.style.display !== 'none');

            if (activeCards.length > 0) {
                const cardWidth = activeCards[0].getBoundingClientRect().width;
                const gap = parseFloat(getComputedStyle(carousel).gap) || 40;
                const scrollAmount = cardWidth + gap;
                const visibleCount = Math.round(carousel.clientWidth / scrollAmount) || 1;
                const paddingLeft = parseFloat(getComputedStyle(carousel).paddingLeft) || 0;

                // Disable smooth behavior temporarily to prevent animation glitches on load jump
                carousel.style.scrollBehavior = 'auto';

                if (sectionId === 'neuigkeiten') {
                    // Find the card closest to today
                    let targetIndex = targetCard && activeCards.includes(targetCard) ? activeCards.indexOf(targetCard) : activeCards.length - 1;

                    if (visibleCount <= 1) {
                        // Mobile: Focus the target card by snapping it exactly into the view
                        const carouselRect = carousel.getBoundingClientRect();
                        carousel.scrollLeft = carousel.scrollLeft + activeCards[targetIndex].getBoundingClientRect().left - carouselRect.left - paddingLeft;
                    } else {
                        // Desktop/Tablet: Make the target card be on the FAR RIGHT
                        // So the card to align to the left edge is offset by (visibleCount - 1)
                        let snapIndex = targetIndex - visibleCount + 1;
                        if (snapIndex < 0) snapIndex = 0;
                        const carouselRect = carousel.getBoundingClientRect();
                        carousel.scrollLeft = carousel.scrollLeft + activeCards[snapIndex].getBoundingClientRect().left - carouselRect.left - paddingLeft;
                    }
                } else if (sectionId === 'termine') {
                    // For Termine, the targeted (upcoming) card should always be on the far left.
                    // (Since we hide past ones, this is usually index 0 anyway)
                    let targetIndex = targetCard && activeCards.includes(targetCard) ? activeCards.indexOf(targetCard) : 0;
                    const carouselRect = carousel.getBoundingClientRect();
                    carousel.scrollLeft = carousel.scrollLeft + activeCards[targetIndex].getBoundingClientRect().left - carouselRect.left - paddingLeft;
                }

                // Restore smooth scroll after a brief frame
                requestAnimationFrame(() => {
                    carousel.style.scrollBehavior = '';
                    updateArrows();
                });
            }
        }, 150);

        // --- Dots Logic ---
        const dotsContainer = document.createElement('div');
        dotsContainer.classList.add('carousel-dots');
        wrapper.appendChild(dotsContainer);

        let dotsArray = [];

        const updateDots = () => {
            const activeCards = Array.from(carousel.querySelectorAll('.event-card, .track-card')).filter(c => c.style.display !== 'none');
            // If all cards fit in the viewport, hide dots
            if (activeCards.length <= 1 || carousel.scrollWidth <= carousel.clientWidth + 10) {
                dotsContainer.style.display = 'none';
                return;
            } else {
                dotsContainer.style.display = 'flex';
            }

            // Rebuild dots if card count changed (e.g. resize might change visibility, but normally constant here)
            if (dotsArray.length !== activeCards.length) {
                dotsContainer.innerHTML = '';
                dotsArray = [];
                activeCards.forEach((_, index) => {
                    const dot = document.createElement('span');
                    dot.classList.add('carousel-dot');
                    dot.setAttribute('aria-label', `Gehe zu Element ${index + 1}`);
                    dot.addEventListener('click', () => {
                        const paddingLeft = parseFloat(getComputedStyle(carousel).paddingLeft) || 0;
                        const targetCard = activeCards[index];
                        if (targetCard) {
                            carousel.style.scrollSnapType = 'none';
                            const carouselRect = carousel.getBoundingClientRect();
                            const targetLeft = carousel.scrollLeft + targetCard.getBoundingClientRect().left - carouselRect.left - paddingLeft;
                            carousel.scrollLeft = targetLeft;
                            const restoreSnap = () => {
                                carousel.style.scrollSnapType = '';
                            };
                            if ('onscrollend' in window) {
                                carousel.addEventListener('scrollend', restoreSnap, { once: true });
                            } else {
                                setTimeout(restoreSnap, 600);
                            }
                        }
                    });
                    dotsContainer.appendChild(dot);
                    dotsArray.push(dot);
                });
            }

            // Calculate active dot based on screen position
            const carouselRect = carousel.getBoundingClientRect();
            const carouselCenter = carouselRect.left + (carouselRect.width / 2);

            let activeIndex = 0;
            let closestDistance = Infinity;

            activeCards.forEach((card, index) => {
                const cardRect = card.getBoundingClientRect();
                const cardCenter = cardRect.left + (cardRect.width / 2);
                const distance = Math.abs(carouselCenter - cardCenter);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    activeIndex = index;
                }
            });

            dotsArray.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        };

        carousel.addEventListener('scroll', updateDots, { passive: true });

        // Ensure arrows and dots update on window resize
        window.addEventListener('resize', () => {
            updateArrows();
            updateDots();
        });

        // Initialize dots after a short delay to ensure layout is done
        setTimeout(updateDots, 200);
    });

    // 6. GPU-Accelerated Mobile Parallax Effect for Hero Background
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            if (scrollY < window.innerHeight) {
                const translateY = scrollY * 0.35; // Parallax speed factor (0.35)
                heroSection.style.setProperty('--hero-translate-y', `${translateY}px`);
            }
        }, { passive: true });
    }

    // 7. FAQ Accordion Interaction
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close other items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-answer').style.maxHeight = null;
                otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });

            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                item.classList.remove('active');
                question.setAttribute('aria-expanded', 'false');
                answer.style.maxHeight = null;
            }
        });
    });

    // Lightbox Modal for Gallery Images
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    if (lightbox && lightboxImg) {
        document.querySelectorAll('.event-card-banner, .zoomable-image, .girlsday-gallery img').forEach(img => {
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                if (lightboxCaption) {
                    lightboxCaption.textContent = img.alt || '';
                }
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Disable scroll
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Enable scroll
        };

        lightboxClose.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // 8. Nutzungshinweise Modal Logic
    const nutzungshinweiseBtn = document.getElementById('open-nutzungshinweise-btn');
    const nutzungshinweiseModal = document.getElementById('nutzungshinweise-modal');
    
    if (nutzungshinweiseBtn && nutzungshinweiseModal) {
        const modalBackdrop = nutzungshinweiseModal.querySelector('.info-modal-backdrop');
        const modalClose = nutzungshinweiseModal.querySelector('.info-modal-close');
        const modalOkBtn = nutzungshinweiseModal.querySelector('.info-modal-ok-btn');

        const openModal = () => {
            nutzungshinweiseModal.classList.add('active');
            nutzungshinweiseModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        };

        const closeModal = () => {
            nutzungshinweiseModal.classList.remove('active');
            nutzungshinweiseModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        };

        nutzungshinweiseBtn.addEventListener('click', openModal);
        if (modalClose) modalClose.addEventListener('click', closeModal);
        if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
        if (modalOkBtn) modalOkBtn.addEventListener('click', closeModal);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && nutzungshinweiseModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // 9a. Strecken-Sektion — läuft über die gemeinsame ScrollScenes-Engine
    function initInteractiveTrackSections() {
        if (!window.ScrollScenes) return;

        document.querySelectorAll('.interactive-track-section').forEach(section => {
            const items = Array.from(section.querySelectorAll('.track-reveal-item'));
            if (!items.length) return;

            window.ScrollScenes.register(section, {
                // Ein Schritt pro Strecke, die erste ist beim Eintreten schon da
                measure: () => items.length,
                stepVh: 70,

                render: (progress) => {
                    const segment = 1 / items.length;
                    let activeIndex = Math.floor(progress / segment);
                    if (activeIndex >= items.length) activeIndex = items.length - 1;

                    items.forEach((item, i) => {
                        item.classList.toggle('active', i === activeIndex);
                    });
                },

                // Statischer Modus: alle Strecken untereinander, Einblenden per Observer
                onStatic: () => {
                    items.forEach(item => {
                        item.classList.remove('active');
                        if (!item.dataset.observed) {
                            scrollObserver.observe(item);
                            item.dataset.observed = 'true';
                        }
                    });
                }
            });
        });
    }

    // 9. Intersection Observer for Reveal Items (Termine)
    function initRevealItems() {
        const revealItems = document.querySelectorAll('.reveal-item');
        if (!revealItems.length) return;

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });

        revealItems.forEach(item => {
            revealObserver.observe(item);
        });
    }

    // 10. Interactive Storytelling Scroll Engine (GPU Hardware-Accelerated & rAF-Throttled)
    function initInteractiveStorySections() {
        const storySections = document.querySelectorAll('.interactive-story-section');
        if (!storySections.length) return;

        storySections.forEach(section => {
            const rawTiles = section.querySelectorAll('.story-tile');
            if (!rawTiles.length) return;

            // Pre-cache DOM nodes to eliminate querySelector overhead in scroll callbacks
            const cachedTiles = Array.from(rawTiles).map(tile => {
                const fillTexts = tile.querySelectorAll('.story-fill-text');
                fillTexts.forEach(p => {
                    if (!p.dataset.wrapped) {
                        const rawText = p.textContent.trim();
                        const words = rawText.split(/\s+/);
                        p.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');
                        p.dataset.wrapped = "true";
                    }
                });

                return {
                    element: tile,
                    wordSpans: Array.from(tile.querySelectorAll('.story-fill-text .word')),
                    bulletItems: Array.from(tile.querySelectorAll('.feature-list li'))
                };
            });

            const numTiles = cachedTiles.length;
            const segmentSize = 1 / numTiles;
            let isTicking = false;

            function updateStoryProgress() {
                const rect = section.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const totalScrollableDistance = rect.height - viewportHeight;
                if (totalScrollableDistance <= 0) return;

                const scrolled = -rect.top;
                let progress = Math.max(0, Math.min(1, scrolled / totalScrollableDistance));

                let activeIndex = Math.floor(progress / segmentSize);
                if (activeIndex >= numTiles) activeIndex = numTiles - 1;

                cachedTiles.forEach((tileObj, i) => {
                    const tile = tileObj.element;
                    const wordSpans = tileObj.wordSpans;
                    const bulletItems = tileObj.bulletItems;
                    const totalWords = wordSpans.length;
                    const totalBullets = bulletItems.length;

                    const segStart = i * segmentSize;
                    const segEnd = (i + 1) * segmentSize;
                    const tileP = Math.max(0, Math.min(1, (progress - segStart) / segmentSize));

                    let opacity = 0;
                    let translateY = 0;
                    let scale = 1;

                    if (progress >= segStart) {
                        // THIS TILE IS IN ITS PRIMARY SCROLL WINDOW OR PAST IT (LAST TILE)
                        const isLastTile = (i === numTiles - 1);

                        if (isLastTile || tileP < 0.65) {
                            // Phase 1 & 2: Card remains 100% FIXED & STILL centered
                            opacity = 1;
                            translateY = 0;
                            scale = 1;
                        } else {
                            // Phase 3: Exiting Tile glides UP towards top header mask
                            const exitProgress = (tileP - 0.65) / 0.35;
                            opacity = Math.max(0, 1 - (exitProgress * 1.3));
                            translateY = -480 * exitProgress;
                            scale = 1 - (0.04 * exitProgress);
                        }

                        // Word-by-Word Fill (Phase 1: 0.04 to 0.38)
                        if (totalWords > 0) {
                            const wordFillProgress = Math.max(0, Math.min(1, (tileP - 0.04) / 0.34));
                            const filledCount = Math.floor(wordFillProgress * (totalWords + 1));
                            for (let wIdx = 0; wIdx < totalWords; wIdx++) {
                                if (wIdx < filledCount) {
                                    wordSpans[wIdx].classList.add('is-filled');
                                } else {
                                    wordSpans[wIdx].classList.remove('is-filled');
                                }
                            }
                        }

                        // Feature Bullets Reveal (Phase 2: 0.34 to 0.60)
                        if (totalBullets > 0) {
                            const bulletProgress = Math.max(0, Math.min(1, (tileP - 0.34) / 0.26));
                            const revealedBullets = Math.floor(bulletProgress * (totalBullets + 1));
                            for (let bIdx = 0; bIdx < totalBullets; bIdx++) {
                                if (bIdx < revealedBullets) {
                                    bulletItems[bIdx].classList.add('is-revealed');
                                } else {
                                    bulletItems[bIdx].classList.remove('is-revealed');
                                }
                            }
                        }

                    } else if (i === activeIndex + 1 && progress > activeIndex * segmentSize) {
                        // Phase 3: ENTERING TILE SLIDES UP FROM BELOW WITH GUARANTEED 200px+ PHYSICAL GAP
                        const prevSegStart = (i - 1) * segmentSize;
                        const prevTileP = Math.max(0, Math.min(1, (progress - prevSegStart) / segmentSize));
                        if (prevTileP >= 0.65) {
                            const enterProgress = (prevTileP - 0.65) / 0.35;
                            opacity = 1; // SOLID 100% OPACITY (WITHOUT FADE)
                            translateY = 560 * (1 - enterProgress); // 560px initial offset guarantees physical gap
                            scale = 0.96 + (0.04 * enterProgress);

                            for (let wIdx = 0; wIdx < totalWords; wIdx++) wordSpans[wIdx].classList.remove('is-filled');
                            for (let bIdx = 0; bIdx < totalBullets; bIdx++) bulletItems[bIdx].classList.remove('is-revealed');
                        }
                    } else if (i < activeIndex) {
                        // PAST TILE (Exited Top)
                        opacity = 0;
                        translateY = -420;
                        scale = 0.96;
                        for (let wIdx = 0; wIdx < totalWords; wIdx++) wordSpans[wIdx].classList.add('is-filled');
                        for (let bIdx = 0; bIdx < totalBullets; bIdx++) bulletItems[bIdx].classList.add('is-revealed');
                    } else {
                        // FUTURE TILE (Waiting Below)
                        opacity = 0;
                        translateY = 420;
                        scale = 0.96;
                        for (let wIdx = 0; wIdx < totalWords; wIdx++) wordSpans[wIdx].classList.remove('is-filled');
                        for (let bIdx = 0; bIdx < totalBullets; bIdx++) bulletItems[bIdx].classList.remove('is-revealed');
                    }

                    // GPU hardware-accelerated transform with translate3d
                    tile.style.opacity = opacity.toFixed(3);
                    tile.style.transform = `translate3d(-50%, calc(-50% + ${translateY.toFixed(1)}px), 0) scale(${scale.toFixed(3)})`;
                    tile.style.visibility = opacity > 0.01 ? 'visible' : 'hidden';
                    tile.style.pointerEvents = opacity > 0.5 ? 'auto' : 'none';
                });
            }

            function requestUpdate() {
                if (!isTicking) {
                    requestAnimationFrame(() => {
                        updateStoryProgress();
                        isTicking = false;
                    });
                    isTicking = true;
                }
            }

            window.addEventListener('scroll', requestUpdate, { passive: true });
            window.addEventListener('resize', requestUpdate, { passive: true });
            updateStoryProgress();
        });
    }

    // 9b. Zahl einmalig hochzählen
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function animateCount(el) {
        if (!el || el.dataset.counted) return;
        el.dataset.counted = 'true';

        const target = parseInt(el.dataset.count, 10);
        if (isNaN(target)) return;

        // Jahreszahlen weder hochzählen noch mit Tausenderpunkt setzen (1985, nicht 1.985)
        if (el.hasAttribute('data-count-plain')) {
            el.textContent = String(target);
            return;
        }

        if (prefersReducedMotion) {
            el.textContent = target.toLocaleString('de-DE');
            return;
        }

        const duration = 1100;
        const start = performance.now();

        const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased).toLocaleString('de-DE');
            if (p < 1) requestAnimationFrame(tick);
        };

        el.textContent = '0';
        requestAnimationFrame(tick);
    }

    initInteractiveStorySections();
    initInteractiveTrackSections();
    initInteractiveTermineSections();
    initRevealItems();

    // Engine erst starten, wenn alle Szenen registriert sind
    if (window.ScrollScenes) window.ScrollScenes.start();

    // 10. Interactive Timetable Scroll Engine
    // 9c. Interactive Termine ScrollScenes Engine
    function initInteractiveTermineSections() {
        const termineSection = document.getElementById('termine');
        if (!termineSection) return;

        const scrollContainer = termineSection.querySelector('.termine-scroll-container');
        if (!scrollContainer) return;

        // Ensure we only initialize once
        if (termineSection.dataset.termineInitialized) return;
        termineSection.dataset.termineInitialized = 'true';

        // Read all visible cards. (Some might be hidden by the past-event filter above).
        const allCards = Array.from(scrollContainer.querySelectorAll('.event-card')).filter(c => c.style.display !== 'none');
        if (!allCards.length) return;

        function buildPages() {
            // Remove existing pages if any (for resize re-calculation)
            const existingPages = scrollContainer.querySelectorAll('.termine-page');
            existingPages.forEach(p => p.remove());

            // Measure real header height if possible, fallback to 180
            const header = termineSection.querySelector('.termine-sticky-header');
            const headerHeight = header ? header.offsetHeight : 180;
            
            const isMobile = window.innerWidth <= 768;
            const cardHeight = isMobile ? 160 : 130; // Mobile cards are taller due to text wrapping
            const bottomBuffer = isMobile ? 20 : 40;
            
            const availableHeight = window.innerHeight - headerHeight - bottomBuffer;
            
            // Use Math.floor to ensure we NEVER overflow into the header fade
            let itemsPerPage = Math.floor(availableHeight / cardHeight);
            
            const maxItems = isMobile ? 3 : 5;
            if (itemsPerPage > maxItems) itemsPerPage = maxItems;
            if (itemsPerPage < 2) itemsPerPage = 2; // Mobile minimal guarantee

            const numPages = Math.ceil(allCards.length / itemsPerPage);
            const pages = [];

            for (let i = 0; i < numPages; i++) {
                const pageDiv = document.createElement('div');
                pageDiv.className = 'termine-page';
                // Apply dynamic padding to exactly avoid the real header height
                pageDiv.style.paddingTop = headerHeight + 'px';
                
                const slice = allCards.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
                slice.forEach(card => {
                    // Remove any old absolute styles if we had them
                    card.style.position = '';
                    card.style.top = '';
                    pageDiv.appendChild(card);
                });
                
                scrollContainer.appendChild(pageDiv);
                pages.push(pageDiv);
            }

            return pages;
        }

        let pages = buildPages();

        if (window.ScrollScenes) {
            let currentScene = window.ScrollScenes.register(termineSection, {
                measure: () => pages.length,
                stepVh: 80, // Each page is 80vh of scroll distance
                render: (progress) => {
                    const segment = 1 / pages.length;
                    
                    pages.forEach((page, i) => {
                        const segStart = i * segment;
                        const segEnd = (i + 1) * segment;
                        
                        // Active range + transition buffer (10% of segment)
                        const buffer = segment * 0.15;
                        
                        if (progress >= segStart - buffer && progress <= segEnd + buffer) {
                            const localProgress = (progress - segStart) / segment; 
                            
                            if (localProgress >= 0 && localProgress <= 1) {
                                // Fully active
                                page.className = 'termine-page is-active';
                                page.style.opacity = 1;
                                page.style.transform = `translate3d(0, 0, 0)`;
                            } else if (localProgress < 0) {
                                // Transitioning in from below
                                const t = 1 + (localProgress / 0.15); // 0 to 1
                                page.className = 'termine-page';
                                page.style.opacity = Math.max(0, t);
                                page.style.transform = `translate3d(0, ${(1-t) * 40}px, 0)`;
                            } else {
                                // Transitioning out to top
                                const t = 1 - ((localProgress - 1) / 0.15); // 1 to 0
                                page.className = 'termine-page is-past';
                                page.style.opacity = Math.max(0, t);
                                page.style.transform = `translate3d(0, -${(1-t) * 40}px, 0)`;
                            }
                        } else if (progress < segStart) {
                            // Future
                            page.className = 'termine-page';
                            page.style.opacity = 0;
                            page.style.transform = `translate3d(0, 40px, 0)`;
                        } else {
                            // Past
                            page.className = 'termine-page is-past';
                            page.style.opacity = 0;
                            page.style.transform = `translate3d(0, -40px, 0)`;
                        }
                    });
                },
                onStatic: () => {
                    pages.forEach(p => {
                        p.className = 'termine-page is-active';
                        p.style.position = 'relative';
                        p.style.transform = 'none';
                        p.style.opacity = 1;
                        p.style.paddingTop = '1rem';
                    });
                    scrollContainer.style.position = 'relative';
                    scrollContainer.style.height = 'auto';
                }
            });

            // Rebuild pages on resize if itemsPerPage would change
            let lastInnerHeight = window.innerHeight;
            window.addEventListener('resize', () => {
                if (Math.abs(window.innerHeight - lastInnerHeight) > 100) {
                    lastInnerHeight = window.innerHeight;
                    
                    // We must unregister the old scene somehow... 
                    // ScrollScenes doesn't have an unregister, but we can just update the scene properties.
                    // To keep it simple, we just update the pages array and trigger layout.
                    pages = buildPages();
                    if (currentScene) {
                        currentScene.measure = () => pages.length;
                        window.ScrollScenes.refresh();
                    }
                }
            }, { passive: true });
        }
    }
    function initInteractiveTimetableSections() {
        const timetableSections = document.querySelectorAll('.interactive-timetable-section');
        if (!timetableSections.length) return;

        timetableSections.forEach(section => {
            const progressBar = section.querySelector('.timetable-progress-bar');
            if (!progressBar) return;

            let isTicking = false;

            function updateTimetableProgress() {
                const rect = section.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const totalScrollableDistance = rect.height - viewportHeight;
                if (totalScrollableDistance <= 0) return;

                const scrolled = -rect.top;
                let progress = Math.max(0, Math.min(1, scrolled / totalScrollableDistance));

                // Update progress bar width
                progressBar.style.width = `${progress * 100}%`;
            }

            function requestUpdate() {
                if (!isTicking) {
                    requestAnimationFrame(() => {
                        updateTimetableProgress();
                        isTicking = false;
                    });
                    isTicking = true;
                }
            }

            window.addEventListener('scroll', requestUpdate, { passive: true });
            window.addEventListener('resize', requestUpdate, { passive: true });
            updateTimetableProgress();
        });
    }

    initInteractiveTimetableSections();
});

