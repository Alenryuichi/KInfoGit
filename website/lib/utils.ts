/**
 * Strip leading markdown heading markers (#{1,6}) from a title string.
 * Example: "### 最致命的问题：无法应对考古需求" → "最致命的问题：无法应对考古需求"
 */
export function stripMarkdownTitle(title: string): string {
  return title.replace(/^#{1,6}\s+/, '').trim()
}
