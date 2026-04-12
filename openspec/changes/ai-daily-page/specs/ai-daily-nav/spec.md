## ADDED Requirements

### Requirement: Add AI Daily to header navigation
The Header component SHALL include an "AI Daily" navigation item after "Blog" in the NAV_ITEMS array, linking to `/ai-daily/`.

#### Scenario: Navigation renders with AI Daily tab
- **WHEN** any page loads
- **THEN** the header shows: Home, About, Work, Blog, AI Daily

### Requirement: Active state detection for AI Daily
The Header component SHALL detect paths starting with `/ai-daily` and highlight the "AI Daily" tab as active.

#### Scenario: On AI Daily pages
- **WHEN** user is on `/ai-daily/` or `/ai-daily/2026-04-10/`
- **THEN** the "AI Daily" tab is highlighted as the active navigation item
