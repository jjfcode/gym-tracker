#!/bin/bash

# Chrome DevTools MCP - Startup Script
# This ensures Chrome starts with proper debugging flags

echo "🚀 Starting Chrome for MCP DevTools..."

# Kill existing Chrome processes
echo "🧹 Cleaning up existing Chrome processes..."
taskkill //F //IM chrome.exe 2>/dev/null || true

# Wait for cleanup
sleep 2

# Start Chrome with remote debugging
echo "🔧 Starting Chrome with debugging enabled..."
"C:/Program Files/Google/Chrome/Application/chrome.exe" \
  --remote-debugging-port=9222 \
  --disable-web-security \
  --disable-features=VizDisplayCompositor \
  --user-data-dir="C:/temp/chrome-debug" \
  http://localhost:5173

echo "✅ Chrome started with debugging on port 9222"
echo "📡 MCP Server should now be able to connect"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:5173 in the Chrome window that opened"
echo "2. Press F12 to open DevTools"
echo "3. Run the MCP connection test in Console"