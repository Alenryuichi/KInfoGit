# Content Management
# Blog posts, resume, and profile data management

# Create a new blog post
new-post title:
    #!/usr/bin/env bash
    slug=$(echo "{{title}}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$$//g')
    date=$(date +%Y-%m-%d)
    mkdir -p profile-data/blog
    cat > "profile-data/blog/$date-$slug.md" << EOF
    # {{title}}
    
    **Date**: $date
    **Tags**: 
    
    ## Content
    
    EOF
    echo "✅ Created: profile-data/blog/$date-$slug.md"

# List all blog posts
list-posts:
    #!/usr/bin/env bash
    echo "📝 Blog Posts"
    echo "============="
    if [ -d "profile-data/blog" ]; then
        ls -la profile-data/blog/*.md 2>/dev/null | awk '{print $9}' | sort -r
    else
        echo "No blog posts found"
    fi

# Create a new project entry
new-project name:
    #!/usr/bin/env bash
    echo "🚀 Creating project entry: {{name}}"
    mkdir -p profile-data/projects
    cat > "profile-data/projects/{{name}}.md" << EOF
    # {{name}}
    
    ## Overview
    
    ## Technologies
    
    ## Achievements
    
    ## Challenges
    
    EOF
    echo "✅ Created: profile-data/projects/{{name}}.md"

# Update resume timestamp
update-resume:
    #!/usr/bin/env bash
    echo "📄 Updating resume timestamp..."
    if [ -f "profile-data/resume/personal-info.json" ]; then
        # Update last modified date in resume
        echo "Resume files available for editing:"
        ls -la profile-data/resume/
    else
        echo "No resume files found"
    fi

# Validate JSON files
validate-json:
    #!/usr/bin/env bash
    echo "🔍 Validating JSON files..."
    find profile-data -name "*.json" -exec echo "Checking {}" \; -exec python3 -m json.tool {} > /dev/null \;
    echo "✅ JSON validation completed!"

# Count content statistics
content-stats:
    #!/usr/bin/env bash
    echo "📊 Content Statistics"
    echo "===================="
    echo "Blog posts: $(find profile-data/blog -name "*.md" 2>/dev/null | wc -l)"
    echo "Projects: $(find profile-data/projects -name "*.md" 2>/dev/null | wc -l)"
    echo "JSON files: $(find profile-data -name "*.json" 2>/dev/null | wc -l)"
    echo "Total markdown files: $(find profile-data -name "*.md" 2>/dev/null | wc -l)"
