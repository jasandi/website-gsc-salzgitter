#!/bin/bash
cat << 'INNER_EOF' > /tmp/termine.css
.termine-centered-section {
  position: relative;
  overflow: visible;
  padding-top: 0 !important; /* Managed by sticky header */
  /* Height will be managed by JS for Scrollytelling */
  min-height: 100vh;
  display: grid; /* Used to perfectly overlap wrapper and scroll container */
}

.termine-sticky-wrapper {
  position: sticky;
  top: 0;
  height: 100vh; /* Fallback for older browsers */
  height: 100dvh; /* Sticks until its 100dvh bottom edge hits the section bottom */
  width: 100%;
  pointer-events: none; /* Allows clicks to pass through to the scrolling content if needed */
  grid-area: 1 / 1; /* Overlap with scroll container */
  align-self: start; /* Prevents grid from stretching the wrapper */
  z-index: 10; /* Ensures the wrapper (and header) renders on top of the scroll container */
}

.termine-sticky-header {
  position: relative; /* Inside the sticky wrapper */
  padding: 4rem 0 2rem 0;
  background: linear-gradient(180deg, var(--bg-dark) 80%, transparent 100%);
  text-align: center;
}

.termine-scroll-container {
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100dvh;
  z-index: 1; /* Scroll behind the sticky header's solid background */
  grid-area: 1 / 1; /* Overlap with sticky wrapper */
  align-self: start;
  
  /* Flex container for absolute pages */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* New Classes for JS Paging */
.termine-page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  /* Push content down below the sticky header */
  padding-top: 180px; 
  padding-bottom: 2rem;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
  /* GPU acceleration */
  transform: translate3d(0, 40px, 0);
  transition: opacity 0.5s ease, transform 0.5s ease, visibility 0.5s ease;
}

.termine-page.is-active {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translate3d(0, 0, 0);
}

.termine-page.is-past {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate3d(0, -40px, 0);
}
INNER_EOF

# Replace the block in styles.css
sed -i '' -e '/\.termine-centered-section {/,/\.termine-scroll-container {/{' \
    -e '/\.termine-scroll-container {/!d' \
    -e '}' css/styles.css

# Now remove the termine-scroll-container block itself
sed -i '' -e '/\.termine-scroll-container {/,/align-self: start;/d' css/styles.css
sed -i '' -e '/^}/d' css/styles.css

# Wait, sed is fragile here. Let's use perl.
