# Development Commands
# Website development and building

# Install dependencies
install:
    #!/usr/bin/env bash
    echo "📦 Installing dependencies..."
    cd website && npm install

# Start development server
dev:
    #!/usr/bin/env bash
    echo "🚀 Starting development server..."
    if [ ! -d "website/node_modules" ]; then
        echo "📦 Installing dependencies first..."
        just install
    fi
    cd website && npm run dev

# Generate blog cover images
generate-covers:
    #!/usr/bin/env bash
    echo "🎨 Generating blog cover images..."
    cd website && npx tsx scripts/generate-covers.ts

# Build for production
build:
    #!/usr/bin/env bash
    echo "🎨 Generating blog covers..."
    just generate-covers
    echo "👥 Generating people activity data..."
    cd website && npx tsx ../scripts/generate-people-data.ts || echo "⚠️  People data generation failed, continuing..."
    echo "🏗️ Building website..."
    cd website && npm run build

# Serve built website locally
serve:
    #!/usr/bin/env bash
    echo "🌐 Serving website at http://localhost:8000"
    cd website && python3 -m http.server 8000 -d out

# Clean build artifacts
clean:
    #!/usr/bin/env bash
    echo "🧹 Cleaning build artifacts..."
    rm -rf website/node_modules
    rm -rf website/.next
    rm -rf website/out
    echo "✅ Clean completed!"

# Check for updates
check-updates:
    #!/usr/bin/env bash
    echo "🔍 Checking for dependency updates..."
    cd website && npm outdated

# Update dependencies
update-deps:
    #!/usr/bin/env bash
    echo "⬆️ Updating dependencies..."
    cd website && npm update
    echo "✅ Dependencies updated!"
