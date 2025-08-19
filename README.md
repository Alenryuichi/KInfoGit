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

## 🚀 Features
- 📱 Responsive multi-language support (中文/English)
- 🎨 Modern UI with dark/light theme toggle
- 📊 Interactive project showcase with detailed metrics
- 🔍 SEO optimized with proper meta tags
- ⚡ Static site generation for optimal performance
- 🎯 Professional portfolio sections

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Getting Started
```bash
# Clone the repository
git clone https://github.com/username/KInfoGit.git
cd KInfoGit

# Install dependencies
cd website
npm install

# Start development server
npm run dev

# Build for production
npm run build
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