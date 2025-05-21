#!/bin/bash

echo "===== Shelly Smart Home Environment Setup ====="
echo "This script will help you set up your local environment."
echo ""

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js is already installed (version: $NODE_VERSION)"
else
    echo "❌ Node.js is not installed."
    echo ""
    echo "Please download and install Node.js from the official website:"
    echo "https://nodejs.org/en/download/"
    echo ""
    echo "Download the macOS ARM64 installer (.pkg file) and follow the installation instructions."
    echo "After installing Node.js, run this script again."
    exit 1
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm is already installed (version: $NPM_VERSION)"
else
    echo "❌ npm is not installed."
    echo "This is unusual as npm should be installed with Node.js."
    echo "Please reinstall Node.js from https://nodejs.org/en/download/"
    exit 1
fi

echo ""
echo "===== Installing project dependencies ====="

# Navigate to the project directory
cd "$(dirname "$0")"

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Create data directory if it doesn't exist
if [ ! -d "data" ]; then
  echo "Creating data directory..."
  mkdir -p data
fi

# Initialize the database
echo "Initializing database..."
npm run db:push

echo ""
echo "===== Environment Setup Complete ====="
echo "You can now start the development server with:"
echo "npm run dev"
echo ""
echo "The application will be available at: http://localhost:5001"
