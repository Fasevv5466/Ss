// ==========================================
// ملف إدارة قاعدة بيانات MongoDB - بوت Kira
// ==========================================
const mongoose = require("mongoose");

// رابط الاتصال بقاعدتك (تأكد من حمايته لاحقاً)
const MONGO_URI = "mongodb+srv://kkayman200_db_user:ukhzlLzjRxQgSnTl@cluster0.7nsuoil.mongodb.net/KiraDB?retryWrites=true&w=majority";

// الاتصال بالقاعدة مع إعدادات الاستقرار
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ [MONGODB] Connected successfully to KiraDB"))
.catch(err => console.error("❌ [MONGODB] Connection error:", err));

// ==============================
// 1️⃣ إنشاء الـ Schemas
// ==============================
const { Schema } = mongoose;

const userSchema = new Schema({
    userID: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now }
});

const currencySchema = new Schema({
    userID: { type: String, required: true, unique: true },
    money: { type: Number, default: 0 },
    exp: { type: Number, default: 0 },
    data: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// إنشاء الموديلات
const User = mongoose.model("User", userSchema);
const Currency = mongoose.model("Currency", currencySchema);

// ==============================
// 2️⃣ الدوال المساعدة (Exports)
// ==============================

// التأكد من وجود المستخدم أو إنشائه تلقائياً
async function ensureUser(userID) {
    try {
        let user = await User.findOne({ userID });
        if (!user) {
            user = new User({ userID });
            await user.save();
        }
        let currency = await Currency.findOne({ userID });
        if (!currency) {
            currency = new Currency({ userID });
            await currency.save();
        }
        return { user, currency };
    } catch (e) {
        console.error("Error in ensureUser:", e);
    }
}

// إضافة رصيد للمستخدم
async function addMoney(userID, amount) {
    await ensureUser(userID);
    const currency = await Currency.findOne({ userID });
    currency.money += Number(amount);
    currency.updatedAt = new Date();
    await currency.save();
    return currency.money;
}

// خصم رصيد من المستخدم
async function removeMoney(userID, amount) {
    await ensureUser(userID);
    const currency = await Currency.findOne({ userID });
    currency.money = Math.max(0, currency.money - Number(amount));
    currency.updatedAt = new Date();
    await currency.save();
    return currency.money;
}

// جلب بيانات المستخدم كاملة
async function getUserData(userID) {
    await ensureUser(userID);
    const user = await User.findOne({ userID });
    const currency = await Currency.findOne({ userID });
    return { user, currency };
}

// ==========================================
// 3️⃣ تصدير الدوال للاستخدام في الأوامر 🚀
// ==========================================
// هذا السطر هو الأهم لكي تعمل الأوامر بدون أخطاء
module.exports = { 
    User, 
    Currency, 
    ensureUser, 
    addMoney, 
    removeMoney, 
    getUserData 
};
