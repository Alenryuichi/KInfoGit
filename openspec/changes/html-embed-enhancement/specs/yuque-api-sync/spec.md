## MODIFIED Requirements

### Requirement: HTML tags cleaned from content
The sync script SHALL remove only Yuque's decorative wrapper HTML tags (`<font>`, `<span>`) from document content while preserving their text content. Meaningful HTML tags (`<div>`, `<table>`, `<p>`, `<h1>`-`<h6>`, `<iframe>`, etc.) SHALL be preserved. Yuque's extra blank lines and indentation inside HTML block elements SHALL be compacted so Markdown parsers treat them as raw HTML rather than code blocks.

#### Scenario: Content with font tags
- **WHEN** document contains `<font color="red">important</font>`
- **THEN** the output contains `important` without the font tags

#### Scenario: Content with div and inline styles
- **WHEN** document contains `<div style="background: red;"><p>Hello</p></div>` with Yuque's extra blank lines between tags
- **THEN** the output preserves the div and p tags with blank lines removed inside the block

#### Scenario: Content with table
- **WHEN** document contains a `<table>` with `<tr>`, `<th>`, `<td>` with Yuque indentation
- **THEN** the output preserves the full table structure with indentation cleaned up
