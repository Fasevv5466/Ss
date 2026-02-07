#!/bin/bash

# 🚀 Kira Supreme Bot - Node.js 24
# الإصدار: 11.0.0

echo ""
echo "╔══════════════════════════════════════╗"
echo "║        KIRA SUPREME v11.0           ║"
echo "║        Node.js 24                   ║"
echo "║        أقوى نظام في العالم          ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "🤖 البوت: 𝐤𝐢𝐫𝐚 𝐒𝐮𝐩𝐫𝐞𝐦𝐞"
echo "🔧 Node.js: $(node --version)"
echo "📦 npm: $(npm --version)"
echo "💾 الذاكرة: $(free -h | awk '/^Mem:/ {print $2}')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# فحص إصدار Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ $NODE_MAJOR -lt 20 ]; then
    echo "❌ خطأ: Node.js 20 أو أعلى مطلوب"
    echo "📌 لديك: Node.js $NODE_VERSION"
    echo "💡 قم بالترقية: nvm install 20 && nvm use 20"
    exit 1
fi

echo "✅ Node.js $NODE_VERSION متوافق"

# إنشاء المجلدات
mkdir -p systems script/commands/data script/commands/cache backup logs

# تثبيت التبعيات إذا لزم
if [ ! -d "node_modules" ]; then
    echo "📦 جاري تثبيت التبعيات..."
    npm install --production
    if [ $? -ne 0 ]; then
        echo "❌ فشل تثبيت التبعيات"
        exit 1
    fi
    echo "✅ تم تثبيت التبعيات"
fi

# تنظيف النظام
echo "🧹 تنظيف النظام..."
rm -rf script/commands/cache/*.tmp
rm -rf script/commands/tad/*
find . -name "*.log" -mtime +7 -delete 2>/dev/null || true

# نسخ احتياطي
BACKUP_DIR="backup/$(date '+%Y-%m-%d_%H-%M')"
mkdir -p $BACKUP_DIR
cp -f config.json appstate.json $BACKUP_DIR/ 2>/dev/null || true
echo "💾 نسخة احتياطية: $BACKUP_DIR"

# متغيرات النظام
RESTART_COUNT=0
MAX_RESTARTS=10
START_TIME=$(date +%s)

# دالة التسجيل
log() {
    echo "[$(date '+%H:%M:%S')] $1" | tee -a logs/system.log
}

# حلقة التشغيل الرئيسية
while true; do
    RESTART_COUNT=$((RESTART_COUNT + 1))
    
    log ""
    log "🚀 بدء التشغيل (المحاولة: $RESTART_COUNT)"
    log "⏰ الوقت: $(date '+%H:%M:%S')"
    
    # إحصائيات النظام
    if [ $RESTART_COUNT -gt 1 ]; then
        UPTIME=$(( $(date +%s) - START_TIME ))
        log "⏱️  وقت التشغيل: $((UPTIME / 3600))h:$(( (UPTIME % 3600) / 60 ))m:$((UPTIME % 60))s"
    fi
    
    # تشغيل البوت مع مراقبة الذاكرة
    NODE_OPTIONS="--max-old-space-size=2048 --trace-warnings" node index.js
    
    EXIT_CODE=$?
    
    log "⚠️  البوت توقف. كود الخروج: $EXIT_CODE"
    
    # تحليل كود الخروج
    case $EXIT_CODE in
        0) log "✅ إغلاق طبيعي" ;;
        1) log "❌ خطأ عام" ;;
        137) log "💀 نفاذ الذاكرة (OOM)" ;;
        143) log "🛑 تم إيقاف العملية" ;;
        *) log "⚠️  كود خروج غير معروف: $EXIT_CODE" ;;
    esac
    
    # فحص الحد الأقصى
    if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
        log "🛑 وصلت للحد الأقصى ($MAX_RESTARTS إعادة تشغيل)"
        log "💤 توقف لمدة 5 دقائق..."
        sleep 300
        RESTART_COUNT=0
    fi
    
    log "🔄 إعادة التشغيل بعد 3 ثوان..."
    sleep 3
done
