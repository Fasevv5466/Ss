const fs = require('fs');
const path = require('path');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//                 🏦 نظام بنك هبة - الإصدار الموحد
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// المسار الوحيد لتخزين البيانات
const BANK_DB_PATH = path.join(__dirname, 'bank_db.js');

// زخارف ثابتة
const ZKHARAF = {
    header: "『 ✦ 』──────────『 ✦ 』",
    line: "⟦ ✧ ⟧━━━━━━━━━━⟦ ✧ ⟧",
    footer: "⟪ ★ ⟫──────────⟪ ★ ⟫",
    section: "◈ ───『 {text} 』─── ◈",
    separator: "◈ ────────────── ◈"
};

// ──────────────────────────────────────────────────────────────
// 1. دوال القراءة والكتابة
// ──────────────────────────────────────────────────────────────
function loadDatabase() {
    try {
        if (fs.existsSync(BANK_DB_PATH)) {
            const content = fs.readFileSync(BANK_DB_PATH, 'utf8');
            const match = content.match(/module\.exports\s*=\s*(\{[\s\S]*\});?\s*$/);
            
            if (match && match[1]) {
                return JSON.parse(match[1]);
            }
        }
        return {};
    } catch (error) {
        console.error('❌ خطأ في تحميل قاعدة البيانات:', error.message);
        return {};
    }
}

function saveDatabase(data) {
    try {
        const content = `// 🏦 قاعدة بيانات بنك هبة - ${new Date().toLocaleString()}
// ⚠️ لا تعدل هذا الملف يدوياً!

module.exports = ${JSON.stringify(data, null, 2)};`;
        
        fs.writeFileSync(BANK_DB_PATH, content, 'utf8');
        return true;
    } catch (error) {
        console.error('❌ خطأ في حفظ قاعدة البيانات:', error.message);
        return false;
    }
}

