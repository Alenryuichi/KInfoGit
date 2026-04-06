## Why

Mobile experience has several rough edges: the header mobile menu appears instantly with no animation, the blog theme tabs lack visual scroll hints on smaller screens, and blog detail padding is tight for comfortable reading. These issues make the site feel unpolished on mobile devices, which represent a significant portion of visitors.

## What Changes

- Add slide-down + fade enter/exit animation to the mobile navigation menu using framer-motion AnimatePresence
- Make the "Book a Call" button less prominent on mobile (smaller, secondary style) to reclaim space
- Add CSS gradient mask scroll hint on the right edge of the blog tab bar when content is scrollable
- Adjust blog detail page horizontal padding for better readability on small screens

## Capabilities

### New Capabilities
- `mobile-nav-animation`: Animated mobile menu with enter/exit transitions using framer-motion
- `scroll-hint`: Visual scroll indicator (CSS gradient fade) for horizontally scrollable content

### Modified Capabilities

## Impact

- `website/components/Header.tsx` — mobile menu animation and Book a Call button styling
- `website/pages/blog.tsx` — scroll hint on theme tab bar
- `website/pages/blog/[slug].tsx` — mobile padding adjustments
- framer-motion (existing dependency) — used for menu animation
