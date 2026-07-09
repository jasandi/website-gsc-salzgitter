document.addEventListener('DOMContentLoaded', () => {
    // 1. Expiration cleanup for events
    const cleanExpiredEvents = () => {
        const today = new Date().getTime();

        // Girlsday Event (Expires on August 9th, 2026)
        const expiryDateGirlsday = new Date('2026-08-09T00:00:00').getTime();
        if (today >= expiryDateGirlsday) {
            if (window.location.pathname.includes('2026-08-08-girlsday.html')) {
                window.location.replace('../index.html');
            }
            document.querySelectorAll('a[href*="2026-08-08-girlsday.html"]').forEach(link => {
                const card = link.closest('.event-card') || link.closest('article');
                if (card) card.remove();
            });
        }
    };
    cleanExpiredEvents();

    // 2. Mobile Navigation Toggle (Overlay & Hamburger Lock)
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isActive = menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive);

            // Stagger animation on links inside menu
            if (isActive) {
                document.body.style.overflow = 'hidden'; // lock scroll
                navItems.forEach((link, idx) => {
                    link.style.transitionDelay = `${idx * 0.05}s`;
                    link.style.transform = 'translateY(0)';
                    link.style.opacity = '1';
                });
            } else {
                document.body.style.overflow = ''; // unlock scroll
                navItems.forEach(link => {
                    link.style.transitionDelay = '0s';
                    link.style.transform = 'translateY(-15px)';
                    link.style.opacity = '0';
                });
            }
        });

        // Close mobile menu on link click
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    document.body.style.overflow = '';
                    navItems.forEach(link => {
                        link.style.transitionDelay = '0s';
                        link.style.transform = 'translateY(-15px)';
                        link.style.opacity = '0';
                    });
                }
            });
        });
    }

    // 3. Navbar Scroll Effect: Hide on Scroll Down, Show on Scroll Up
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    const scrollThreshold = 80;

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        // Hide navbar on down scroll, reveal on up scroll
        if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
            navbar.classList.add('hidden');
            // Close mobile menu if scroll starts
            if (navLinks && navLinks.classList.contains('active')) {
                menuToggle.click();
            }
        } else {
            navbar.classList.remove('hidden');
        }
        lastScrollTop = scrollTop;
    }, { passive: true });

    // 4. ScrollSpy: Highlight Active Nav Link
    const sections = document.querySelectorAll('section[id]');
    
    const highlightNavLink = () => {
        let currentSectionId = '';
        const isAtBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 20);

        if (isAtBottom && sections.length > 0) {
            currentSectionId = sections[sections.length - 1].getAttribute('id');
        } else {
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                // Check if section is centered or occupies the middle viewport line
                if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4) {
                    currentSectionId = section.getAttribute('id');
                }
            });
        }

        if (currentSectionId) {
            navItems.forEach(a => {
                if (a.getAttribute('href').includes(currentSectionId)) {
                    a.classList.add('active');
                } else {
                    a.classList.remove('active');
                }
            });
        }
    };
    window.addEventListener('scroll', highlightNavLink, { passive: true });
    highlightNavLink(); // Initial call

    // 5. Intersection Observer: Lazy Reveals on Scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => {
        scrollObserver.observe(el);
    });

    // 6. Horizontal Carousels Interactive Control (Mobile touch / Desktop arrows)
    const carouselWrappers = document.querySelectorAll('.events-carousel-wrapper');
    carouselWrappers.forEach(wrapper => {
        const carousel = wrapper.querySelector('.events-carousel');
        const arrowLeft = wrapper.querySelector('.carousel-arrow-left');
        const arrowRight = wrapper.querySelector('.carousel-arrow-right');

        if (!carousel) return;

        // Hide expired news cards on initial load
        const sectionId = wrapper.closest('section')?.id;
        const today = new Date().getTime();

        if (sectionId === 'neuigkeiten' || sectionId === 'termine') {
            const cards = Array.from(carousel.querySelectorAll('.event-card'));
            const monthMap = {
                'jan': 0, 'feb': 1, 'mär': 2, 'mar': 2, 'apr': 3, 'mai': 4,
                'may': 4, 'jun': 5, 'jul': 6, 'aug': 7, 'sep': 8, 'okt': 9,
                'oct': 9, 'nov': 10, 'dez': 11, 'dec': 11
            };

            cards.forEach(card => {
                // Read dates to filter expired news (e.g. news older than 12 months)
                if (sectionId === 'neuigkeiten') {
                    const timeEl = card.querySelector('.time');
                    if (timeEl) {
                        const parts = timeEl.textContent.trim().toLowerCase().split(/[ .]+/);
                        if (parts.length >= 3) {
                            const day = parseInt(parts[0], 10);
                            const month = monthMap[parts[1].substring(0, 3)] || 0;
                            const year = parseInt(parts[2], 10);
                            const cardTime = new Date(year, month, day).getTime();
                            
                            const oneYearAgo = today - (365 * 24 * 60 * 60 * 1000);
                            if (cardTime < oneYearAgo) {
                                card.style.display = 'none';
                                card.classList.add('expired-hidden');
                            }
                        }
                    }
                } else if (sectionId === 'termine') {
                    // For Termine, hide events that happened yesterday or earlier
                    const dateText = card.querySelector('.event-card-date')?.textContent || '';
                    const match = dateText.match(/(\d+)\.\s+(\w+)\s+(\d{4})/);
                    if (match) {
                        const day = parseInt(match[1], 10);
                        const month = monthMap[match[2].toLowerCase().substring(0, 3)] || 0;
                        const year = parseInt(match[3], 10);
                        const eventDate = new Date(year, month, day, 23, 59, 59).getTime();

                        if (eventDate < today) {
                            card.style.display = 'none';
                            card.classList.add('expired-hidden');
                        }
                    }
                }
            });
        }

        const updateArrows = () => {
            if (!arrowLeft || !arrowRight) return;

            const scrollLeft = carousel.scrollLeft;
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;

            if (scrollLeft > 15) {
                arrowLeft.classList.add('visible');
            } else {
                arrowLeft.classList.remove('visible');
            }

            if (maxScroll - scrollLeft > 15) {
                arrowRight.classList.add('visible');
            } else {
                arrowRight.classList.remove('visible');
            }
        };

        const scrollCarousel = (direction) => {
            const cards = Array.from(carousel.querySelectorAll('.event-card, .track-card')).filter(c => c.style.display !== 'none');
            if (cards.length === 0) return;

            const cardWidth = cards[0].getBoundingClientRect().width;
            const gap = parseFloat(getComputedStyle(carousel).gap) || 24;
            const scrollAmount = cardWidth + gap;

            carousel.scrollBy({
                left: direction * scrollAmount,
                behavior: 'smooth'
            });
        };

        if (arrowLeft && arrowRight) {
            arrowLeft.addEventListener('click', () => scrollCarousel(-1));
            arrowRight.addEventListener('click', () => scrollCarousel(1));
            carousel.addEventListener('scroll', updateArrows, { passive: true });
            
            // Initial call to position arrows
            setTimeout(updateArrows, 300);
        }

        // --- Custom Carousel Indicators (Dots) ---
        const dotsContainer = document.createElement('div');
        dotsContainer.classList.add('carousel-dots');
        wrapper.appendChild(dotsContainer);

        const updateDots = () => {
            const cards = Array.from(carousel.querySelectorAll('.event-card, .track-card')).filter(c => c.style.display !== 'none');
            
            // Hide dots if all items fit in the carousel width
            if (cards.length <= 1 || carousel.scrollWidth <= carousel.clientWidth + 15) {
                dotsContainer.style.display = 'none';
                return;
            } else {
                dotsContainer.style.display = 'flex';
            }

            if (dotsContainer.children.length !== cards.length) {
                dotsContainer.innerHTML = '';
                cards.forEach((_, idx) => {
                    const dot = document.createElement('span');
                    dot.classList.add('carousel-dot');
                    dot.addEventListener('click', () => {
                        const targetLeft = idx * (cards[0].getBoundingClientRect().width + (parseFloat(getComputedStyle(carousel).gap) || 24));
                        carousel.scrollTo({
                            left: targetLeft,
                            behavior: 'smooth'
                        });
                    });
                    dotsContainer.appendChild(dot);
                });
            }

            // Find current active dot
            const carouselCenter = carousel.getBoundingClientRect().left + (carousel.clientWidth / 2);
            let closestIdx = 0;
            let closestDistance = Infinity;

            cards.forEach((card, idx) => {
                const cardCenter = card.getBoundingClientRect().left + (card.getBoundingClientRect().width / 2);
                const dist = Math.abs(carouselCenter - cardCenter);
                if (dist < closestDistance) {
                    closestDistance = dist;
                    closestIdx = idx;
                }
            });

            Array.from(dotsContainer.children).forEach((dot, idx) => {
                if (idx === closestIdx) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        };

        carousel.addEventListener('scroll', updateDots, { passive: true });
        window.addEventListener('resize', () => {
            updateArrows();
            updateDots();
        });
        
        setTimeout(updateDots, 300);
    });

    // 7. Parallax Scroll Effect for Hero Background
    const hero = document.querySelector('.hero-section');
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrollY = window.pageYOffset;
            if (scrollY < window.innerHeight) {
                // Parallax shift factor (0.3)
                hero.style.setProperty('--hero-translate-y', `${scrollY * 0.3}px`);
            }
        }, { passive: true });
    }

    // 8. FAQ Accordion Click Behavior
    document.querySelectorAll('.faq-item').forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (question && answer) {
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');

                // Collapse all other accordion items
                document.querySelectorAll('.faq-item').forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherAnswer) otherAnswer.style.maxHeight = null;
                });

                if (!isActive) {
                    item.classList.add('active');
                    answer.style.maxHeight = `${answer.scrollHeight}px`;
                } else {
                    item.classList.remove('active');
                    answer.style.maxHeight = null;
                }
            });
        }
    });
});
