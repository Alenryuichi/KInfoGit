# stars-rss-discovery Specification

## Purpose
TBD - created by archiving change stars-rss-feed. Update Purpose after archive.
## Requirements
### Requirement: RSS autodiscovery link tag
The `/stars/` page SHALL include an RSS autodiscovery `<link>` element in the HTML `<head>`.

#### Scenario: Link tag present in page head
- **WHEN** a user or RSS reader visits `/stars/`
- **THEN** the page `<head>` SHALL contain `<link rel="alternate" type="application/rss+xml" title="Stars & Posts — Kylin Miao" href="/stars/feed.xml" />`

### Requirement: Visible RSS link in page header
The Stars list page SHALL display a visible RSS icon/link in the page header area, next to or near the page title.

#### Scenario: RSS link renders on stars page
- **WHEN** a user views the `/stars/` page
- **THEN** an RSS icon (SVG) with a link to `/stars/feed.xml` SHALL be visible in the header section

#### Scenario: RSS link opens feed URL
- **WHEN** a user clicks the RSS icon/link
- **THEN** the browser SHALL navigate to `/stars/feed.xml`

### Requirement: RSS link styling
The RSS link SHALL follow the site's existing design language (white text/icons on black background, consistent with the Stars page styling).

#### Scenario: Visual consistency
- **WHEN** the RSS icon is rendered
- **THEN** it SHALL use a subdued color (e.g., `text-gray-400`) consistent with the existing subtitle text, and brighten on hover

