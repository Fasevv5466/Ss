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
// 🛠️ الدوال المساعدة المطورة (المصححة)
// ==============================

async function ensureUser(userID) {
    try {
        await User.findOneAndUpdate({ userID }, { $setOnInsert: { userID } }, { upsert: true });
        await Currency.findOneAndUpdate({ userID }, { $setOnInsert: { userID } }, { upsert: true });
    } catch (e) {
        console.error("Error in ensureUser:", e);
    }
}

async function addMoney(userID, amount) {
    const currency = await Currency.findOneAndUpdate(
        { userID },
        { $inc: { money: Math.abs(Number(amount)) }, $set: { updatedAt: new Date() } },
        { upsert: true, new: true }
    );
    return currency.money;
}

// ✅ دالة الخصم المصححة 100%
async function removeMoney(userID, amount) {
    try {
        const amt = Math.abs(Number(amount)); // التأكد أنه رقم موجب للخصم
        const currency = await Currency.findOneAndUpdate(
            { userID, money: { $gte: amt } }, // شرط: يجب أن يكون الرصيد أكبر أو يساوي المبلغ
            { 
                $inc: { money: -amt }, 
                $set: { updatedAt: new Date() } 
            },
            { new: true }
        );

        // إذا لم يجد مستخدم برصيد كافٍ، نخصم المتاح أو نرجع الرصيد الحالي
        if (!currency) {
            const current = await Currency.findOne({ userID });
            return current ? current.money : 0;
        }
        
        return currency.money;
    } catch (e) {
        console.error("Error in removeMoney:", e);
        return 0;
    }
}

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
