# How to Clear Ports on macOS/Linux

When you see errors like "Port 8080 is not open" or "port taken", here's how to fix it.

## Quick Method: Use the Script

I've created a helper script for you:

```bash
./scripts/clear-port.sh 8080
./scripts/clear-port.sh 9000
./scripts/clear-port.sh 3000
```

## Manual Method: Step by Step

### Step 1: Find What's Using the Port

Use `lsof` (list open files) to find the process:

```bash
lsof -i:8080
```

This shows you:
- **COMMAND**: The program name
- **PID**: Process ID (the number you need)
- **USER**: Who's running it
- **NAME**: The port info

**Quick version** (just get the PID):
```bash
lsof -ti:8080
```

### Step 2: Kill the Process

Once you have the PID, kill it:

```bash
kill -9 <PID>
```

**Example:**
```bash
# Find the PID
PID=$(lsof -ti:8080)

# Kill it
kill -9 $PID
```

### Step 3: Verify It's Free

Check again:
```bash
lsof -i:8080
```

If nothing shows up, the port is free!

## One-Liner Commands

**Kill process on port 8080:**
```bash
lsof -ti:8080 | xargs kill -9
```

**Kill process on port 9000:**
```bash
lsof -ti:9000 | xargs kill -9
```

**Kill process on port 3000:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Safe version** (won't error if port is already free):
```bash
lsof -ti:8080 | xargs kill -9 2>/dev/null || echo "Port already free"
```

## Common Ports in This Project

- **3000**: Next.js dev server
- **4000**: Firebase Emulator UI
- **8080**: Firestore Emulator
- **9000**: Firebase Realtime Database Emulator
- **9099**: Firebase Auth Emulator
- **9199**: Firebase Storage Emulator

## Clear Multiple Ports at Once

```bash
# Clear all common dev ports
for port in 3000 4000 8080 9000 9099 9199; do
    lsof -ti:$port | xargs kill -9 2>/dev/null && echo "✅ Cleared port $port" || echo "ℹ️  Port $port already free"
done
```

## Add to Your Shell Profile (Optional)

Add this function to your `~/.zshrc` for easy access:

```bash
# Add to ~/.zshrc
clearport() {
    if [ -z "$1" ]; then
        echo "Usage: clearport <PORT_NUMBER>"
        return 1
    fi
    PID=$(lsof -ti:$1)
    if [ -z "$PID" ]; then
        echo "✅ Port $1 is already free"
    else
        kill -9 $PID
        echo "✅ Killed process $PID on port $1"
    fi
}
```

Then reload your shell:
```bash
source ~/.zshrc
```

Now you can use:
```bash
clearport 8080
clearport 9000
```

## Understanding the Commands

- **`lsof`**: "List Open Files" - shows what processes are using files/ports
- **`-i:PORT`**: Filter by internet port
- **`-t`**: Show only PIDs (process IDs)
- **`kill -9`**: Force kill a process (SIGKILL signal)
- **`xargs`**: Takes input and passes it as arguments to another command
- **`2>/dev/null`**: Hides error messages
- **`||`**: "or" - runs the next command if the first fails

## Troubleshooting

**"Permission denied"**
- The process might be owned by another user
- Use `sudo kill -9 <PID>` (but be careful!)

**"No such process"**
- The process already died
- Port is already free

**Port still shows as taken after killing**
- Wait a second and check again (ports take a moment to release)
- Try: `sleep 1 && lsof -i:8080`


