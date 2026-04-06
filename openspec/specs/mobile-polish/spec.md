## ADDED Requirements

### Requirement: Mobile menu has enter and exit animation
The mobile navigation menu SHALL animate when opening and closing. The menu MUST slide down and fade in when opened, and slide up and fade out when closed. The animation MUST use framer-motion AnimatePresence for proper exit animation handling. The animation duration MUST be short (approximately 200ms) to feel responsive.

#### Scenario: User opens mobile menu
- **WHEN** user taps the hamburger/menu button on a mobile viewport
- **THEN** the mobile menu slides down and fades in with a smooth animation

#### Scenario: User closes mobile menu
- **WHEN** user taps the close button or menu button while the menu is open
- **THEN** the mobile menu slides up and fades out before being removed from the DOM

#### Scenario: Book a Call button on mobile
- **WHEN** the mobile menu is displayed on a small screen
- **THEN** the Book a Call button SHALL be rendered with a smaller, secondary/outline style to reduce visual prominence compared to desktop

### Requirement: Blog tabs show scroll hint on mobile
The blog theme tab bar SHALL display a visual scroll hint when the tabs overflow horizontally on mobile viewports. The hint MUST be a CSS gradient mask that fades the right edge of the tab container, signaling that more content is available by scrolling.

#### Scenario: Tabs overflow on narrow viewport
- **WHEN** the blog page is viewed on a viewport where the theme tabs exceed the container width
- **THEN** a gradient fade effect SHALL appear on the right edge of the tab bar indicating scrollable content

#### Scenario: Tabs fit within viewport
- **WHEN** the blog page is viewed on a viewport where all theme tabs fit without scrolling
- **THEN** the gradient fade effect SHALL not visually obstruct the tab content

### Requirement: Blog detail page is readable on small screens
The blog detail page MUST have sufficient horizontal padding for comfortable reading on mobile devices. The padding SHALL be at least 20px (Tailwind `px-5`) on the smallest screens and increase to 24px (`sm:px-6`) on small breakpoint and above.

#### Scenario: Blog post viewed on small mobile screen
- **WHEN** a user views a blog post on a viewport narrower than the `sm` breakpoint (640px)
- **THEN** the content area SHALL have horizontal padding of at least 20px on each side

#### Scenario: Blog post viewed on larger mobile screen
- **WHEN** a user views a blog post on a viewport at or above the `sm` breakpoint
- **THEN** the content area SHALL have horizontal padding of at least 24px on each side
