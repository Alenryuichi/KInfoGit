## Context

`website/styles/globals.css` contains a global element-level rule `section { @apply py-20 lg:py-24; }` that implicitly applies vertical padding to every `<section>` element. This already caused a bug during the blog page redesign where we had to swap `<section>` for `<div>` to avoid unwanted spacing. The Work page (`pages/work.tsx`) and About page (`pages/about.tsx`) also use `<section>` tags and rely on this implicit padding.

## Goals / Non-Goals

**Goals:**

- Make all section spacing explicit via Tailwind utility classes on each element
- Zero visual regression — every page should look identical before and after
- Prevent future spacing bugs from hidden global styles

**Non-Goals:**

- Redesigning any page layouts or changing spacing values
- Refactoring page structure beyond adding explicit classes
- Addressing other global styles in `globals.css`

## Decisions

1. **Remove `section { @apply py-20 lg:py-24; }` from globals.css.** This eliminates the hidden dependency at the source. Alternative considered: scoping the rule with a class selector — rejected because it still hides the dependency.

2. **Audit all `<section>` usage via grep before making changes.** Ensures we don't miss any element that relies on the global padding. Search `website/` for `<section` to build a complete list.

3. **Add `py-20 lg:py-24` directly to each `<section>` className.** Uses the exact same Tailwind classes so the rendered CSS is identical. This is the simplest change with the lowest risk of regression.

4. **Remove the global rule last (after adding explicit classes).** This ordering ensures there's no intermediate state where pages lose their spacing.

## Risks / Trade-offs

- **Missed `<section>` element** → Visual regression with lost padding. Mitigation: thorough grep of the entire `website/` directory and visual verification of every page.
- **Duplicate padding on elements that already have explicit padding** → Double spacing. Mitigation: check each `<section>`'s existing className before adding classes.
