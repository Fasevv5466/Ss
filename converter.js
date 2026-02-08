#!/usr/bin/env node
/**
 * 🔧 محول أوامر GoatBot إلى صيغة KIRA
 * 
 * الاستخدام:
 * node converter.js <source_folder> <target_folder>
 * 
 * مثال:
 * node converter.js ./Goat-Bot-V2-fixed-main/scripts/cmds ./KIRA-main/script/commands/converted
 */

const fs = require('fs');
const path = require('path');

// ألوان للطباعة
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

/**
 * تحويل أمر واحد من GoatBot إلى KIRA
 */
function convertCommand(goatbotCode, fileName) {
    try {
        // استخراج module.exports
        const moduleMatch = goatbotCode.match(/module\.exports\s*=\s*{([\s\S]+)}/);
        if (!moduleMatch) {
            return { success: false, error: 'No module.exports found' };
        }
        
        // استخراج الـ config
        const configMatch = goatbotCode.match(/config:\s*{([^}]+(?:{[^}]*}[^}]*)*?)},?\s*(?:langs|onStart)/s);
        if (!configMatch) {
            return { success: false, error: 'No config found' };
        }
        
        // استخراج الـ onStart
        const onStartMatch = goatbotCode.match(/onStart:\s*async\s*function\s*\(([^)]+)\)\s*{([\s\S]+?)(?=^\s*}(?:\s*};?\s*$))/m);
        if (!onStartMatch) {
            return { success: false, error: 'No onStart function found' };
        }
        
        // استخراج معلومات من الـ config
        const configStr = configMatch[1];
        const name = extractValue(configStr, 'name') || path.basename(fileName, '.js');
        const version = extractValue(configStr, 'version') || '1.0';
        const author = extractValue(configStr, 'author') || 'Unknown';
        const category = extractValue(configStr, 'category') || 'general';
        const countDown = extractValue(configStr, 'countDown', true) || '5';
        const role = extractValue(configStr, 'role', true) || '0';
        
        // استخراج الوصف
        let description = name + ' command';
        const descMatch = configStr.match(/description:\s*{[^}]*en:\s*["']([^"']+)["']/);
        if (descMatch) {
            description = descMatch[1];
        }
        
        // بناء الكود الجديد
        const newCode = buildKiraCommand({
            name,
            version,
            author,
            category,
            countDown,
            role,
            description,
            onStartBody: onStartMatch[2]
        });
        
        return { success: true, code: newCode };
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * استخراج قيمة من النص
 */
function extractValue(text, key, isNumber = false) {
    const pattern = isNumber 
        ? new RegExp(`${key}:\\s*(\\d+)`)
        : new RegExp(`${key}:\\s*["']([^"']+)["']`);
    
    const match = text.match(pattern);
    return match ? match[1] : null;
}

/**
 * بناء كود KIRA
 */
function buildKiraCommand({ name, version, author, category, countDown, role, description, onStartBody }) {
    return `/**
 * 🤖 تم تحويل هذا الأمر تلقائياً من GoatBot إلى KIRA
 * الأمر الأصلي: ${name}
 * المطور الأصلي: ${author}
 */

module.exports.config = {
    name: "${name}",
    version: "${version}",
    hasPermssion: ${role},
    credits: "${author}",
    description: "${description}",
    commandCategory: "${category}",
    usages: "${name}",
    cooldowns: ${countDown},
};

module.exports.run = async ({ api, event, args, Users, Threads, Currencies }) => {
    const { threadID, messageID, senderID } = event;
    
    // ========== محاكاة دوال GoatBot ==========
    
    // دالة message
    const message = {
        reply: async (text, callback) => {
            return api.sendMessage(text, threadID, callback || (() => {}), messageID);
        },
        send: async (text, tid) => {
            return api.sendMessage(text, tid || threadID);
        },
        reaction: async (emoji) => {
            return api.setMessageReaction(emoji, messageID, () => {}, true);
        },
        unsend: async (mid) => {
            return api.unsendMessage(mid || messageID);
        }
    };
    
    // دالة usersData
    const usersData = {
        get: async (uid, field) => {
            try {
                const data = await Users.getData(uid);
                return field ? (data[field] || 0) : data;
            } catch (e) {
                return field ? 0 : {};
            }
        },
        set: async (uid, field, value) => {
            try {
                const data = await Users.getData(uid);
                data[field] = value;
                await Users.setData(uid, data);
                return true;
            } catch (e) {
                return false;
            }
        }
    };
    
    // دالة threadsData  
    const threadsData = {
        get: async (tid, field) => {
            try {
                const data = await Threads.getData(tid);
                return field ? (data[field] || null) : data;
            } catch (e) {
                return field ? null : {};
            }
        },
        set: async (tid, field, value) => {
            try {
                const data = await Threads.getData(tid);
                data[field] = value;
                await Threads.setData(tid, data);
                return true;
            } catch (e) {
                return false;
            }
        }
    };
    
    // دالة getLang (بسيطة)
    const getLang = (key, ...replacements) => {
        let text = key;
        replacements.forEach((val, i) => {
            text = text.replace(\`%\${i + 1}\`, val);
        });
        return text;
    };
    
    // ========== الكود الأصلي ==========
    
    try {
${onStartBody.split('\n').map(line => '        ' + line).join('\n')}
    } catch (error) {
        console.error('[${name}] Error:', error);
        return api.sendMessage(
            \`❌ حدث خطأ في تنفيذ الأمر:\\n\${error.message}\`,
            threadID,
            messageID
        );
    }
};
`;
}

