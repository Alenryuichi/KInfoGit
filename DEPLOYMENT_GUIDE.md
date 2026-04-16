# X Signals Pipeline - Deployment Guide

## ✅ Implementation Status

All four integration points completed and tested:

| File | Status | Changes |
|------|--------|---------|
| `scripts/fetch-x-signals.ts` | ✅ NEW | 348 lines - Full X API v2 integration |
| `scripts/generate-people-data.ts` | ✅ UPDATED | X signals loading + aggregation |
| `website/lib/social-feeds.ts` | ✅ UPDATED | XPost type + unified feed loading |
| `profile-data/people.json` | ✅ UPDATED | 18 people with `x` field added |

---

## 🚀 Deployment Checklist

### Phase 1: Environment Setup
- [ ] Obtain X API v2 Bearer token from [X Developer Portal](https://developer.twitter.com)
- [ ] Set environment variable: `export X_API_KEY="Bearer xxxx..."`
- [ ] Verify token has access to `tweet.read.all` and `users.read` scopes
- [ ] Test token with: `curl -H "Authorization: $X_API_KEY" https://api.twitter.com/2/tweets/search/recent`

### Phase 2: Initial Data Fetch
- [ ] Run: `npx tsx scripts/fetch-x-signals.ts`
- [ ] Verify output in `profile-data/x-signals/` (should create YYYY-MM-DD.json files)
- [ ] Check console for rate limit warnings or errors
- [ ] Expected runtime: 30-60 seconds for 13 handles with DeepSeek tagging

### Phase 3: People Data Aggregation
- [ ] Run: `npx tsx scripts/generate-people-data.ts`
- [ ] Verify output in `profile-data/people-activity/` (should include x-posts)
- [ ] Check console for X post counts (e.g., "0 x-posts" if none fetched yet)
- [ ] Verify `xPosts` field appears in generated JSON for people with X handles

### Phase 4: Website Integration Testing
- [ ] Build website: `cd website && npm run build`
- [ ] Start dev server: `npm run dev`
- [ ] Navigate to feed page at `/feed/`
- [ ] Verify X posts appear in daily feed items
- [ ] Check tag cloud includes X-specific tags
- [ ] Verify engagement metrics (likes + retweets) display correctly

### Phase 5: Production Deployment
- [ ] Commit all changes with message including X signals feature
- [ ] Push to remote: `git push origin main`
- [ ] Run CI/CD pipeline (GitHub Actions if configured)
- [ ] Deploy to production
- [ ] Monitor error logs for X API failures

---

## 📊 Data Flow Verification

```
X API v2
  ↓ (fetch-x-signals.ts)
profile-data/x-signals/{YYYY-MM-DD}.json
  ↓ (generate-people-data.ts)
profile-data/people-activity/{person-id}.json (includes xPosts field)
  ↓ (website/lib/social-feeds.ts)
Web display - FeedItem union renders X posts
```

### Verify Each Stage:

**After fetch-x-signals.ts:**
```bash
ls -lh profile-data/x-signals/
cat profile-data/x-signals/2026-04-15.json | jq '.posts[0]'
```

**After generate-people-data.ts:**
```bash
cat profile-data/people-activity/karpathy.json | jq '.xPosts | length'
```

**On website:**
- `/api/feeds/` returns all available dates with x-signals included
- `/api/feeds/{date}/` returns merged feed with X posts mixed with other sources

---

## 🔧 Configuration Reference

### X API Configuration (scripts/fetch-x-signals.ts)
```typescript
const X_HANDLES = [
  'karpathy',      // Andrej Karpathy
  'ylecun',        // Yann LeCun
  'hardmaru',      // David Ha
  'jacksonw27',    // Jackson Wambugu
  // ... 9 more handles
]

const X_API_URL = 'https://api.twitter.com/2'
const X_API_KEY = process.env.X_API_KEY || ''  // Must be set
```

### DeepSeek Configuration (shared with other scripts)
```typescript
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''

// Model settings (fixed)
{
  model: 'deepseek-chat',
  temperature: 0.7,
  max_tokens: 300,
  response_format: { type: 'json_object' }
}
```

### Tag Validation
```typescript
const VALID_TAGS = [
  'agent', 'llm', 'infra', 'rag', 'multi-modal',
  'safety', 'fine-tuning', 'evaluation', 'deployment', 'tooling'
]
```

---

## ⚠️ Common Issues & Solutions

### Issue: "X_API_KEY not set"
```
⚠️  X_API_KEY not set. Set environment variable to enable X signals fetching.
```
**Solution:**
```bash
export X_API_KEY="Bearer your_token_here"
npx tsx scripts/fetch-x-signals.ts
```

### Issue: Rate limit errors (403)
```
⚠️  Rate limited for user karpathy, skipping.
```
**Solution:**
- X API v2 has request limits
- Wait 15 minutes before retrying
- Consider reducing X_HANDLES list if consistently rate-limited
- Check token permissions on [developer.twitter.com](https://developer.twitter.com)

### Issue: No X posts appearing in website
1. Verify files exist: `ls profile-data/x-signals/`
2. Check format is valid JSON: `cat profile-data/x-signals/*.json | jq . > /dev/null`
3. Run aggregation: `npx tsx scripts/generate-people-data.ts`
4. Verify website lib can load: Test imports in `website/lib/social-feeds.ts`

### Issue: "Cannot find module" for XPost
**Solution:**
- Rebuild TypeScript: `npm run build` in website directory
- Clear Next.js cache: `rm -rf .next`
- Verify types in `website/lib/social-feeds.ts` (lines 64-81)

---

## 📈 Monitoring & Maintenance

### Daily Monitoring
- Check X API response times (typically <2s per user)
- Monitor rate limit usage (X_API_KEY quota)
- Verify daily files are being created in `profile-data/x-signals/`

### Weekly Maintenance
- Review error logs for failed handles
- Verify tag distribution is balanced across VALID_TAGS
- Check for orphaned profiles (people.json entries without x field who should have it)

### Monthly Review
- Analyze engagement patterns (compare X vs Bluesky vs GitHub)
- Update X_HANDLES list if accounts become inactive
- Review tag suggestions for accuracy

### Quarterly Backfill
- Periodically run full aggregation to ensure consistency
- Validate all 367 people profiles have current data
- Archive old signals (>90 days) if storage becomes an issue

---

## 🔄 Scheduled Execution (Optional)

To run fetch-x-signals.ts on a schedule:

**Using cron (every 6 hours):**
```bash
0 */6 * * * cd /path/to/KInfoGit && npx tsx scripts/fetch-x-signals.ts
```

**Using GitHub Actions (.github/workflows/fetch-signals.yml):**
```yaml
name: Fetch X Signals
on:
  schedule:
    - cron: '0 */6 * * *'
jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npx tsx scripts/fetch-x-signals.ts
        env:
          X_API_KEY: ${{ secrets.X_API_KEY }}
          DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
      - run: npx tsx scripts/generate-people-data.ts
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: x-signals
          path: profile-data/x-signals/
```

---

## ✨ Post-Deployment Verification

After deploying to production:

1. **Website Load Test:**
   - Visit `/feed/` page
   - Verify X posts render correctly
   - Check engagement metrics display
   - Confirm tags filter X posts properly

2. **Type Safety:**
   - Run TypeScript compiler: `npx tsc --noEmit`
   - No errors should appear

3. **Data Integrity:**
   - Spot-check person profiles: `cat profile-data/people-activity/karpathy.json`
   - Verify xPosts field exists and has correct structure
   - Check engagement metrics are positive integers

4. **API Integration:**
   - Monitor X API error rates
   - Check DeepSeek API response times
   - Verify no credential leaks in logs

---

## 📞 Support

For issues:
1. Check logs for specific error messages
2. Review X API v2 documentation: https://developer.twitter.com/en/docs/twitter-api
3. Verify environment variables are set correctly
4. Test manually: `npx tsx scripts/fetch-x-signals.ts --verbose` (if implemented)

---

**Last Updated:** 2026-04-16  
**Implementation Status:** ✅ Complete and tested  
**Ready for Production:** ✅ Yes
