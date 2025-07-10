# Fuel Tracker API - PowerShell Startup Script

Write-Host "Starting Fuel Tracker API..." -ForegroundColor Green

# Check if .NET SDK is installed
try {
    $dotnetVersion = dotnet --version
    Write-Host "Detected .NET version: $dotnetVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Error: .NET SDK not detected, please install .NET 8.0 SDK first" -ForegroundColor Red
    exit 1
}

# Restore NuGet packages
Write-Host "Restoring NuGet packages..." -ForegroundColor Yellow
dotnet restore FuelTracker.sln

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: NuGet package restoration failed" -ForegroundColor Red
    exit 1
}

# Build project
Write-Host "Building project..." -ForegroundColor Yellow
dotnet build FuelTracker.sln

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Project build failed" -ForegroundColor Red
    exit 1
}

# Run project
Write-Host "Starting API server..." -ForegroundColor Green
Write-Host "API will be running at:" -ForegroundColor Cyan
Write-Host "  HTTP:  http://localhost:5000" -ForegroundColor White
Write-Host "  HTTPS: https://localhost:5001" -ForegroundColor White
Write-Host "  Swagger: https://localhost:5001/swagger" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow

dotnet run 