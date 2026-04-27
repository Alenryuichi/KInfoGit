# focus-topic-filter Specification

## Purpose
TBD - created by archiving change ai-daily-focus-topics. Update Purpose after archive.
## Requirements
### Requirement: Focus topic detection in conversion script
The conversion script SHALL detect focus topics for each news item by matching title, summary, and tags against a predefined keyword mapping. Each item SHALL have a `focusTopics` string array containing zero or more matched topic IDs.

The predefined topics SHALL be:
- `memory`: memory, retrieval, RAG, context window, long-term, episodic, procedural memory, knowledge graph
- `self-evolution`: self-evolving, self-improvement, auto-optimization, self-play, self-refine, evoagent, meta-learning
- `multi-agent`: multi-agent, multi agent, swarm, collaboration, a2a, agent-to-agent, orchestrat, crew
- `planning`: planning, reasoning, chain-of-thought, cot, tree-of-thought, task decomposition, step-by-step
- `reflection`: reflection, self-correct, self-evaluation, critique, reflexion, verify, self-debug
- `tool-use`: tool use, tool calling, function calling, mcp, tool creation, api integration

#### Scenario: Item matches one topic
- **WHEN** a news item's title contains "New Memory Architecture for LLM Agents"
- **THEN** the item's `focusTopics` SHALL contain `["memory"]`

#### Scenario: Item matches multiple topics
- **WHEN** a news item's summary contains "multi-agent planning framework"
- **THEN** the item's `focusTopics` SHALL contain `["multi-agent", "planning"]`

#### Scenario: Item matches no topics
- **WHEN** a news item contains no focus topic keywords
- **THEN** the item's `focusTopics` SHALL be an empty array `[]`

### Requirement: Focus topic filter UI on detail page
The detail page SHALL display a horizontal row of filter chips when the day's digest contains at least one item with a non-empty `focusTopics`. An "All" chip SHALL be selected by default.

#### Scenario: Filter by topic
- **WHEN** user clicks a focus topic chip (e.g., "Memory")
- **THEN** only items whose `focusTopics` includes that topic SHALL be displayed, across all sections
- **THEN** empty sections (no matching items) SHALL be hidden

#### Scenario: Clear filter
- **WHEN** user clicks the "All" chip
- **THEN** all items SHALL be displayed (no filter applied)

#### Scenario: No focus topics for the day
- **WHEN** no items in the digest have any focus topics
- **THEN** the filter chip bar SHALL NOT be rendered

### Requirement: Focus topic badges on news items
Each news item card SHALL display its matched focus topics as small colored badges below the source/tag line.

#### Scenario: Item has focus topics
- **WHEN** a news item has `focusTopics: ["memory", "planning"]`
- **THEN** two small badges labeled "Memory" and "Planning" SHALL be displayed

#### Scenario: Item has no focus topics
- **WHEN** a news item has empty `focusTopics`
- **THEN** no focus topic badges SHALL be displayed

### Requirement: Focus topic summary on list page
The list page SHALL display focus topic badges next to each date entry when that day's digest contains items with focus topics.

#### Scenario: Day has focus topic items
- **WHEN** a day's digest has items tagged with "memory" and "multi-agent"
- **THEN** the date entry SHALL show small badges for "Memory" and "Multi-Agent"

#### Scenario: Day has no focus topic items
- **WHEN** no items in the day's digest have focus topics
- **THEN** no badges SHALL be shown for that date entry

### Requirement: Data format backward compatibility
The system SHALL handle JSON files that lack the `focusTopics` field gracefully.

#### Scenario: Old JSON without focusTopics
- **WHEN** a JSON file does not contain `focusTopics` on items
- **THEN** the system SHALL treat those items as having empty focus topics
- **THEN** the filter bar SHALL NOT be rendered for that day

