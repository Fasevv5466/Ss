#!/bin/bash

# KIRA Supreme Bot v24 - Auto Restart System
# الإصدار: 24.11.0
# المطور: Ayman

echo " "
echo "╔══════════════════════════════════════════════╗"
echo "║       🚀 KIRA Supreme v24.11.0 - Node 24     ║"
echo "╚══════════════════════════════════════════════╝"
echo " "
echo "🌟 المطور: Ayman"
echo "🤖 البوت: 𝐊𝐈𝐑𝐀 𝐒𝐮𝐩𝐫𝐞𝐦𝐞 𝐯𝟐𝟒"
echo "📊 Node.js: $(node --version)"
echo "📦 npm: $(npm --version)"
echo "🔧 نظام المنشن الذكي: مفعل"
echo "🧠 دعم الذكاء الاصطناعي: متكامل"
echo "🕒 التوقيت: Asia/Baghdad"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " "

# إنشاء المجلدات الأساسية
echo "📁 إنشاء الهيكل التنظيمي..."
mkdir -p \
    systems \
    script/commands/{data,cache,tad} \
    backup \
    logs \
    includes/database \
    utils/cache

# متغيرات التحكم
MAX_RESTARTS=20
RESTART_DELAY=5
RESTART_COUNT=0
COOLDOWN_COUNT=0

# دالة لتنظيف الذاكرة
clean_memory() {
    echo "🧹 تنظيف الذاكرة المؤقتة..."
    rm -rf script/commands/cache/*.tmp 2>/dev/null
    rm -rf script/commands/tad/*.tmp 2>/dev/null
    rm -rf utils/cache/*.tmp 2>/dev/null
    find . -name "*.log" -size +10M -delete 2>/dev/null
}

# دالة للنسخ الاحتياطي
backup_system() {
    if [ ! -d "backup" ]; then mkdir -p backup; fi
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    tar -czf "backup/kira_backup_${TIMESTAMP}.tar.gz" \
        config.json \
        script/commands/data/*.json \
        includes/database/*.db 2>/dev/null
    echo "💾 نسخة احتياطية: backup/kira_backup_${TIMESTAMP}.tar.gz"
}

# حلقة التشغيل الرئيسية
while true; do
    CLEAN_COUNT=$((RESTART_COUNT % 3))
    
    echo " "
    echo "🌀 المحاولة: $((RESTART_COUNT + 1))"
    echo "⏰ البداية: $(date '+%H:%M:%S')"
    
    # تنظيف دوري كل 3 محاولات
    if [ $CLEAN_COUNT -eq 0 ]; then
        clean_memory
    fi
    
    # نسخ احتياطي كل 10 محاولات
    if [ $((RESTART_COUNT % 10)) -eq 0 ]; then
        backup_system
    fi
    
    # تشغيل البوت مع إعدادات الذاكرة المتقدمة
    echo "🚀 تشغيل النظام الرئيسي..."
    NODE_OPTIONS="--max-old-space-size=1024 --trace-warnings --enable-source-maps" \
    node index.js
    
    EXIT_CODE=$?
    RESTART_COUNT=$((RESTART_COUNT + 1))
    
    echo " "
    echo "⚠️ البوت توقف!"
    echo "📊 كود الخروج: $EXIT_CODE"
    
    # تحليل سبب التوقف
    case $EXIT_CODE in
        0)
            echo "✅ توقف طبيعي - ربما أمر إيقاف"
            break
            ;;
        137)
            echo "💀 قتل بواسطة OOM Killer - زيادة الذاكرة"
            sleep 10
            ;;
        139)
            echo "🛑 Segmentation Fault - خطأ في الذاكرة"
            clean_memory
            sleep 15
            ;;
        *)
            echo "🔧 خطأ عام - إعادة تشغيل"
            ;;
    esac
    
    # نظام التهدئة
    if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
        echo " "
        echo "❌ وصلت الحد الأقصى ($MAX_RESTARTS محاولة)"
        echo "💤 تهدئة لمدة 5 دقائق..."
        COOLDOWN_COUNT=$((COOLDOWN_COUNT + 1))
        
        if [ $COOLDOWN_COUNT -ge 3 ]; then
            echo "🛑 توقف نهائي بعد 3 تهدئات"
            break
        fi
        
        sleep 300
        RESTART_COUNT=0
    fi
    
    echo " "
    echo "🔄 إعادة التشغيل خلال ${RESTART_DELAY} ثواني..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    sleep $RESTART_DELAY
done

echo " "
echo "🛑 النظام توقف نهائياً"
echo "📅 الوقت: $(date)"
echo "🔢 عدد المحاولات: $RESTART_COUNT"
echo "════════════════════════════════════════════════"
