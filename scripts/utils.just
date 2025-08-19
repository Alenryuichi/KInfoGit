# Utility Commands
# Backup, statistics, and maintenance tools

# Show repository statistics
stats:
    #!/usr/bin/env bash
    echo "📈 Repository Statistics"
    echo "======================="
    echo "Total commits: $(git rev-list --count HEAD)"
    echo "Contributors: $(git shortlog -sn | wc -l)"
    echo "Files tracked: $(git ls-files | wc -l)"
    echo "Repository size: $(du -sh . | cut -f1)"
    echo ""
    echo "Website files:"
    echo "  TypeScript/JavaScript: $(find website -name "*.tsx" -o -name "*.ts" -o -name "*.js" 2>/dev/null | wc -l)"
    echo "  CSS files: $(find website -name "*.css" 2>/dev/null | wc -l)"
    echo ""
    echo "Profile data:"
    echo "  Markdown files: $(find profile-data -name "*.md" 2>/dev/null | wc -l)"
    echo "  JSON files: $(find profile-data -name "*.json" 2>/dev/null | wc -l)"

# Create repository backup
backup:
    #!/usr/bin/env bash
    date_str=$(date +%Y%m%d_%H%M%S)
    backup_name="kinfogit_backup_$date_str.tar.gz"
    echo "💾 Creating backup: $backup_name"
    tar --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='out' \
        -czf "../$backup_name" .
    echo "✅ Backup created: ../$backup_name"

# Check system requirements
check-env:
    #!/usr/bin/env bash
    echo "🔍 Checking environment..."
    echo "Node.js: $(node --version 2>/dev/null || echo 'Not installed')"
    echo "npm: $(npm --version 2>/dev/null || echo 'Not installed')"
    echo "Git: $(git --version 2>/dev/null || echo 'Not installed')"
    echo "Python: $(python3 --version 2>/dev/null || echo 'Not installed')"
    echo "Just: $(just --version 2>/dev/null || echo 'Not installed')"

# Open project in VS Code
code:
    #!/usr/bin/env bash
    if command -v code &> /dev/null; then
        echo "📝 Opening project in VS Code..."
        code .
    else
        echo "❌ VS Code not found in PATH"
    fi

# Find large files
find-large:
    #!/usr/bin/env bash
    echo "🔍 Finding large files (>1MB)..."
    find . -type f -size +1M -not -path "./website/node_modules/*" -not -path "./.git/*" -exec ls -lh {} \; | awk '{print $5 " " $9}' | sort -hr

# Clean temporary files
clean-temp:
    #!/usr/bin/env bash
    echo "🧹 Cleaning temporary files..."
    find . -name ".DS_Store" -delete 2>/dev/null || true
    find . -name "*.tmp" -delete 2>/dev/null || true
    find . -name "*.log" -delete 2>/dev/null || true
    echo "✅ Temporary files cleaned!"

# Health check
health:
    #!/usr/bin/env bash
    echo "🏥 Repository Health Check"
    echo "========================="
    
    # Check if website builds
    echo "Building website..."
    if just build > /dev/null 2>&1; then
        echo "✅ Website builds successfully"
    else
        echo "❌ Website build failed"
    fi
    
    # Check JSON validity
    echo "Validating JSON files..."
    if just validate-json > /dev/null 2>&1; then
        echo "✅ All JSON files are valid"
    else
        echo "❌ Some JSON files have errors"
    fi
    
    # Check git status
    if [ -z "$(git status --porcelain)" ]; then
        echo "✅ Working directory is clean"
    else
        echo "⚠️  Working directory has uncommitted changes"
    fi
