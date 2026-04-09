# Yuque Content Sync Documentation Index

This directory contains comprehensive documentation about how KInfoGit syncs blog content and work projects from Yuque (语雀) and Feishu (飞书).

## 📚 Documentation Files

### 1. **YUQUE_SYNC_ARCHITECTURE.md** (Complete Reference)
The **main comprehensive guide** covering the entire sync system.

**Covers:**
- Two separate sync pipelines (blog vs work/projects)
- GitHub Actions workflows
- Detailed sync script analysis
- Image handling and downloads
- Sync state management
- Rate limiting & retry logic
- Website integration
- Environment configuration
- Complete integration flow

**Start here if you need:** Deep understanding of how the system works

---

### 2. **SYNC_FLOWCHART.md** (Visual Diagrams)
ASCII flowcharts and diagrams showing data flow and transformations.

**Includes:**
- High-level architecture diagram
- Data transformation pipelines (blog vs projects)
- Sync state management flow
- Rate limiting & retry handling
- Website consumption flow
- Complete workflow timeline

**Start here if you prefer:** Visual representations of processes

---

### 3. **SYNC_QUICK_REFERENCE.md** (Practical Guide)
Quick lookup reference and troubleshooting guide.

**Contains:**
- Quick comparison table (blog vs work sync)
- Environment variables reference
- Quick start commands
- Yuque API reference
- File structure examples
- Image handling details
- Common troubleshooting issues
- Debugging tips
- Common workflows

**Start here if you need:** Quick answers or troubleshooting

---

## 🎯 Quick Navigation

### By Use Case

**"I want to understand how it all works"**
→ Read: YUQUE_SYNC_ARCHITECTURE.md (Section 1-7)

**"I'm setting up the system"**
→ Read: SYNC_QUICK_REFERENCE.md (Environment Variables + Quick Start)

**"I need to troubleshoot an issue"**
→ Read: SYNC_QUICK_REFERENCE.md (Troubleshooting section)

**"I want to see data flow visually"**
→ Read: SYNC_FLOWCHART.md

**"I need to modify the sync scripts"**
→ Read: YUQUE_SYNC_ARCHITECTURE.md (Section 3)

**"I'm integrating with the website"**
→ Read: YUQUE_SYNC_ARCHITECTURE.md (Section 7)

**"I need to optimize performance"**
→ Read: SYNC_QUICK_REFERENCE.md (Performance Notes)

---

## 🔑 Key Files in Project

### Sync Scripts
- `scripts/sync-yuque.ts` - Blog sync from Yuque
- `scripts/sync-yuque-work.ts` - Work/projects sync from Yuque

### GitHub Actions Workflows
- `.github/workflows/sync-yuque.yml` - Daily blog sync trigger
- `.github/workflows/sync-yuque-work.yml` - Weekly work sync trigger
- `.github/workflows/deploy.yml` - Build & deploy website

### Data & State
- `profile-data/blog/` - Synced blog posts (markdown)
- `profile-data/projects/` - Synced projects (markdown + JSON)
- `tools/yuque-sync/sync-state.json` - Blog sync state
- `tools/yuque-sync/work-sync-state.json` - Work sync state

### Website Integration
- `website/lib/data.ts` - Data loading functions
- `website/pages/blog.tsx` - Blog listing page
- `website/pages/blog/[slug].tsx` - Blog detail page
- `website/pages/work.tsx` - Projects listing page
- `website/pages/work/[id].tsx` - Project detail page

### Assets
- `website/public/blog/images/` - Downloaded blog images
- `website/public/work/images/` - Downloaded project images

---

## 🚀 One-Minute Overview

**What:** Content syncing system that pulls blog articles and work projects from Yuque (a Chinese knowledge management platform).

**Two Pipelines:**

1. **Blog Pipeline** (`sync-yuque.ts`)
   - Pulls blog posts from Yuque
   - Cleans HTML, downloads images
   - Uses AI (DeepSeek) to generate tags + excerpt
   - Outputs: Markdown files in `profile-data/blog/`
   - Schedule: Daily at 00:00 UTC

2. **Work/Projects Pipeline** (`sync-yuque-work.ts`)
   - Pulls work/project documents from Yuque
   - Uses AI to extract structured data (title, role, tech_stack, achievements, etc.)
   - Generates smart slugs and bilingual content
   - Outputs: JSON index + detail markdown in `profile-data/projects/`
   - Schedule: Weekly (Monday) at 01:00 UTC

