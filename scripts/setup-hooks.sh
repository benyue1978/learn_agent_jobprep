#!/bin/bash

# Setup Git hooks for JobPrep project
# This script helps manage pre-commit hooks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps" ]; then
    print_error "This script must be run from the project root directory"
    exit 1
fi

print_status "Setting up Git hooks for JobPrep project..."

# Create hooks directory if it doesn't exist
if [ ! -d ".git/hooks" ]; then
    print_error ".git/hooks directory not found. Are you in a Git repository?"
    exit 1
fi

# Function to setup hook
setup_hook() {
    local hook_name=$1
    local hook_file=$2
    
    if [ -f ".git/hooks/$hook_name" ]; then
        print_warning "Hook $hook_name already exists. Backing up..."
        mv ".git/hooks/$hook_name" ".git/hooks/${hook_name}.backup"
    fi
    
    if [ -f "$hook_file" ]; then
        cp "$hook_file" ".git/hooks/$hook_name"
        chmod +x ".git/hooks/$hook_name"
        print_success "Installed $hook_name hook"
    else
        print_error "Hook file $hook_file not found!"
        exit 1
    fi
}

# Setup pre-commit hook
echo ""
print_status "Choose pre-commit hook type:"
echo "1) Full version (includes tests - slower but thorough)"
echo "2) Quick version (lint + build only - faster)"
echo "3) Skip pre-commit hook setup"
read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        setup_hook "pre-commit" ".git/hooks/pre-commit"
        print_status "Full pre-commit hook installed. This will run tests on every commit."
        ;;
    2)
        setup_hook "pre-commit" ".git/hooks/pre-commit-quick"
        print_status "Quick pre-commit hook installed. This will run lint + build on every commit."
        ;;
    3)
        print_warning "Skipping pre-commit hook setup"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Create a script to run full tests manually
cat > scripts/run-full-checks.sh << 'EOF'
#!/bin/bash

# Run full checks manually (lint, build, tests)
# This is useful when you want to run all checks without committing

set -e

echo "🔍 Running full checks..."

# Frontend checks
echo "📱 Running frontend checks..."
cd apps/frontend
pnpm lint
pnpm build
pnpm test:mock
cd ../..

# Backend checks
echo "🐍 Running backend checks..."
cd apps/backend
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d "../venv" ]; then
    source ../venv/bin/activate
fi
python -m pytest tests/ -v
cd ../..

echo "✅ All checks passed!"
EOF

chmod +x scripts/run-full-checks.sh
print_success "Created scripts/run-full-checks.sh for manual full testing"

# Create a script to disable hooks temporarily
cat > scripts/disable-hooks.sh << 'EOF'
#!/bin/bash

# Temporarily disable Git hooks
# This is useful when you need to commit without running checks

if [ -f ".git/hooks/pre-commit" ]; then
    mv ".git/hooks/pre-commit" ".git/hooks/pre-commit.disabled"
    echo "✅ Pre-commit hook disabled"
else
    echo "ℹ️  No pre-commit hook found"
fi
EOF

chmod +x scripts/disable-hooks.sh
print_success "Created scripts/disable-hooks.sh to temporarily disable hooks"

# Create a script to enable hooks
cat > scripts/enable-hooks.sh << 'EOF'
#!/bin/bash

# Re-enable Git hooks

if [ -f ".git/hooks/pre-commit.disabled" ]; then
    mv ".git/hooks/pre-commit.disabled" ".git/hooks/pre-commit"
    echo "✅ Pre-commit hook re-enabled"
else
    echo "ℹ️  No disabled pre-commit hook found"
fi
EOF

chmod +x scripts/enable-hooks.sh
print_success "Created scripts/enable-hooks.sh to re-enable hooks"

echo ""
print_success "Git hooks setup complete! 🎉"
echo ""
echo "Available commands:"
echo "  scripts/run-full-checks.sh  - Run all checks manually"
echo "  scripts/disable-hooks.sh    - Temporarily disable hooks"
echo "  scripts/enable-hooks.sh     - Re-enable hooks"
echo ""
echo "Note: The pre-commit hook will now run automatically on every commit."
echo "If you need to skip it occasionally, use: git commit --no-verify" 