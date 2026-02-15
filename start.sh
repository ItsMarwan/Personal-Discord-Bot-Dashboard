#!/bin/bash

echo "Starting Discord Bot Dashboard..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy .env.example to .env and configure it:"
    echo "  cp .env.example .env"
    echo ""
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Validate configuration
echo "Validating configuration..."
node validate-setup.js
if [ $? -ne 0 ]; then
    echo ""
    echo "Setup validation failed. Please fix the errors above."
    exit 1
fi

echo "Starting bot and dashboard..."
echo ""
echo "Dashboard will be available at: http://localhost:3000"
echo "Bot API running on: http://localhost:3001"
echo ""
echo "First time? It may take 30 seconds to fetch all members from Discord."
echo "Tip: Wait for 'Cached X members' message before opening dashboard"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