**How It Works:**
```
Yuque → GitHub Actions (scheduled) → Sync Scripts → 
Local Files (profile-data/) → Next.js Build → Static Website
```

**Key Features:**
- ✅ Incremental sync (only changed documents)
- ✅ Image downloads to local assets
- ✅ AI-powered content enhancement (DeepSeek)
- ✅ Rate limiting & retry handling
- ✅ Automatic git commits
- ✅ Bilingual support (Chinese + English)
- ✅ Fully automated via GitHub Actions

---

## 📋 Setup Checklist

- [ ] Get Yuque API token from https://www.yuque.com/settings/tokens
- [ ] Get DeepSeek API key from https://platform.deepseek.com/
- [ ] Add secrets to GitHub repository:
  - `YUQUE_TOKEN`
  - `DEEPSEEK_API_KEY`
  - `YUQUE_LOGIN` (optional, defaults to kylin-bxrhs)
  - `YUQUE_REPO` (optional, defaults to qd9got)
  - `YUQUE_WORK_REPO` (optional, defaults to sh4e9k)
- [ ] Verify GitHub Actions workflows are enabled
- [ ] Test local sync: `npx tsx scripts/sync-yuque.ts`
- [ ] Check generated files in `profile-data/blog/` and `profile-data/projects/`
- [ ] Build website: `cd website && npm run build`
- [ ] Deploy to GitHub Pages

---

## 🔗 External Resources

- **Yuque API Documentation**: https://www.yuque.com/yuque/developer/api
- **DeepSeek Platform**: https://platform.deepseek.com/
- **Next.js Documentation**: https://nextjs.org/docs
- **GitHub Actions**: https://docs.github.com/en/actions

---

## 💡 Tips & Tricks

### Force Resync Everything
```bash
# Via command line
rm tools/yuque-sync/sync-state.json
npx tsx scripts/sync-yuque.ts

# Via GitHub Actions
# Go to workflow → Run workflow → Check "force_sync"
```

### Local Testing
```bash
# Set environment variables
export YUQUE_TOKEN=your_token
export DEEPSEEK_API_KEY=your_key

# Run sync
npx tsx scripts/sync-yuque.ts

# Or use .elog.env file
cat > tools/yuque-sync/.elog.env << 'END'
YUQUE_TOKEN=xxx
DEEPSEEK_API_KEY=xxx
END
```

### Monitor Sync Status
```bash
# Check last sync time
cat tools/yuque-sync/sync-state.json | jq '.lastSync'

# Count synced documents
cat tools/yuque-sync/sync-state.json | jq '.docs | length'

# View GitHub Actions logs
# Go to: Repository → Actions → Workflows
```

### Debugging
- Check sync script output in GitHub Actions logs
- Look for emoji indicators: 📑 📋 🧹 📷 🤖 ✅ ❌
- Review error messages for rate limits or API issues
- Check `profile-data/` for generated files
- Verify images in `website/public/{blog,work}/images/`

---

## 🤝 Support & Issues

If you encounter issues:

1. **First**: Check SYNC_QUICK_REFERENCE.md troubleshooting section
2. **Then**: Review YUQUE_SYNC_ARCHITECTURE.md for detailed flow
3. **Finally**: Check GitHub Actions logs for error messages

Common issues:
- Missing environment variables → Set YUQUE_TOKEN, DEEPSEEK_API_KEY
- Rate limited (429 errors) → Wait for next hour or reduce delays
- AI extraction failed → Check DeepSeek API key and credits
- Images not downloading → Verify Yuque image URLs and permissions
- Website not updating → Check deployment workflow logs

---

## 📝 Document Maintenance

These docs were generated based on:
- `scripts/sync-yuque.ts` (613 lines)
- `scripts/sync-yuque-work.ts` (661 lines)
- `.github/workflows/sync-yuque.yml`
- `.github/workflows/sync-yuque-work.yml`
- `website/lib/data.ts`
- Live testing on 2026-04-09

Last updated: 2026-04-09

---

## 🎓 Learning Path

**Beginner** → SYNC_QUICK_REFERENCE.md → Basic setup & troubleshooting

**Intermediate** → SYNC_FLOWCHART.md → Understand data transformations

**Advanced** → YUQUE_SYNC_ARCHITECTURE.md → Detailed system design & implementation

**Expert** → Source code (`scripts/sync-*.ts`) → Deep technical details
