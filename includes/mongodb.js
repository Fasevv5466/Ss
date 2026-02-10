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
    money: { type: Number, default: 0, min: 0 },
    exp: { type: Number, default: 0 },
    level: { type: Number, default: 1 }, // نظام المستويات
    messageCount: { type: Number, default: 0 }, // نظام عد الرسائل
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Currency = mongoose.model("Currency", currencySchema);

// ==============================
// 🛠️ الدوال المساعدة المطورة
// ==============================

// حساب المستوى بناءً على الخبرة (معادلة مخصصة لـ KIRA)
const calculateLevel = (exp) => Math.floor(0.1 * Math.sqrt(exp)) + 1;

async function ensureUser(userID) {
    try {
        let user = await User.findOneAndUpdate(
            { userID }, 
            { $setOnInsert: { userID } }, 
            { upsert: true, new: true }
        );
        let currency = await Currency.findOneAndUpdate(
            { userID }, 
            { $setOnInsert: { userID, money: 0, exp: 0, level: 1, messageCount: 0 } }, 
            { upsert: true, new: true }
        );
        return { user, currency };
    } catch (e) {
        console.error("❌ [MONGODB] Error in ensureUser:", e);
        return null;
    }
}

// إضافة رصيد
async function addMoney(userID, amount) {
    try {
        await ensureUser(userID);
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount < 0) return null;

        const currency = await Currency.findOneAndUpdate(
            { userID },
            { $inc: { money: parsedAmount }, $set: { updatedAt: new Date() } },
            { upsert: true, new: true }
        );
        return currency.money;
    } catch (e) {
        console.error("❌ [MONGODB] Error in addMoney:", e);
        return null;
    }
}

// خصم رصيد
async function removeMoney(userID, amount) {
    try {
        await ensureUser(userID);
        const parsedAmount = Number(amount);
        if (isNaN(parsedAmount) || parsedAmount < 0) return null;

        const current = await Currency.findOne({ userID });
        if (!current) return 0;

        const newBalance = Math.max(0, (current.money || 0) - parsedAmount);
        const currency = await Currency.findOneAndUpdate(
            { userID },
            { $set: { money: newBalance, updatedAt: new Date() } },
            { new: true }
        );

        return { success: true, newBalance: currency.money };
    } catch (e) {
        console.error("❌ [MONGODB] Error in removeMoney:", e);
        return null;
    }
}

// ✅ إضافة خبرة (XP) + تحديث المستوى + زيادة عداد الرسائل
async function addExp(userID, amount = 1) {
    try {
        await ensureUser(userID);
        const expToAdd = Number(amount);
        
        // جلب البيانات الحالية
        const currentData = await Currency.findOne({ userID });
        const newExp = (currentData.exp || 0) + expToAdd;
        const newLevel = calculateLevel(newExp);
        const isLevelUp = newLevel > (currentData.level || 1);

        const currency = await Currency.findOneAndUpdate(
            { userID },
            { 
                $inc: { exp: expToAdd, messageCount: 1 }, 
                $set: { level: newLevel, updatedAt: new Date() } 
            },
            { upsert: true, new: true }
        );
        
        return {
            exp: currency.exp,
            level: currency.level,
            isLevelUp: isLevelUp,
            messageCount: currency.messageCount
        };
    } catch (e) {
        console.error("❌ [MONGODB] Error in addExp:", e);
        return null;
    }
}

// جلب بيانات المستخدم كاملة
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

// جلب ترتيب الأغنياء أو أعلى المستويات
async function getTop(type = "money", limit = 10) {
    try {
        const sortObj = {};
        sortObj[type] = -1;
        return await Currency.find({}).sort(sortObj).limit(limit);
    } catch (e) {
        console.error("❌ [MONGODB] Error in getTop:", e);
        return [];
    }
}

module.exports = { 
    User, 
    Currency, 
    ensureUser, 
    addMoney, 
    removeMoney,
    getUserData,
    addExp,
    getTop,
    calculateLevel
};