/**
 * معالجة مجلد كامل
 */
function convertFolder(sourcePath, targetPath) {
    // التحقق من المجلد المصدر
    if (!fs.existsSync(sourcePath)) {
        log(`❌ المجلد المصدر غير موجود: ${sourcePath}`, 'red');
        return;
    }
    
    // إنشاء المجلد الهدف
    if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
        log(`📁 تم إنشاء المجلد: ${targetPath}`, 'cyan');
    }
    
    // قراءة الملفات
    const files = fs.readdirSync(sourcePath);
    const jsFiles = files.filter(f => f.endsWith('.js'));
    
    log(`\n📊 بدء التحويل...`, 'blue');
    log(`   المجلد المصدر: ${sourcePath}`, 'cyan');
    log(`   المجلد الهدف: ${targetPath}`, 'cyan');
    log(`   عدد الملفات: ${jsFiles.length}`, 'cyan');
    log('');
    
    let converted = 0;
    let failed = 0;
    let errors = [];
    
    // معالجة كل ملف
    jsFiles.forEach((file, index) => {
        const filePath = path.join(sourcePath, file);
        
        // تخطي المجلدات
        if (fs.statSync(filePath).isDirectory()) {
            return;
        }
        
        // قراءة الملف
        const code = fs.readFileSync(filePath, 'utf8');
        
        // التحويل
        const result = convertCommand(code, file);
        
        if (result.success) {
            // حفظ الملف المحول
            const targetFile = path.join(targetPath, file);
            fs.writeFileSync(targetFile, result.code, 'utf8');
            converted++;
            log(`[${index + 1}/${jsFiles.length}] ✅ ${file}`, 'green');
        } else {
            failed++;
            errors.push({ file, error: result.error });
            log(`[${index + 1}/${jsFiles.length}] ❌ ${file} - ${result.error}`, 'red');
        }
    });
    
    // النتيجة النهائية
    log('');
    log('═══════════════════════════════════════', 'blue');
    log(`📊 النتيجة النهائية:`, 'blue');
    log(`   ✅ نجح: ${converted} ملف`, 'green');
    log(`   ❌ فشل: ${failed} ملف`, failed > 0 ? 'red' : 'green');
    log(`   📁 المجلد: ${targetPath}`, 'cyan');
    log('═══════════════════════════════════════', 'blue');
    
    // عرض الأخطاء
    if (errors.length > 0) {
        log('\n⚠️  الملفات الفاشلة:', 'yellow');
        errors.forEach(({ file, error }) => {
            log(`   - ${file}: ${error}`, 'yellow');
        });
    }
    
    log('');
    log('🎉 تم الانتهاء من التحويل!', 'green');
    log('');
}

/**
 * تحويل ملف واحد
 */
function convertSingleFile(sourceFile, targetFile) {
    if (!fs.existsSync(sourceFile)) {
        log(`❌ الملف غير موجود: ${sourceFile}`, 'red');
        return;
    }
    
    const code = fs.readFileSync(sourceFile, 'utf8');
    const result = convertCommand(code, path.basename(sourceFile));
    
    if (result.success) {
        fs.writeFileSync(targetFile, result.code, 'utf8');
        log(`✅ تم التحويل: ${targetFile}`, 'green');
    } else {
        log(`❌ فشل التحويل: ${result.error}`, 'red');
    }
}

// ========== البرنامج الرئيسي ==========

if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
        log('', 'cyan');
        log('🔧 محول أوامر GoatBot إلى KIRA', 'cyan');
        log('', 'cyan');
        log('الاستخدام:', 'yellow');
        log('  node converter.js <source_folder> <target_folder>', 'white');
        log('', 'white');
        log('مثال:', 'yellow');
        log('  node converter.js ./goatbot/cmds ./kira/commands/converted', 'white');
        log('', 'white');
        process.exit(1);
    }
    
    const sourcePath = path.resolve(args[0]);
    const targetPath = path.resolve(args[1]);
    
    convertFolder(sourcePath, targetPath);
}

// تصدير للاستخدام كمكتبة
module.exports = {
    convertCommand,
    convertFolder,
    convertSingleFile
};
