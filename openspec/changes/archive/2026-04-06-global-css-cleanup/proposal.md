## Why

The global `section { @apply py-20 lg:py-24; }` rule in `globals.css` applies 160px vertical padding to every `<section>` element site-wide. This is a hidden dependency that already caused a spacing bug during the blog page redesign (we had to change `<section>` to `<div>` to work around it). Any new page or component using `<section>` will inherit unexpected padding, making the styling brittle and hard to reason about.

## What Changes

- Remove the global `section { @apply py-20 lg:py-24; }` rule from `website/styles/globals.css`
- Add explicit `py-20 lg:py-24` classes to each `<section>` element in `website/pages/work.tsx` and `website/pages/about.tsx` that currently relies on the global rule
- Audit all other components for `<section>` usage and add explicit padding where needed

## Capabilities

### New Capabilities

- `explicit-section-spacing`: Ensures all section spacing is declared explicitly via utility classes rather than global element-level CSS rules

### Modified Capabilities

(none)

## Impact

- `website/styles/globals.css` — global rule removal
- `website/pages/work.tsx` — add explicit padding classes
- `website/pages/about.tsx` — add explicit padding classes
- Any other component using `<section>` tags that relied on the global rule
