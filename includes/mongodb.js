// ==========================================
// ملف إدارة قاعدة بيانات MongoDB - بوت Kira المطور
// ==========================================
const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://kkayman200_db_user:ukhzlLzjRxQgSnTl@cluster0.7nsuoil.mongodb.net/KiraDB?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ [MONGODB] Connected successfully to KiraDB"))
.catch(err => console.error("❌ [MONGODB] Connection error:", err));

const { Schema } = mongoose;

const userSchema = new Schema({
    userID: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

const currencySchema = new Schema({
    userID: { type: String, required: true, unique: true },
    money: { type: Number, default: 0, min: 0 }, // ✅ إضافة min: 0 لمنع الأرقام السالبة
    exp: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Currency = mongoose.model("Currency", currencySchema);

// ==============================
// 🛠️ الدوال المساعدة المطورة
// ==============================

// التأكد من وجود المستخدم (تم تحسين الأداء)
async function ensureUser(userID) {
    try {
        let user = await User.findOneAndUpdate(
            { userID }, 
            { $setOnInsert: { userID } }, 
            { upsert: true, new: true }
        );
        let currency = await Currency.findOneAndUpdate(
            { userID }, 
            { $setOnInsert: { userID, money: 0, exp: 0 } }, 
            { upsert: true, new: true }
        );
        return { user, currency };
    } catch (e) {
        console.error("❌ [MONGODB] Error in ensureUser:", e);
        return null;
    }
}

// إضافة رصيد (باستخدام التحديث المباشر $inc)
async function addMoney(userID, amount) {
    try {
        await ensureUser(userID);
        const parsedAmount = Number(amount);
        
        if (isNaN(parsedAmount) || parsedAmount < 0) {
            console.error("❌ [MONGODB] Invalid amount to add:", amount);
            return null;
        }

        const currency = await Currency.findOneAndUpdate(
            { userID },
            { 
                $inc: { money: parsedAmount }, 
                $set: { updatedAt: new Date() } 
            },
            { upsert: true, new: true }
        );
        
        console.log(`✅ [MONGODB] Added ${parsedAmount} to ${userID}. New balance: ${currency.money}`);
        return currency.money;
    } catch (e) {
        console.error("❌ [MONGODB] Error in addMoney:", e);
        return null;
    }
}

// ✅ خصم رصيد (مُصلح - يمنع الرصيد السالب)
async function removeMoney(userID, amount) {
    try {
        await ensureUser(userID);
        const parsedAmount = Number(amount);
        
        if (isNaN(parsedAmount) || parsedAmount < 0) {
            console.error("❌ [MONGODB] Invalid amount to remove:", amount);
            return null;
        }

        // جلب الرصيد الحالي
        const current = await Currency.findOne({ userID });
        
        if (!current) {
            console.error("❌ [MONGODB] User not found:", userID);
            return 0;
        }

        // حساب المبلغ الفعلي للخصم (لا يتجاوز الرصيد الحالي)
        const currentMoney = current.money || 0;
        const actualDeduction = Math.min(parsedAmount, currentMoney);
        const newBalance = Math.max(0, currentMoney - actualDeduction);

        // تحديث الرصيد
        const currency = await Currency.findOneAndUpdate(
            { userID },
            { 
                $set: { 
                    money: newBalance,
                    updatedAt: new Date() 
                } 
            },
            { new: true }
        );

        console.log(`✅ [MONGODB] Removed ${actualDeduction} from ${userID}. New balance: ${currency.money}`);
        
        return {
            success: true,
            requestedAmount: parsedAmount,
            deductedAmount: actualDeduction,
            newBalance: currency.money,
            wasPartial: actualDeduction < parsedAmount
        };
    } catch (e) {
        console.error("❌ [MONGODB] Error in removeMoney:", e);
        return null;
    }
}

// ✅ دالة جديدة: التحقق من كفاية الرصيد
async function hasSufficientBalance(userID, amount) {
    try {
        const currency = await Currency.findOne({ userID });
        if (!currency) return false;
        return (currency.money || 0) >= Number(amount);
    } catch (e) {
        console.error("❌ [MONGODB] Error in hasSufficientBalance:", e);
        return false;
    }
}

// ✅ دالة جديدة: تحويل أموال بين مستخدمين
async function transferMoney(fromUserID, toUserID, amount) {
    try {
        const parsedAmount = Number(amount);
        
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return { success: false, error: "مبلغ غير صالح" };
        }

        // التحقق من رصيد المرسل
        const hasFunds = await hasSufficientBalance(fromUserID, parsedAmount);
        if (!hasFunds) {
            return { success: false, error: "رصيد غير كافٍ" };
        }

        // خصم من المرسل
        const removeResult = await removeMoney(fromUserID, parsedAmount);
        if (!removeResult || !removeResult.success) {
            return { success: false, error: "فشل الخصم من المرسل" };
        }

        // إضافة للمستقبل
        const addResult = await addMoney(toUserID, parsedAmount);
        if (!addResult) {
            // إرجاع المبلغ للمرسل في حالة الفشل
            await addMoney(fromUserID, parsedAmount);
            return { success: false, error: "فشل الإضافة للمستقبل" };
        }

        console.log(`✅ [MONGODB] Transferred ${parsedAmount} from ${fromUserID} to ${toUserID}`);
        
        return {
            success: true,
            amount: parsedAmount,
            fromBalance: removeResult.newBalance,
            toBalance: addResult
        };
    } catch (e) {
        console.error("❌ [MONGODB] Error in transferMoney:", e);
        return { success: false, error: "خطأ في التحويل" };
    }
}

// جلب بيانات المستخدم
async function getUserData(userID) {
    try {
        await ensureUser(userID);
        const user = await User.findOne({ userID });
        const currency = await Currency.findOne({ userID });
        return { user, currency };
    } catch (e) {
        console.error("❌ [MONGODB] Error in getUserData:", e);
        return null;
    }
}

// ✅ دالة جديدة: جلب الرصيد فقط
async function getBalance(userID) {
    try {
        await ensureUser(userID);
        const currency = await Currency.findOne({ userID });
        return currency ? (currency.money || 0) : 0;
    } catch (e) {
        console.error("❌ [MONGODB] Error in getBalance:", e);
        return 0;
    }
}

// ✅ دالة جديدة: تعيين رصيد محدد
async function setBalance(userID, amount) {
    try {
        await ensureUser(userID);
        const parsedAmount = Math.max(0, Number(amount));
        
        if (isNaN(parsedAmount)) {
            console.error("❌ [MONGODB] Invalid amount to set:", amount);
            return null;
        }

        const currency = await Currency.findOneAndUpdate(
            { userID },
            { 
                $set: { 
                    money: parsedAmount,
                    updatedAt: new Date() 
                } 
            },
            { new: true }
        );

        console.log(`✅ [MONGODB] Set balance for ${userID} to ${parsedAmount}`);
        return currency.money;
    } catch (e) {
        console.error("❌ [MONGODB] Error in setBalance:", e);
        return null;
    }
}

// ✅ دالة جديدة: إضافة خبرة
async function addExp(userID, amount) {
    try {
        await ensureUser(userID);
        const parsedAmount = Number(amount);
        
        if (isNaN(parsedAmount) || parsedAmount < 0) {
            console.error("❌ [MONGODB] Invalid exp amount:", amount);
            return null;
        }

        const currency = await Currency.findOneAndUpdate(
            { userID },
            { 
                $inc: { exp: parsedAmount }, 
                $set: { updatedAt: new Date() } 
            },
            { upsert: true, new: true }
        );
        
        console.log(`✅ [MONGODB] Added ${parsedAmount} exp to ${userID}. Total exp: ${currency.exp}`);
        return currency.exp;
    } catch (e) {
        console.error("❌ [MONGODB] Error in addExp:", e);
        return null;
    }
}

// ✅ دالة جديدة: جلب ترتيب الأغنياء (Top Rich)
async function getTopRich(limit = 10) {
    try {
        const topUsers = await Currency.find({})
            .sort({ money: -1 })
            .limit(limit)
            .select('userID money');
        
        return topUsers;
    } catch (e) {
        console.error("❌ [MONGODB] Error in getTopRich:", e);
        return [];
    }
}

module.exports = { 
    User, 
    Currency, 
    ensureUser, 
    addMoney, 
    removeMoney,
    hasSufficientBalance,
    transferMoney,
    getUserData,
    getBalance,
    setBalance,
    addExp,
    getTopRich
};
