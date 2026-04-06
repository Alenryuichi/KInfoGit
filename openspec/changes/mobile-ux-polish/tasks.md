## 1. Mobile Menu Animation

- [ ] 1.1 Wrap the mobile menu in framer-motion AnimatePresence in Header.tsx
- [ ] 1.2 Add motion.div with slide-down + fade-in enter animation and slide-up + fade-out exit animation (~200-250ms)
- [ ] 1.3 Restyle the "Book a Call" button to secondary/outline style with smaller size on mobile

## 2. Blog Tab Scroll Hint

- [ ] 2.1 Add CSS mask-image gradient (`linear-gradient(to right, black 85%, transparent)`) to the blog tab scroll container in blog.tsx
- [ ] 2.2 Ensure the mask only applies when tabs overflow (use overflow-x-auto as the trigger context)

## 3. Blog Detail Padding

- [ ] 3.1 Update the blog detail article container padding from `px-4` to `px-5 sm:px-6` in blog/[slug].tsx

## 4. Testing

- [ ] 4.1 Verify mobile menu animation on 375px (iPhone SE) and 390px (iPhone 14) viewports
- [ ] 4.2 Verify blog tab scroll hint appears on narrow viewports and disappears when tabs fit
- [ ] 4.3 Verify blog detail padding looks correct on 320px, 375px, and 390px viewports
- [ ] 4.4 Verify no regressions on desktop viewports (1024px+)
