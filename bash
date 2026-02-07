#!/bin/bash

# Kira Bot Auto Restart Script
# المطور: 𝐚𝐲𝐦𝐚𝐧

echo "🚀 Starting Kira Bot..."
echo "المطور: 𝐚𝐲𝐦𝐚𝐧 | البوت: 𝐤𝐢𝐫𝐚"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

while true; do
    node index.js
    echo ""
    echo "⚠️ Bot stopped. Restarting in 5 seconds..."
    echo "البوت توقف. إعادة تشغيل بعد 5 ثوان..."
    sleep 5
done
