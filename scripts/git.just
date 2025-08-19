# Git Operations
# Version control and deployment commands

# Show repository status
status:
    #!/usr/bin/env bash
    echo "📊 Repository Status"
    echo "==================="
    git status --short
    echo ""
    echo "Recent commits:"
    git log --oneline -5

# Sync with remote repository
sync:
    #!/usr/bin/env bash
    echo "🔄 Syncing with remote..."
    git pull origin main
    git push origin main

# Quick commit with timestamp
quick:
    #!/usr/bin/env bash
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    git add .
    git commit -m "Quick update: $timestamp"
    git push origin main
    echo "✅ Quick commit completed!"

# Deploy to GitHub Pages with custom message
deploy message="Auto deploy":
    #!/usr/bin/env bash
    echo "🚀 Deploying: {{message}}"
    just build
    git add .
    git commit -m "{{message}}" || echo "No changes to commit"
    git push origin main
    echo "✅ Deployment initiated! Check GitHub Actions for progress."

# Create and push a new branch
branch name:
    #!/usr/bin/env bash
    echo "🌿 Creating branch: {{name}}"
    git checkout -b {{name}}
    git push -u origin {{name}}
    echo "✅ Branch {{name}} created and pushed!"

# Switch to main and pull latest
main:
    #!/usr/bin/env bash
    echo "🔄 Switching to main branch..."
    git checkout main
    git pull origin main
    echo "✅ On main branch with latest changes!"

# Show git log with graph
log:
    #!/usr/bin/env bash
    git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit -10

# Undo last commit (keep changes)
undo:
    #!/usr/bin/env bash
    echo "↩️ Undoing last commit (keeping changes)..."
    git reset --soft HEAD~1
    echo "✅ Last commit undone!"
