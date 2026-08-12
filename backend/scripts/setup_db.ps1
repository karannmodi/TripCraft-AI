# TripCraft AI - Interactive Local PostgreSQL Setup Script
# Prompts locally for superuser and app passwords without displaying or logging them

$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (-not (Test-Path $psql)) {
    Write-Error "psql.exe not found at $psql"
    exit 1
}

Write-Host "=== TripCraft AI PostgreSQL Interactive Setup ===" -ForegroundColor Cyan
$pgPassSecure = Read-Host -Prompt "Enter PostgreSQL 'postgres' superuser password" -AsSecureString
$appPassSecure = Read-Host -Prompt "Enter password to set for new 'tripcraft_app' role" -AsSecureString

$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassSecure)
$pgPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

$BSTR2 = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($appPassSecure)
$appPass = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR2)

$env:PGPASSWORD = $pgPass

# SQL to create/update role
$createRoleSql = "DO `$$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'tripcraft_app') THEN CREATE ROLE tripcraft_app WITH LOGIN PASSWORD '$appPass'; ELSE ALTER ROLE tripcraft_app WITH PASSWORD '$appPass'; END IF; END `$$;"

Write-Host "Creating/updating application role 'tripcraft_app'..." -ForegroundColor Yellow
$createRoleSql | & $psql -U postgres -h localhost -p 5432 -d postgres > $null 2>&1

# Check if database exists, create if not
$dbCheck = & $psql -U postgres -h localhost -p 5432 -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='tripcraft'"
if (-not $dbCheck -or $dbCheck.ToString().Trim() -ne "1") {
    Write-Host "Creating database 'tripcraft' with owner 'tripcraft_app'..." -ForegroundColor Yellow
    & $psql -U postgres -h localhost -p 5432 -d postgres -c "CREATE DATABASE tripcraft OWNER tripcraft_app;" > $null 2>&1
} else {
    Write-Host "Database 'tripcraft' exists. Updating ownership to 'tripcraft_app'..." -ForegroundColor Yellow
    & $psql -U postgres -h localhost -p 5432 -d postgres -c "ALTER DATABASE tripcraft OWNER TO tripcraft_app;" > $null 2>&1
}

# Grant schema public permissions
& $psql -U postgres -h localhost -p 5432 -d tripcraft -c "GRANT ALL ON SCHEMA public TO tripcraft_app; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO tripcraft_app;" > $null 2>&1

# Verify application role connection
$env:PGPASSWORD = $appPass
$appTest = & $psql -U tripcraft_app -h localhost -p 5432 -d tripcraft -tAc "SELECT 1;"
if ($appTest -and $appTest.Trim() -eq "1") {
    Write-Host "SUCCESS: Connection verified for tripcraft_app to database 'tripcraft'!" -ForegroundColor Green
    
    $encodedAppPass = [System.Uri]::EscapeDataString($appPass)
    $dbUrl = "postgresql+asyncpg://tripcraft_app:$encodedAppPass@localhost:5432/tripcraft"
    $envContent = @"
PROJECT_NAME="TripCraft AI"
ENV="development"
DEBUG=True
PORT=8000
HOST="0.0.0.0"
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
DATABASE_URL="$dbUrl"
"@
    Set-Content -Path ".env" -Value $envContent
    Set-Content -Path "backend/.env" -Value $envContent
    Write-Host "Created local .env file (Git ignored)." -ForegroundColor Green
} else {
    Write-Error "Failed to connect to 'tripcraft' using role 'tripcraft_app'."
}

# Clear sensitive variables from memory
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
$pgPass = $null
$appPass = $null
