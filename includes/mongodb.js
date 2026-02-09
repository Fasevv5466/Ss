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
    money: { type: Number, default: 0 },
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
            { $setOnInsert: { userID } }, 
            { upsert: true, new: true }
        );
        return { user, currency };
    } catch (e) {
        console.error("Error in ensureUser:", e);
    }
}

// إضافة رصيد (باستخدام التحديث المباشر $inc)
async function addMoney(userID, amount) {
    const currency = await Currency.findOneAndUpdate(
        { userID },
        { 
            $inc: { money: Number(amount) }, 
            $set: { updatedAt: new Date() } 
        },
        { upsert: true, new: true }
    );
    return currency.money;
}

// خصم رصيد (مع ضمان عدم النزول تحت الصفر)
async function removeMoney(userID, amount) {
    const current = await Currency.findOne({ userID });
    const deduct = (current && current.money < amount) ? current.money : amount;
    
    const currency = await Currency.findOneAndUpdate(
        { userID },
        { 
            $inc: { money: -Number(deduct) }, 
            $set: { updatedAt: new Date() } 
        },
        { upsert: true, new: true }
    );
    return currency.money;
}

// جلب بيانات المستخدم
async function getUserData(userID) {
    await ensureUser(userID);
    const user = await User.findOne({ userID });
    const currency = await Currency.findOne({ userID });
    return { user, currency };
}

module.exports = { 
    User, 
    Currency, 
    ensureUser, 
    addMoney, 
    removeMoney, 
    getUserData 
};
