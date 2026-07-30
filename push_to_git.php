<?php

/**
 * APEL System - Git Push Script
 * Usage: php push_to_git.php
 */
echo "🚀 APEL System - Git Push Script\n";
echo "================================\n\n";

// Change to project directory
chdir(__DIR__);

// Define files to add
$files = [
    'app/Services/FonnteService.php',
    'app/Http/Controllers/ScheduleController.php',
    'routes/web.php',
    'app/Services/SchedulerService.php',
    'app/Models/User.php',
    'database/migrations/2026_01_02_083313_add_phone_to_users_table.php',
    'composer.json',
];

// Add files
echo "📦 Staging files...\n";
$stagedFiles = [];
foreach ($files as $file) {
    if (file_exists($file)) {
        $result = shell_exec('git add '.escapeshellarg($file).' 2>&1');
        echo "  ✅ $file\n";
        $stagedFiles[] = $file;
    } else {
        echo "  ⚠️  Not found: $file\n";
    }
}

echo "\n";

// Commit
echo "💾 Creating commit...\n";
$commitMessage = 'feat: Add Fonnte WhatsApp integration and new assignment rules

- Add FonnteService for WhatsApp broadcast to groups
- Update ScheduleController with broadcast methods
- Add new assignment rules based on gender and employee type
- Add route for /fonnte/test and /fonnte/quota
- Update User model with gender, jenis_pegawai, jenis_jabatan fields';

$commitResult = shell_exec('git commit -m '.escapeshellarg($commitMessage).' 2>&1');
echo "  ✅ Commit done!\n";

echo "\n";

// Push
echo "🚀 Pushing to remote...\n";
$pushResult = shell_exec('git push origin main 2>&1');

if (strpos($pushResult, 'error') !== false || strpos($pushResult, 'failed') !== false) {
    echo '  ⚠️  '.trim($pushResult)."\n";
} else {
    echo "  ✅ Push successful!\n";
}

echo "\n================================\n";
echo "✅ All changes pushed to Git!\n";
echo "================================\n";
echo "\nNext steps on production server:\n";
echo "  1. ssh user@server\n";
echo "  2. cd /path/to/project\n";
echo "  3. git pull\n";
echo "  4. composer install\n";
echo "  5. php artisan migrate --force\n";
echo "  6. php artisan config:cache\n";
