#!/bin/bash

# Fuel Tracker API - Linux/Mac Startup Script

echo "Starting Fuel Tracker API..."

# Check if .NET SDK is installed
if ! command -v dotnet &> /dev/null; then
    echo "Error: .NET SDK not detected, please install .NET 8.0 SDK first"
    exit 1
fi

DOTNET_VERSION=$(dotnet --version)
echo "Detected .NET version: $DOTNET_VERSION"

# Restore NuGet packages
echo "Restoring NuGet packages..."
dotnet restore FuelTracker.sln

if [ $? -ne 0 ]; then
    echo "Error: NuGet package restoration failed"
    exit 1
fi

# Build project
echo "Building project..."
dotnet build FuelTracker.sln

if [ $? -ne 0 ]; then
    echo "Error: Project build failed"
    exit 1
fi

# Run project
echo "Starting API server..."
echo "API will be running at:"
echo "  HTTP:  http://localhost:5000"
echo "  HTTPS: https://localhost:5001"
echo "  Swagger: https://localhost:5001/swagger"
echo ""
echo "Press Ctrl+C to stop the server"

dotnet run 