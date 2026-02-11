// ==========================================
// ملف إدارة قاعدة بيانات MongoDB - بوت Kira المطور v2.5
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
    exp: { type: Number, default: 0, min: 0 },
    level: { type: Number, default: 1, min: 1 },
    messageCount: { type: Number, default: 0, min: 0 },
    lastMessage: { type: Date, default: null }, // آخر رسالة
    streak: { type: Number, default: 0 }, // سلسلة الأيام المتتالية
    lastDaily: { type: Date, default: null }, // آخر مكافأة يومية
    rank: { type: String, default: "مبتدئ" }, // الرتبة الحالية
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Currency = mongoose.model("Currency", currencySchema);

// ==============================
// 🛠️ الدوال المساعدة المطورة
// ==============================

// نظام الرتب المحسّن
const RANKS = [
    { level: 1, name: "مبتدئ", emoji: "🔰", minExp: 0 },
    { level: 5, name: "محارب", emoji: "⚔️", minExp: 100 },
    { level: 10, name: "فارس", emoji: "🛡️", minExp: 400 },
    { level: 15, name: "نخبة", emoji: "💎", minExp: 900 },
    { level: 20, name: "بطل", emoji: "👑", minExp: 1600 },
    { level: 30, name: "أسطورة", emoji: "⚡", minExp: 3600 },
    { level: 40, name: "ملك", emoji: "🔱", minExp: 6400 },
    { level: 50, name: "إمبراطور", emoji: "🌟", minExp: 10000 },
    { level: 75, name: "إله", emoji: "🔥", minExp: 22500 },
    { level: 100, name: "خالد", emoji: "😈", minExp: 40000 }
];

// حساب المستوى بناءً على الخبرة - معادلة محسّنة
const calculateLevel = (exp) => {
    // معادلة أسرع في البداية وأبطأ في المستويات العالية
    return Math.floor(Math.pow(exp / 40, 0.55)) + 1;
};

// حساب الرتبة بناءً على المستوى
const calculateRank = (level) => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (level >= RANKS[i].level) {
            return RANKS[i];
        }
    }
    return RANKS[0];
};

// حساب XP المطلوب للمستوى التالي
const getExpForNextLevel = (currentLevel) => {
    return Math.floor(Math.pow((currentLevel) * 40, 1 / 0.55));
};

// حساب نسبة التقدم
const getProgress = (currentExp, currentLevel) => {
    const currentLevelExp = Math.floor(Math.pow((currentLevel - 1) * 40, 1 / 0.55));
    const nextLevelExp = getExpForNextLevel(currentLevel);
    const progress = ((currentExp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.min(Math.max(progress, 0), 100);
};

async function ensureUser(userID) {
    try {
        let user = await User.findOneAndUpdate(
            { userID }, 
            { $setOnInsert: { userID } }, 
            { upsert: true, new: true }
        );
        let currency = await Currency.findOneAndUpdate(
            { userID }, 
            { 
                $setOnInsert: { 
                    userID, 
                    money: 0, 
                    exp: 0, 
                    level: 1, 
                    messageCount: 0,
                    streak: 0,
                    rank: "مبتدئ"
                } 
            }, 
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
        if (!current) return { success: false, newBalance: 0 };

        if (current.money < parsedAmount) {
            return { success: false, newBalance: current.money, error: "insufficient_funds" };
        }

        const newBalance = current.money - parsedAmount;
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

// ✅ إضافة خبرة (XP) محسّنة مع حساب تلقائي للمستوى والرتبة
async function addExp(userID, amount = 2) {
    try {
        await ensureUser(userID);
        const expToAdd = Number(amount);
        
        // جلب البيانات الحالية
        const currentData = await Currency.findOne({ userID });
        const oldExp = currentData.exp || 0;
        const oldLevel = currentData.level || 1;
        
        const newExp = oldExp + expToAdd;
        const newLevel = calculateLevel(newExp);
        const newRank = calculateRank(newLevel);
        const isLevelUp = newLevel > oldLevel;
        
        // مكافأة Level Up
        let bonusMoney = 0;
        if (isLevelUp) {
            bonusMoney = newLevel * 100; // 100$ لكل مستوى
        }

        const currency = await Currency.findOneAndUpdate(
            { userID },
            { 
                $inc: { 
                    exp: expToAdd, 
                    messageCount: 1,
                    money: bonusMoney 
                }, 
                $set: { 
                    level: newLevel,
                    rank: newRank.name,
                    lastMessage: new Date(),
                    updatedAt: new Date() 
                } 
            },
            { upsert: true, new: true }
        );
        
        return {
            exp: currency.exp,
            level: currency.level,
            rank: newRank,
            isLevelUp: isLevelUp,
            oldLevel: oldLevel,
            messageCount: currency.messageCount,
            bonusMoney: bonusMoney
        };
    } catch (e) {
        console.error("❌ [MONGODB] Error in addExp:", e);
        return null;
    }
}

// جلب بيانات المستخدم كاملة مع حسابات إضافية
async function getUserData(userID) {
    try {
        await ensureUser(userID);
        const user = await User.findOne({ userID });
        const currency = await Currency.findOne({ userID });
        
        // حسابات إضافية
        const rank = calculateRank(currency.level);
        const nextLevelExp = getExpForNextLevel(currency.level);
        const progress = getProgress(currency.exp, currency.level);
        
        return { 
            user, 
            currency,
            calculated: {
                rank,
                nextLevelExp,
                progress,
                expNeeded: nextLevelExp - currency.exp
            }
        };
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

// التحقق من المكافأة اليومية
async function canClaimDaily(userID) {
    try {
        const currency = await Currency.findOne({ userID });
        if (!currency || !currency.lastDaily) return true;
        
        const now = new Date();
        const lastDaily = new Date(currency.lastDaily);
        const hoursDiff = (now - lastDaily) / (1000 * 60 * 60);
        
        return hoursDiff >= 24;
    } catch (e) {
        return true;
    }
}

// المكافأة اليومية
async function claimDaily(userID) {
    try {
        await ensureUser(userID);
        const canClaim = await canClaimDaily(userID);
        
        if (!canClaim) {
            return { success: false, error: "already_claimed" };
        }
        
        const currency = await Currency.findOne({ userID });
        const baseReward = 1000;
        const streakBonus = (currency.streak || 0) * 100;
        const totalReward = baseReward + streakBonus;
        
        const updated = await Currency.findOneAndUpdate(
            { userID },
            { 
                $inc: { 
                    money: totalReward,
                    streak: 1
                },
                $set: {
                    lastDaily: new Date(),
                    updatedAt: new Date()
                }
            },
            { new: true }
        );
        
        return {
            success: true,
            reward: totalReward,
            streak: updated.streak,
            newBalance: updated.money
        };
    } catch (e) {
        console.error("❌ [MONGODB] Error in claimDaily:", e);
        return null;
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
    calculateLevel,
    calculateRank,
    getExpForNextLevel,
    getProgress,
    canClaimDaily,
    claimDaily,
    RANKS
};
