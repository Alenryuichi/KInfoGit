## ADDED Requirements

### Requirement: Stars tab in main navigation
The Header component SHALL include a "Stars" navigation item linking to `/stars/`.

#### Scenario: Navigation displays Stars tab
- **WHEN** viewing any page on the site
- **THEN** the Header navigation SHALL show 5 tabs: Home, About, Work, Blog, Stars

#### Scenario: Active state on stars pages
- **WHEN** the current route is `/stars/` or `/stars/[date]/`
- **THEN** the "Stars" tab SHALL display the active state styling (same as other active tabs)

### Requirement: Mobile menu includes Stars
The mobile hamburger menu SHALL include the Stars navigation item.

#### Scenario: Mobile menu shows Stars
- **WHEN** a user opens the mobile menu
- **THEN** "Stars" SHALL appear in the navigation list with proper active state when on stars pages
