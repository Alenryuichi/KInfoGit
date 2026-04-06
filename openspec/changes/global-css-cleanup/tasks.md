## 1. Audit

- [x] 1.1 Grep all `<section` usage across the `website/` directory and catalog which elements rely on the global padding
- [x] 1.2 Check each found `<section>` for existing explicit padding classes to avoid duplication

## 2. Add Explicit Padding

- [x] 2.1 Add `py-20 lg:py-24` to each `<section>` element in `website/pages/work.tsx`
- [x] 2.2 Add `py-20 lg:py-24` to each `<section>` element in `website/pages/about.tsx`
- [x] 2.3 Add explicit padding to any other component `<section>` elements found in the audit

## 3. Remove Global Rule

- [x] 3.1 Remove `section { @apply py-20 lg:py-24; }` from `website/styles/globals.css`

## 4. Verification

- [x] 4.1 Run the build (`just build`) to confirm no compilation errors
- [x] 4.2 Visually verify the Work page looks the same before and after
- [x] 4.3 Visually verify the About page looks the same before and after
- [x] 4.4 Visually verify all other pages with `<section>` elements look the same
