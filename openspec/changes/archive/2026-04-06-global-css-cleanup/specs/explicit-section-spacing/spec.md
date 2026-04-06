## ADDED Requirements

### Requirement: No global element-level styling for section elements

The file `website/styles/globals.css` SHALL NOT contain any element-level CSS rules targeting `section` elements. All spacing for `<section>` elements MUST be applied via explicit utility classes on each element.

#### Scenario: globals.css has no section rule

- **WHEN** inspecting `website/styles/globals.css`
- **THEN** there SHALL be no CSS rule targeting the `section` element selector

#### Scenario: New section element has no implicit padding

- **WHEN** a developer adds a new `<section>` element to any page without utility classes
- **THEN** the element SHALL have no padding applied from global styles

### Requirement: Existing page sections maintain visual spacing

All `<section>` elements in `website/pages/work.tsx` and `website/pages/about.tsx` that previously relied on the global `section { @apply py-20 lg:py-24; }` rule MUST have explicit `py-20 lg:py-24` classes applied to preserve identical visual spacing.

#### Scenario: Work page sections have explicit padding

- **WHEN** rendering the Work page (`/work`)
- **THEN** each `<section>` element that previously had global padding SHALL have `py-20` and `lg:py-24` classes applied directly

#### Scenario: About page sections have explicit padding

- **WHEN** rendering the About page (`/about`)
- **THEN** each `<section>` element that previously had global padding SHALL have `py-20` and `lg:py-24` classes applied directly

#### Scenario: No visual regression on any page

- **WHEN** comparing the rendered output of all pages before and after the change
- **THEN** the visual appearance of every page SHALL be identical
