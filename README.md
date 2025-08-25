# KInfoGit - Personal Profile Repository & Website

## 🎯 Project Overview
Personal profile repository and website for Kylin (苗静思), showcasing expertise in anti-fraud technology, full-stack development, and UI design.

## 🏗️ Architecture

### Repository Structure
```
KInfoGit/
├── profile-data/           # Structured profile data
│   ├── resume/            # Resume in multiple formats
│   ├── projects/          # Project details and case studies
│   ├── skills/            # Technical skills and certifications
│   ├── career/            # Career planning and interview preparation
│   └── blog/              # Blog posts and articles
├── website/               # Next.js website source
│   ├── components/        # React components
│   ├── pages/            # Next.js pages
│   ├── styles/           # CSS and styling
│   ├── lib/              # Utility functions
│   └── public/           # Static assets
└── .github/workflows/     # CI/CD configurations
```

### Technology Stack
- **Website**: Next.js 14 + TypeScript + Tailwind CSS
- **Content**: JSON structured data from profile-data
- **Deployment**: GitHub Pages + GitHub Actions
- **UI/UX**: Responsive design with dark/light theme
- **Icons**: Lucide React icons
- **Animations**: Framer Motion (ready to use)
- **Task Runner**: Just command runner for development workflow

## 🚀 Features
- 📱 Responsive multi-language support (中文/English)
- 🎨 Modern UI with dark/light theme toggle
- 📊 Interactive project showcase with detailed metrics
- 🔍 SEO optimized with proper meta tags
- ⚡ Static site generation for optimal performance
- 🎯 Professional portfolio sections
- 🛠️ Streamlined development workflow with Just commands
- 📝 Content management tools for blogs and projects
- 🚀 One-command deployment to GitHub Pages

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn
- [Just](https://github.com/casey/just) command runner (recommended)

### Quick Start with Just (Recommended)
```bash
# Clone the repository
git clone https://github.com/username/KInfoGit.git
cd KInfoGit

# Install Just (macOS)
brew install just

# Quick setup and start development
just setup
just dev
```

### Manual Setup (Alternative)
```bash
# Install dependencies
cd website
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Available Just Commands

#### 🔧 Development Commands
```bash
just install        # Install npm dependencies
just dev            # Start development server (localhost:3000)
just build          # Build for production
just serve          # Serve built website locally (localhost:8000)
just clean          # Clean build artifacts and dependencies
just check-updates  # Check for dependency updates
just update-deps    # Update all dependencies
```

#### 📝 Git & Deployment Commands
```bash
just status         # Show repository status and recent commits
just sync           # Pull and push to remote repository
just quick          # Quick commit with timestamp
just deploy         # Build and deploy to GitHub Pages
just deploy "msg"   # Deploy with custom commit message
just branch <name>  # Create and push new branch
just main           # Switch to main branch and pull latest
just log            # Show git history with graph
just undo           # Undo last commit (keep changes)
```

#### 📄 Content Management Commands
```bash
just new-post "title"     # Create new blog post
just list-posts           # List all blog posts
just new-project "name"   # Create new project entry
just update-resume        # Update resume timestamp
just validate-json        # Validate all JSON files
just content-stats        # Show content statistics
```

#### 🛠️ Utility Commands
```bash
just stats          # Show repository statistics
just backup         # Create data backup
```

### Common Development Workflows

#### Daily Development
```bash
# Start working
just dev

# Check status
just status

# Quick commit
just quick

# Deploy changes
just deploy "Update personal info"
```

#### Project Maintenance
```bash
# Check for updates
just check-updates

# Update dependencies
just update-deps

# Clean rebuild
just clean
just install
just build
```

### Project Structure
- **Components**: Modular React components in `/website/components/`
- **Data**: Profile data in JSON format in `/profile-data/`
- **Styling**: Tailwind CSS with custom utilities in `/website/styles/`
- **Configuration**: Next.js config optimized for static export

## 📋 Implementation Status
- ✅ **Foundation** - Repository setup and basic structure
- ✅ **Content** - Data modeling and content structure
- ✅ **Website** - Modern responsive website development
- ✅ **Components** - All major sections implemented
- 🔄 **Deployment** - GitHub Actions workflow configured
- 🔄 **Optimization** - Performance and SEO enhancements

## 🚀 Deployment

### GitHub Pages
The website is configured for automatic deployment to GitHub Pages:

1. Push changes to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Site will be available at `https://username.github.io/KInfoGit`

### Manual Deployment
```bash
cd website
npm run build
# Upload the 'out' directory to your hosting provider
```

## 📝 Content Management

### Updating Profile Data
Edit JSON files in the `/profile-data/` directory:
- `resume/personal-info.json` - Personal information and contact details
- `skills/technical-skills.json` - Technical skills and proficiency levels
- `projects/core-projects.json` - Project details and achievements

### Adding New Sections
1. Create new data files in `/profile-data/`
2. Add corresponding components in `/website/components/`
3. Import and use in `/website/pages/index.tsx`

### Career Development Documentation
The `/profile-data/career/` directory contains:
- `career-planning.md` - Long-term career goals and transition strategy
- `interview-preparation.md` - Interview questions and company research
- `ai-learning-notes.md` - AI technology learning roadmap and notes

## 🎯 Key Highlights
- **Anti-fraud Expert**: 10亿级 data processing, 300万+ revenue impact
- **System Architect**: 0-to-1 platform construction specialist
- **Full-stack Developer**: Python, Go, TypeScript, Vue.js expertise
- **Project Leader**: Complex cross-departmental project management

## 📄 License
MIT License - feel free to use this template for your own profile website.