// ──────────────────────────────────────────────────────────────
// 2. النظام البنكي الرئيسي (متوافق مع النظام القديم)
// ──────────────────────────────────────────────────────────────
const bankSystem = {
    // ✅ متوافق مع النظام القديم: createAccount
    createAccount: function(userId, userName = "مستخدم جديد") {
        const data = loadDatabase();
        
        if (!data[userId]) {
            data[userId] = {
                name: userName,
                balance: 0,
                joinDate: new Date().toISOString(),
                lastGift: null,
                history: []
            };
            
            saveDatabase(data);
            return true;
        }
        return false;
    },
    
    // ✅ متوافق مع النظام القديم: getBalance
    getBalance: function(userId) {
        const data = loadDatabase();
        return data[userId]?.balance || 0;
    },
    
    // ✅ متوافق مع النظام القديم: updateBalance
    updateBalance: function(userId, amount, operation = "add", reason = "") {
        const data = loadDatabase();
        
        if (!data[userId]) {
            this.createAccount(userId);
        }
        
        const user = data[userId];
        const oldBalance = user.balance;
        
        if (operation === "add") {
            user.balance += amount;
        } else if (operation === "subtract") {
            user.balance = Math.max(0, user.balance - amount);
        } else if (operation === "set") {
            user.balance = amount;
        }
        
        // تسجيل في السجل
        user.history.push({
            type: operation,
            amount: amount,
            oldBalance: oldBalance,
            newBalance: user.balance,
            reason: reason,
            timestamp: new Date().toISOString()
        });
        
        saveDatabase(data);
        return user.balance;
    },
    
    // ✅ متوافق مع النظام القديم: addMoney (اسم جديد)
    addMoney: function(userId, amount, reason = "") {
        return this.updateBalance(userId, amount, "add", reason);
    },
    
    // ✅ متوافق مع النظام القديم: subtractMoney (اسم جديد)
    subtractMoney: function(userId, amount, reason = "") {
        if (amount <= 0) return false;
        
        const data = loadDatabase();
        
        if (!data[userId] || data[userId].balance < amount) {
            return false;
        }
        
        return this.updateBalance(userId, amount, "subtract", reason);
    },
    
    // ✅ متوافق مع النظام القديم: transferMoney
    transferMoney: function(fromId, toId, amount) {
        if (amount <= 0) return { success: false, message: "المبلغ غير صالح" };
        if (fromId === toId) return { success: false, message: "لا يمكن التحويل لنفسك" };
        
        const data = loadDatabase();
        
        if (!data[fromId] || data[fromId].balance < amount) {
            return { success: false, message: "رصيد غير كافي" };
        }
        
        if (!data[toId]) {
            data[toId] = {
                name: "مستخدم",
                balance: 0,
                joinDate: new Date().toISOString(),
                lastGift: null,
                history: []
            };
        }
        
        // الخصم من المرسل
        this.updateBalance(fromId, amount, "subtract", `تحويل لـ ${toId}`);
        
        // الإضافة للمستلم
        this.updateBalance(toId, amount, "add", `تحويل من ${fromId}`);
        
        return {
            success: true,
            message: "تم التحويل بنجاح",
            fromNewBalance: data[fromId]?.balance || 0,
            toNewBalance: data[toId]?.balance || 0
        };
    },
    
    // ✅ متوافق مع النظام القديم: getDailyGift
    getDailyGift: function(userId) {
        const GIFT_AMOUNT = 500;
        
        const data = loadDatabase();
        
        if (!data[userId]) {
            this.createAccount(userId);
        }
        
        const user = data[userId];
        const now = new Date();
        
        if (user.lastGift) {
            const lastGiftDate = new Date(user.lastGift);
            const hoursDiff = (now - lastGiftDate) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
                const remainingHours = 24 - hoursDiff;
                const hours = Math.floor(remainingHours);
                const minutes = Math.floor((remainingHours - hours) * 60);
                
                return {
                    success: false,
                    hoursLeft: hours,
                    minutesLeft: minutes,
                    nextGift: new Date(lastGiftDate.getTime() + 24 * 60 * 60 * 1000)
                };
            }
        }
        
        // منح الهدية
        const oldBalance = user.balance;
        user.balance += GIFT_AMOUNT;
        user.lastGift = now.toISOString();
        
        user.history.push({
            type: "daily_gift",
            amount: GIFT_AMOUNT,
            oldBalance: oldBalance,
            newBalance: user.balance,
            reason: "هدية يومية",
            timestamp: now.toISOString()
        });
        
        saveDatabase(data);
        
        return {
            success: true,
            amount: GIFT_AMOUNT,
            newBalance: user.balance,
            nextGift: new Date(now.getTime() + 24 * 60 * 60 * 1000)
        };
    },
    
    // ✅ متوافق مع النظام القديم: getUserInfo
    getUserInfo: function(userId) {
        const data = loadDatabase();
        return data[userId] || null;
    },
    
    // ✅ متوافق مع النظام القديم: deleteAccount
    deleteAccount: function(userId) {
        const data = loadDatabase();
        
        if (data[userId]) {
            delete data[userId];
            saveDatabase(data);
            return true;
        }
        
        return false;
    },
    
    // دوال إضافية جديدة
    getAllUsers: function() {
        return loadDatabase();
    },
    
    getStats: function() {
        const data = loadDatabase();
        const users = Object.values(data);
        
        return {
            totalUsers: users.length,
            totalMoney: users.reduce((sum, user) => sum + user.balance, 0),
            totalTransactions: users.reduce((sum, user) => sum + (user.history?.length || 0), 0)
        };
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//           تصدير النظام - متوافق مع النظام القديم
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ⭐ التصدير الأساسي: bankSystem (للنظام القديم)
module.exports = bankSystem;

// ⭐ تصدير إضافي للزخارف (اختياري)
module.exports.ZKHARAF = ZKHARAF;
