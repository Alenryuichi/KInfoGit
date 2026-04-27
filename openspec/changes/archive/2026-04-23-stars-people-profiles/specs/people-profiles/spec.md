## ADDED Requirements

### Requirement: People index page lists all tracked people
The system SHALL render a page at `/stars/people/` displaying a grid of all people defined in `profile-data/people.json`. Each person card SHALL show their avatar image, display name, and platform badges indicating which platforms (GitHub, Bluesky) they are tracked on.

#### Scenario: Visitor loads people index
- **WHEN** a visitor navigates to `/stars/people/`
- **THEN** the page displays a responsive grid of person cards, one per entry in `people.json`, sorted alphabetically by display name

#### Scenario: Person card shows platform badges
- **WHEN** a person has both `github` and `bluesky` fields in `people.json`
- **THEN** their card displays both a GitHub badge and a Bluesky badge
- **WHEN** a person has only a `github` field
- **THEN** their card displays only a GitHub badge

#### Scenario: Person card links to detail page
- **WHEN** a visitor clicks on a person card
- **THEN** they are navigated to `/stars/people/{id}/` where `{id}` is the person's canonical id

### Requirement: People index page is statically generated
The system SHALL generate the people index page at build time using `getStaticProps`. No runtime data fetching SHALL occur.

#### Scenario: Static generation of people index
- **WHEN** `next build` runs
- **THEN** the `/stars/people/` page is generated as a static HTML file containing all people from `people.json`

### Requirement: Person detail page shows profile information
The system SHALL render a page at `/stars/people/[handle]/` for each person defined in `people.json`. The page SHALL display the person's name, avatar, bio line, and external links to their GitHub profile and/or Bluesky profile.

#### Scenario: Visitor views a person profile
- **WHEN** a visitor navigates to `/stars/people/karpathy/`
- **THEN** the page displays the person's name ("Andrej Karpathy"), avatar image, bio line, and clickable links to their GitHub and Bluesky profiles

#### Scenario: Person with only one platform
- **WHEN** a person has a `github` field but no `bluesky` field
- **THEN** the detail page shows only a GitHub profile link and no Bluesky link

### Requirement: Person detail page shows recent interests summary
The system SHALL display an AI-generated summary of the person's recent starring and posting activity on their detail page. The summary SHALL describe the topics and themes they have been interested in.

#### Scenario: Recent interests displayed
- **WHEN** a visitor views a person's detail page and the person has activity in the last 30 days
- **THEN** a "Recent interests" section displays a 1-2 sentence AI-generated summary of their recent activity themes

#### Scenario: No recent activity
- **WHEN** a person has no stars or posts in the last 30 days
- **THEN** the "Recent interests" section displays a message indicating no recent activity

### Requirement: Person detail page shows activity sparkline
The system SHALL display an activity sparkline chart on each person's detail page. The sparkline SHALL show the count of stars and posts per day over the last 30 days as an inline SVG polyline.

#### Scenario: Sparkline renders activity data
- **WHEN** a visitor views a person's detail page
- **THEN** a sparkline chart is displayed showing daily activity counts for the last 30 days, with days on the x-axis and activity count on the y-axis

#### Scenario: Sparkline handles zero-activity days
- **WHEN** a person has days with zero activity within the 30-day window
- **THEN** those days appear as zero-height points on the sparkline (the line touches the baseline)

### Requirement: Person detail page lists recent activity items
The system SHALL display a chronological list of the person's recent starred repos and Bluesky posts on their detail page. Starred repos SHALL use the existing RepoCard styling and Bluesky posts SHALL use the existing BlueskyPostCard styling.

#### Scenario: Mixed activity from both platforms
- **WHEN** a person has both GitHub stars and Bluesky posts in the last 30 days
- **THEN** the activity list shows all items sorted by date (newest first), with each item rendered using the appropriate card component

#### Scenario: Activity limited to 30 days
- **WHEN** a person has activity older than 30 days
- **THEN** only activity from the last 30 days is shown on the detail page

### Requirement: Person detail pages are statically generated
The system SHALL generate one static HTML page per person at build time using `getStaticPaths` and `getStaticProps`. The `getStaticPaths` function SHALL return paths for all people in `people.json` with `fallback: false`.

#### Scenario: Static paths generated from people.json
- **WHEN** `next build` runs
- **THEN** one static page is generated for each entry in `people.json` at the path `/stars/people/{id}/`

### Requirement: Author names on date pages link to person profiles
On the `/stars/[date]/` page, author names in RepoCard (`starredBy`) and BlueskyPostCard (`author.handle`) SHALL link to the corresponding person's profile page at `/stars/people/{id}/` when that person exists in `people.json`.

#### Scenario: GitHub star author links to profile
- **WHEN** a RepoCard displays `starredBy: "karpathy"` and "karpathy" maps to a person in `people.json`
- **THEN** the author name is rendered as an internal link to `/stars/people/karpathy/`

#### Scenario: Bluesky post author links to profile
- **WHEN** a BlueskyPostCard displays an author with handle `simonwillison.net` and that handle maps to a person in `people.json`
- **THEN** the author name is rendered as an internal link to the corresponding person's profile page

#### Scenario: Unknown author remains plain text
- **WHEN** an author name does not match any person in `people.json`
- **THEN** the author name is displayed as plain text (no link)

### Requirement: People pages follow site dark theme and styling
All people-related pages and components SHALL use the site's existing dark theme with Tailwind CSS utility classes. Card styling, typography, and spacing SHALL be consistent with existing components on `/stars/[date]`.

#### Scenario: Visual consistency with existing pages
- **WHEN** a visitor navigates between `/stars/2025-04-10/` and `/stars/people/`
- **THEN** the visual style (background color, text color, card borders, font sizes) is consistent between both pages
