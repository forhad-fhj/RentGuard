# Apply Prisma Migration Directly to Docker Container
# Run: .\scripts\apply-migration.ps1

Write-Host "Applying database migration to PostgreSQL container..." -ForegroundColor Cyan

$sqlFile = "backend\prisma\migrations\0_init\migration.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "Error: Migration SQL file not found at $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Reading SQL file..." -ForegroundColor Yellow
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "Applying SQL to PostgreSQL container..." -ForegroundColor Yellow
$sqlContent | docker exec -i rentguard-postgres psql -U rentguard -d rentguard_db

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migration applied successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Mark migration as applied: cd backend; npx prisma migrate resolve --applied 0_init"
    Write-Host "2. Start backend: npm run start:dev"
} else {
    Write-Host "❌ Migration failed. Check the error above." -ForegroundColor Red
}
