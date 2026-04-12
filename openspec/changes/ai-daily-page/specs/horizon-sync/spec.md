## ADDED Requirements

### Requirement: Horizon configuration for AI news sources
The system SHALL include a Horizon config file that defines DeepSeek as the AI provider and includes HackerNews, arXiv RSS (cs.AI, cs.CL), Reddit (r/artificial, r/MachineLearning, r/LocalLLaMA), and curated AI blog RSS feeds as data sources. The AI score threshold SHALL be 6.0 and time window SHALL be 24 hours.

#### Scenario: Daily sync with configured sources
- **WHEN** the Horizon sync runs
- **THEN** it fetches from all configured sources, scores items with DeepSeek, and outputs items scoring ≥ 6.0

### Requirement: GitHub Actions workflow runs Horizon daily
The system SHALL include a `sync-horizon.yml` workflow that runs daily via cron, sets up Python + uv, runs Horizon, converts output to JSON, and commits changes.

#### Scenario: Scheduled daily run
- **WHEN** the cron triggers at the configured time
- **THEN** Horizon runs, the conversion script produces a JSON file in `profile-data/ai-daily/{date}.json`, and changes are committed and pushed

#### Scenario: No new content
- **WHEN** Horizon produces no items above the score threshold
- **THEN** no JSON file is created for that day and no commit is made

#### Scenario: Manual trigger
- **WHEN** a user triggers the workflow manually via workflow_dispatch
- **THEN** the sync runs immediately with the same pipeline

### Requirement: Convert Horizon Markdown to structured JSON
The system SHALL include a TypeScript conversion script that parses Horizon's Markdown summary output and produces a structured JSON file with `date`, `itemCount`, and `sections` (each containing categorized news items with title, summary, url, sources, and tags).

#### Scenario: Markdown with mixed content
- **WHEN** Horizon outputs a Markdown file with headlines, research papers, and tool releases
- **THEN** the conversion script categorizes items into three sections: "Headlines & Launches", "Research & Innovation", "Engineering & Resources"

#### Scenario: Missing or empty Markdown
- **WHEN** the Horizon output directory has no new Markdown file
- **THEN** the conversion script exits cleanly without creating a JSON file
