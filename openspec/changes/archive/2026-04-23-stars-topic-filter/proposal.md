## Why

The Stars page shows a flat list of GitHub repos and Bluesky posts with no way to browse by subject. Users scanning 20+ items per day need to quickly zero in on what matters to them (e.g., only Agent frameworks or only LLM papers). Adding auto-extracted topic tags and client-side filtering — mirroring the proven FocusTopicFilter pattern already live on `/ai-daily/[date]` — turns the Stars page from a timeline into a navigable knowledge feed.

## What Changes

- **Build-time tag extraction**: Extend the existing DeepSeek commentary step in `scripts/fetch-stars.ts` and `scripts/fetch-bluesky.ts` to also return 1–3 topic tags per item (from a predefined taxonomy: Agent, LLM, Infra, RAG, Tokenizer, Multi-modal, Safety, Fine-tuning, Evaluation, Deployment, etc.).
- **Data model extension**: Add `tags: string[]` field to the `BlueskyPost` type in `website/lib/social-feeds.ts` (StarredRepo already has `topics` from GitHub, but we add normalized AI-domain tags separate from GitHub topics).
- **Topic filter bar on detail page**: Add a `TopicFilter` component on `/stars/[date]/` (same UX as ai-daily's `FocusTopicFilter`) with buttons like [All] [Agent] [LLM] [Infra] …
- **Source filter**: Add a secondary filter row: [All] [GitHub] [Bluesky] to filter by item source type.
- **Tag badges on cards**: Display extracted topic tags as small colored badges on each `RepoCard` and `BlueskyPostCard`.
- **Predefined color map**: A `TOPIC_TAG_META` constant (like ai-daily's `FOCUS_TOPIC_META`) mapping each topic to a label and Tailwind color class.
- **Client-side only**: All filtering uses `useState` — no SSR changes needed beyond passing the tag list in props.

## Capabilities

### New Capabilities
- `stars-topic-tagging`: Build-time AI extraction of 1–3 topic tags per starred repo and Bluesky post, stored in the daily JSON files.
- `stars-topic-filter`: Client-side topic and source filtering UI on the `/stars/[date]/` detail page, including tag badges on cards.

### Modified Capabilities
<!-- No existing specs are being modified -->

## Impact

- **Scripts**: `scripts/fetch-stars.ts` and `scripts/fetch-bluesky.ts` — extend DeepSeek prompt to also return `tags` array; backfill existing items missing tags.
- **Types**: `website/lib/social-feeds.ts` — add `tags: string[]` to `BlueskyPost`; use existing `topics` on `StarredRepo` or add separate `tags`.
- **Page**: `website/pages/stars/[date].tsx` — add filter bar, tag badges, `useState` filtering logic.
- **Data files**: `profile-data/github-stars/*.json` and `profile-data/bluesky-posts/*.json` — new `tags` field on each item.
- **Dependencies**: No new npm packages. Only additional DeepSeek API tokens consumed at build time (~1–2 extra output tokens per item since tags piggyback on the existing commentary call).
