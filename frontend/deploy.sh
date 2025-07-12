#!/bin/bash

# Fuel Tracker Frontend - Linux/Mac deploy Script, Make it executable: chmod +x deploy.sh

echo "Starting Fuel Tracker Frontend..."

# Zip and backup the current frontend directory
echo "Creating backup of current frontend directory..."

# mkdir -p "$BACKUP_DIR"
# cp -r frontend/* "$BACKUP_DIR/"

filename="frontend_backup_$(date +%Y%m%d_%H%M%S)"

tar -cvf ./frontend/$filename.tar ./frontend/fuel-tracker/

echo "Updating source code from GitHub..."

rm -rf Fuel-Consumption-Tracker/

git clone https://github.com/FibonacciAlex/Fuel-Consumption-Tracker.git


if [ $? -ne 0 ]; then
    echo "Error: Updating source code failed"
    exit 1
fi

# Copy fronted .env file and build the frontend 
echo "Copying .env file and building the frontend..."

cp ./frontend/.env_bak Fuel-Consumption-Tracker/frontend/.env

echo "Building the frontend..."

cd Fuel-Consumption-Tracker/frontend || exit 1

npm install
if [ $? -ne 0 ]; then
    echo "Error: npm install failed"
    exit 1
fi
npm run build
if [ $? -ne 0 ]; then
    echo "Error: npm run build failed"
    exit 1
fi
echo "Frontend build completed successfully."

# Copy the build to the backend directory
echo "Copying build to backend directory..."
cp -r dist/* ~/server/frontend/fuel-tracker/

if [ $? -ne 0 ]; then
    echo "Error: Copying build to backend directory failed"
    exit 1
fi
echo "Frontend deployment completed successfully."