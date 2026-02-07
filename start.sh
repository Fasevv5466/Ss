#!/bin/bash

# ============================================
# KIRA BOT - AUTO RESTART SCRIPT
# المطور: 𝐚𝐲𝐦𝐚𝐧 | XVK1C
# ============================================

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║  ██╗  ██╗ ██╗ ██████╗   ██╗   ██████╗  ██████╗ ████████╗"
echo "║  ██║ ██╔╝ ██║ ██╔══██╗ ███║   ██╔══██╗██╔═══██╗╚══██╔══╝"
echo "║  █████╔╝  ██║ ██████╔╝ ╚██║   ██████╔╝██║   ██║   ██║   "
echo "║  ██╔═██╗  ██║ ██╔══██╗  ██║   ██╔══██╗██║   ██║   ██║   "
echo "║  ██║  ██╗ ██║ ██║  ██║  ██║   ██║  ██║╚██████╔╝   ██║   "
echo "║  ╚═╝  ╚═╝ ╚═╝ ╚═╝  ╚═╝  ╚═╝   ╚═╝  ╚═╝ ╚═════╝    ╚═╝   "
echo "║                                                       ║"
echo "║               𝐊𝐈𝐑𝐀 𝐁𝐎𝐓 v31.7.2                        ║"
echo "║          By: 𝐚𝐲𝐦𝐚𝐧 | XVK1C                          ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Starting Kira Bot..."
echo "Developer: 𝐚𝐲𝐦𝐚𝐧 | Bot: 𝐤𝐢𝐫𝐚"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

RESTART_COUNT=0
MAX_RESTARTS=10

while [ $RESTART_COUNT -lt $MAX_RESTARTS ]; do
    echo ""
    echo "⏳ Starting bot... (Attempt: $((RESTART_COUNT + 1))/$MAX_RESTARTS)"
    echo "📅 Date: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "📁 Directory: $(pwd)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # تشغيل البوت
    node index.js
    
    EXIT_CODE=$?
    
    echo ""
    echo "⚠️  Bot stopped with exit code: $EXIT_CODE"
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo "✅ Normal shutdown, not restarting"
        break
    fi
    
    RESTART_COUNT=$((RESTART_COUNT + 1))
    
    if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
        echo "❌ Max restarts reached ($MAX_RESTARTS)"
        echo "🚫 Stopping..."
        break
    fi
    
    echo "🔄 Restarting in 5 seconds... ($RESTART_COUNT/$MAX_RESTARTS)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    sleep 5
done

echo ""
echo "👋 Script ended"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
