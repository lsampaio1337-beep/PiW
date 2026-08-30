#!/bin/bash
echo "Installing dependencies..."
npm install

echo "Starting game..."
nohup npm start > /dev/null 2>&1 &
exit 0
