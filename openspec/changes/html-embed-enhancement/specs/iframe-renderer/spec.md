## ADDED Requirements

### Requirement: Custom iframe component for embedded HTML pages
The `MarkdownRenderer` SHALL render `<iframe>` tags whose `src` starts with `/blog/embeds/` using a custom component that wraps the iframe with controls and loading state.

#### Scenario: Blog embed iframe detected
- **WHEN** Markdown contains `<iframe src="/blog/embeds/my-app.html" ...>`
- **THEN** the iframe is rendered with the custom wrapper component (fullscreen button, loading skeleton)

#### Scenario: External iframe not affected
- **WHEN** Markdown contains `<iframe src="https://youtube.com/embed/..." ...>`
- **THEN** the iframe is rendered as a plain iframe without the custom wrapper

### Requirement: Loading skeleton during iframe load
The custom iframe component SHALL display a loading skeleton/spinner while the iframe content is loading. Once the iframe fires its `load` event, the skeleton SHALL fade out and the iframe SHALL fade in.

#### Scenario: Iframe loading
- **WHEN** the iframe is first mounted and content has not loaded
- **THEN** a skeleton placeholder with subtle animation is visible

#### Scenario: Iframe loaded
- **WHEN** the iframe fires its `load` event
- **THEN** the skeleton fades out and the iframe fades in with a smooth transition

### Requirement: Fullscreen toggle button
The custom iframe component SHALL display a fullscreen toggle button in the top-right corner of the iframe wrapper. Clicking the button SHALL expand the iframe to fill the viewport.

#### Scenario: Enter fullscreen on desktop
- **WHEN** user clicks the fullscreen button and the browser supports Fullscreen API
- **THEN** the iframe container enters native fullscreen mode via `Element.requestFullscreen()`

#### Scenario: Enter fullscreen on unsupported browser
- **WHEN** user clicks the fullscreen button and the browser does not support Fullscreen API
- **THEN** a fixed-position overlay covers the viewport with the iframe at full size and a close button

#### Scenario: Exit fullscreen
- **WHEN** user presses Escape or clicks the close/fullscreen button while in fullscreen
- **THEN** the iframe returns to its inline size

### Requirement: Iframe height auto-resize via postMessage
The custom iframe component SHALL listen for `message` events with `{ type: 'iframe-resize', height: number }` from the iframe. When received, the component SHALL update the iframe height to match.

#### Scenario: Resize message received
- **WHEN** the iframe posts `{ type: 'iframe-resize', height: 1200 }`
- **THEN** the iframe element height is set to `1200px`

#### Scenario: No resize message received
- **WHEN** no resize message is received within 2 seconds of load
- **THEN** the iframe keeps its default height (800px from the HTML attribute)
