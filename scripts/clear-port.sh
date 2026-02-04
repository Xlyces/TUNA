#!/bin/bash

# Clear Port Script
# Usage: ./scripts/clear-port.sh <PORT_NUMBER>
# Example: ./scripts/clear-port.sh 8080

if [ -z "$1" ]; then
    echo "❌ Error: Please provide a port number"
    echo "Usage: ./scripts/clear-port.sh <PORT_NUMBER>"
    echo "Example: ./scripts/clear-port.sh 8080"
    exit 1
fi

PORT=$1

# Find process using the port
PID=$(lsof -ti:$PORT)

if [ -z "$PID" ]; then
    echo "✅ Port $PORT is already free - no process found"
    exit 0
fi

# Show what's using the port
echo "🔍 Found process using port $PORT:"
lsof -i:$PORT

# Ask for confirmation (optional - remove if you want it to auto-kill)
read -p "⚠️  Kill process $PID? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

# Kill the process
kill -9 $PID

# Verify it's gone
sleep 1
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "❌ Failed to kill process on port $PORT"
    exit 1
else
    echo "✅ Port $PORT is now free!"
fi


