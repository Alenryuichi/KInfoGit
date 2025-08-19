# KInfoGit Repository Commands
# Usage: just <command>

# Import modular command files
import 'scripts/dev.just'
import 'scripts/git.just'
import 'scripts/content.just'
import 'scripts/utils.just'

# Show available commands
default:
    @just --list

# Quick setup for new environment
setup:
    @echo "🔧 Setting up KInfoGit repository..."
    @just install
    @echo "✅ Setup complete! Try 'just dev' to start development."