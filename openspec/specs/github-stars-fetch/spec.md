# github-stars-fetch Specification

## Purpose
TBD - created by archiving change github-stars-deepseek. Update Purpose after archive.
## Requirements
### Requirement: Fetch starred repos from GitHub API
The system SHALL fetch starred repositories from configurable GitHub users via `GET /users/{user}/starred` with star timestamp header.

#### Scenario: Successful fetch for multiple users
- **WHEN** the script runs with users `['Alenryuichi', 'karpathy', 'yironghuang']`
- **THEN** it SHALL fetch the first page of starred repos for each user, extracting `starred_at`, repo name, description, language, stargazers count, and topics

#### Scenario: GitHub API rate limited
- **WHEN** the GitHub API returns 403 rate limit
- **THEN** the script SHALL log a warning and skip remaining requests for that user

### Requirement: Group stars by date
The system SHALL group fetched stars by their `starred_at` date and write one JSON file per date to `profile-data/github-stars/YYYY-MM-DD.json`.

#### Scenario: Stars from today
- **WHEN** a user starred repos on 2026-04-12
- **THEN** the script SHALL create `profile-data/github-stars/2026-04-12.json` containing only that day's stars

#### Scenario: JSON already exists for date
- **WHEN** a JSON file already exists for the target date
- **THEN** the script SHALL merge new stars into the existing file, avoiding duplicates by repo full name

### Requirement: Generate AI commentary via DeepSeek API
The system SHALL call the DeepSeek Chat API for each starred repo to generate `highlights` (core value, 2-3 sentences) and `worthReading` (why it's worth exploring, 1-2 sentences).

#### Scenario: DeepSeek API key available
- **WHEN** `DEEPSEEK_API_KEY` environment variable is set
- **THEN** the script SHALL call DeepSeek for each repo that lacks AI commentary, using repo name, description, language, and topics as context

#### Scenario: No DeepSeek API key
- **WHEN** `DEEPSEEK_API_KEY` is not set
- **THEN** the script SHALL skip AI commentary generation and store repos with empty `highlights` and `worthReading` fields

#### Scenario: DeepSeek API error
- **WHEN** the DeepSeek API returns an error for a specific repo
- **THEN** the script SHALL log the error and continue with the next repo, leaving that repo's commentary empty

### Requirement: JSON data schema
Each daily JSON file SHALL conform to this structure:

```json
{
  "date": "YYYY-MM-DD",
  "stars": [
    {
      "repo": "owner/name",
      "url": "https://github.com/owner/name",
      "description": "string",
      "language": "string | null",
      "stargazersCount": 0,
      "starredBy": "username",
      "highlights": "string",
      "worthReading": "string",
      "topics": ["string"]
    }
  ]
}
```

#### Scenario: Valid JSON output
- **WHEN** the script completes for a date with stars
- **THEN** the output JSON SHALL contain all required fields, with `highlights` and `worthReading` as empty strings if no AI commentary was generated

