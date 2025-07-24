#!/bin/bash
echo "Starting LogMacster in development mode..."
echo "Starting webpack dev server..."
npm start &
DEV_SERVER_PID=$!

echo "Waiting for webpack dev server to start..."
sleep 5

echo "Starting Electron..."
npm run electron-dev

echo "Stopping webpack dev server..."
kill $DEV_SERVER_PID
