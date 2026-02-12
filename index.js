/**
 * ═══════════════════════════════════════════════════════════
 * 🔧 جزء محسّن من index.js - تحميل Events
 * ═══════════════════════════════════════════════════════════
 * استبدل قسم "تحميل الأحداث" في index.js (السطور 174-184)
 * بهذا الكود المحسّن
 * ═══════════════════════════════════════════════════════════
 */

// تحميل الأحداث - النسخة المحسّنة
const eventsPath = join(global.client.mainPath, 'script', 'events');

if (existsSync(eventsPath)) {
    console.log(chalk.bold.hex("#03f0fc")("\n[ EVENTS ] ") + chalk.hex("#fcba03")("Loading events..."));
    
    const eventFiles = readdirSync(eventsPath).filter(ev => ev.endsWith('.js'));
    let successCount = 0;
    let failCount = 0;
    
    for (const eventFile of eventFiles) {
        try {
            const eventPath = join(eventsPath, eventFile);
            
            // حذف الكاش للتأكد من تحميل آخر نسخة
            delete require.cache[require.resolve(eventPath)];
            
            // تحميل الـ event
            const eventModule = require(eventPath);
            
            // ════════════════════════════════════════════════════════
            // 🔍 التحقق من صحة الهيكل
            // ════════════════════════════════════════════════════════
            
            // التحقق من وجود config
            if (!eventModule.config) {
                console.log(chalk.red(`   ❌ ${eventFile}: مفقود module.exports.config`));
                failCount++;
                continue;
            }
            
            // التحقق من وجود name
            if (!eventModule.config.name) {
                console.log(chalk.red(`   ❌ ${eventFile}: مفقود config.name`));
                failCount++;
                continue;
            }
            
            // التحقق من وجود eventType
            if (!eventModule.config.eventType || !Array.isArray(eventModule.config.eventType)) {
                console.log(chalk.yellow(`   ⚠️ ${eventFile}: مفقود أو غير صحيح config.eventType`));
                // نكمل التحميل لكن ننبه
            }
            
            // التحقق من وجود دالة التنفيذ
            if (!eventModule.run && !eventModule.handleEvent) {
                console.log(chalk.red(`   ❌ ${eventFile}: مفقود run أو handleEvent`));
                failCount++;
                continue;
            }
            
            // ════════════════════════════════════════════════════════
            // ✅ تحميل الحدث
            // ════════════════════════════════════════════════════════
            
            global.client.events.set(eventModule.config.name, eventModule);
            successCount++;
            
            // رسالة تحميل مفصلة
            const eventName = eventModule.config.name;
            const eventTypes = eventModule.config.eventType?.join(', ') || 'غير محدد';
            const executionMethod = eventModule.run ? 'run' : 'handleEvent';
            
            console.log(
                chalk.green(`   ✅ ${eventName}`) + 
                chalk.gray(` | ${executionMethod}`) +
                chalk.cyan(` | [${eventTypes}]`)
            );
            
        } catch (error) {
            failCount++;
            console.log(
                chalk.red(`   ❌ ${eventFile}: `) + 
                chalk.yellow(error.message)
            );
            
            // تفاصيل الخطأ في وضع التطوير
            if (global.config.DeveloperMode) {
                console.error(chalk.gray(`      Stack: ${error.stack}`));
            }
        }
    }
    
    // ════════════════════════════════════════════════════════
    // 📊 ملخص التحميل
    // ════════════════════════════════════════════════════════
    
    const total = successCount + failCount;
    console.log(chalk.bold.hex("#00FA9A")("\n[ EVENTS SUMMARY ]"));
    console.log(chalk.green(`   ✅ نجح: ${successCount}`));
    
    if (failCount > 0) {
        console.log(chalk.red(`   ❌ فشل: ${failCount}`));
    }
    
    console.log(chalk.cyan(`   📦 الإجمالي: ${total} events\n`));
    
} else {
    console.log(chalk.yellow("⚠️ مجلد events غير موجود!"));
}

/**
 * ═══════════════════════════════════════════════════════════
 * 📖 كيفية الاستخدام:
 * ═══════════════════════════════════════════════════════════
 * 
 * 1. افتح ملف index.js
 * 2. ابحث عن السطور 174-184 (قسم تحميل الأحداث)
 * 3. استبدلها بالكود أعلاه
 * 4. احفظ الملف
 * 5. أعد تشغيل البوت
 * 
 * ═══════════════════════════════════════════════════════════
 * 💡 الميزات الجديدة:
 * ═══════════════════════════════════════════════════════════
 * 
 * ✅ التحقق الشامل من صحة كل event
 * ✅ رسائل خطأ واضحة ومفصلة
 * ✅ دعم run و handleEvent
 * ✅ حذف الكاش قبل التحميل
 * ✅ ملخص شامل بعد التحميل
 * ✅ عرض eventTypes لكل event
 * ✅ تمييز الأخطاء بالألوان
 * 
 * ═══════════════════════════════════════════════════════════
 */
