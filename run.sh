#!/bin/bash
echo "Installing dependencies..."
npm install
echo "Downloading sprites..."
node scripts/downloadSprites.js
echo "Starting game..."
npm start
