## Context

This is a Next.js 16 (Pages Router) portfolio site using Tailwind CSS and framer-motion. The site is statically exported to GitHub Pages. On mobile viewports, three UX issues have been identified: an unanimated mobile menu, missing scroll hints on blog tabs, and tight blog detail padding.

framer-motion is already a project dependency, so animation primitives are available without adding new packages.

## Goals / Non-Goals

**Goals:**

- Smooth, polished mobile menu open/close transitions
- Clear visual affordance that blog tabs are scrollable
- Comfortable reading experience on small screens

**Non-Goals:**

- Redesigning the navigation structure or adding a bottom tab bar
- Changing the desktop layout or behavior
- Adding swipe gestures or other touch interactions
- Reworking the blog tab filtering logic

## Decisions

### 1. Mobile menu animation approach

Use framer-motion `AnimatePresence` with `motion.div` for the mobile menu container. Animation: slide down from top + fade in on enter, slide up + fade out on exit. Duration ~200-250ms with ease-out timing.

**Rationale:** framer-motion is already in the project and provides `AnimatePresence` for clean exit animations, which CSS alone cannot handle well. The slide-down direction matches the menu's position below the header.

**Alternative considered:** CSS `@keyframes` + `transition` — rejected because exit animations require JS to delay unmount, which framer-motion handles natively.

### 2. Book a Call button on mobile

Keep the button but reduce prominence: use a smaller size and secondary/outline style instead of primary filled. This preserves the CTA without dominating limited mobile space.

**Rationale:** Removing it entirely loses a conversion path. Making it secondary balances space efficiency with accessibility.

### 3. Blog tab scroll hint

Apply CSS `mask-image: linear-gradient(to right, black 85%, transparent)` on the scrollable tab container when content overflows. Pure CSS approach — no JS scroll listeners needed.

**Rationale:** CSS mask is well-supported, performant, and requires no runtime logic. The 85% threshold provides a clear fade zone without obscuring the last visible tab too much.

**Alternative considered:** JS-based scroll listener to show/hide a gradient overlay — rejected as overengineered for this use case.

### 4. Blog detail padding

Change from `px-4` to `px-5 sm:px-6` on the article container. This gives slightly more breathing room on small screens while being more generous on sm+ breakpoints.

**Rationale:** `px-4` (16px) is functional but feels cramped for long-form reading. `px-5` (20px) is a minimal improvement that aids readability without wasting screen width.

## Risks / Trade-offs

- [CSS mask-image compatibility] → Supported in all modern browsers; graceful degradation (no mask) on older browsers, which is acceptable.
- [Animation performance on low-end devices] → framer-motion uses hardware-accelerated transforms by default; 200ms duration is short enough to feel responsive.
- [Book a Call button visibility reduction] → May slightly reduce CTA engagement on mobile, but the current prominent placement is not converting well anyway.
