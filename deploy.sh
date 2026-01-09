#!/bin/bash

# Deploy Script untuk APEL System
# Usage: ./deploy.sh

echo "🚀 APEL System - Git Commit & Deploy Script"
echo "============================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "Git not initialized. Run 'git init' first."
    exit 1
fi

echo ""
echo "📦 Staging necessary files..."
echo ""

# Stage essential files for Fonnte integration
STAGED=0

# Core Fonnte Service
if [ -f "app/Services/FonnteService.php" ]; then
    git add app/Services/FonnteService.php
    print_status "app/Services/FonnteService.php"
    STAGED=$((STAGED + 1))
fi

# Schedule Controller
if [ -f "app/Http/Controllers/ScheduleController.php" ]; then
    git add app/Http/Controllers/ScheduleController.php
    print_status "app/Http/Controllers/ScheduleController.php"
    STAGED=$((STAGED + 1))
fi

# Routes
if [ -f "routes/web.php" ]; then
    git add routes/web.php
    print_status "routes/web.php"
    STAGED=$((STAGED + 1))
fi

# Scheduler Service
if [ -f "app/Services/SchedulerService.php" ]; then
    git add app/Services/SchedulerService.php
    print_status "app/Services/SchedulerService.php"
    STAGED=$((STAGED + 1))
fi

# User Model
if [ -f "app/Models/User.php" ]; then
    git add app/Models/User.php
    print_status "app/Models/User.php"
    STAGED=$((STAGED + 1))
fi

# Migrations
if [ -f "database/migrations/2026_01_02_083313_add_phone_to_users_table.php" ]; then
    git add database/migrations/2026_01_02_083313_add_phone_to_users_table.php
    print_status "database/migrations/2026_01_02_083313_add_phone_to_users_table.php"
    STAGED=$((STAGED + 1))
fi

# Documentation (optional)
if [ -f "docs/SETUP_WHATSAPP_API.md" ]; then
    git add docs/SETUP_WHATSAPP_API.md
    print_status "docs/SETUP_WHATSAPP_API.md"
    STAGED=$((STAGED + 1))
fi

echo ""
echo "📝 Staged $STAGED file(s)"

# Check if there are staged files
if [ $STAGED -eq 0 ]; then
    print_warning "No files to commit. Make changes first."
    exit 0
fi

# Commit message
COMMIT_MSG="feat: Add Fonnte WhatsApp integration and new assignment rules

- Add FonnteService for WhatsApp broadcast to groups
- Update ScheduleController with broadcast methods
- Add new assignment rules based on gender and employee type
- Add route for /fonnte/test and /fonnte/quota
- Update User model with gender, jenis_pegawai, jenis_jabatan fields

🚀 Ready for production deployment"

echo ""
echo "💾 Committing changes..."

git commit -m "$COMMIT_MSG"

if [ $? -eq 0 ]; then
    print_status "Commit successful!"
else
    print_error "Commit failed!"
    exit 1
fi

echo ""
echo "🚀 Pushing to remote..."

git push origin main

if [ $? -eq 0 ]; then
    print_status "Push successful!"
    echo ""
    echo "============================================"
    echo "✅ Deployment files committed and pushed!"
    echo "============================================"
    echo ""
    echo "Next steps on production server:"
    echo "  1. ssh user@server"
    echo "  2. cd /path/to/project"
    echo "  3. git pull"
    echo "  4. composer install"
    echo "  5. php artisan migrate --force"
    echo "  6. php artisan config:cache"
    echo "  7. php artisan route:cache"
else
    print_error "Push failed!"
    exit 1
fi
