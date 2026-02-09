// ==============================
// 1️⃣ الاتصال بـ MongoDB
// ==============================
const mongoose = require("mongoose");

const MONGO_URI = "mongodb+srv://kkayman200_db_user:ukhzlLzjRxQgSnTl@cluster0.7nsuoil.mongodb.net/KiraDB?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// ==============================
// 2️⃣ إنشاء الـ Schemas
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

// ==============================
// 3️⃣ إنشاء الموديلات
// ==============================
const User = mongoose.model("User", userSchema);
const Currency = mongoose.model("Currency", currencySchema);

// ==============================
// 4️⃣ دوال مساعدة لإدارة المستخدمين
// ==============================
async function ensureUser(userID) {
    let user = await User.findOne({ userID });
    if (!user) {
        user = new User({ userID });
        await user.save();
        console.log(`➕ User created: ${userID}`);
    }
    let currency = await Currency.findOne({ userID });
    if (!currency) {
        currency = new Currency({ userID });
        await currency.save();
        console.log(`💰 Currency record created: ${userID}`);
    }
    return { user, currency };
}

// ==============================
// 5️⃣ مثال: إضافة رصيد
// ==============================
async function addMoney(userID, amount) {
    await ensureUser(userID);
    const currency = await Currency.findOne({ userID });
    currency.money += amount;
    currency.updatedAt = new Date();
    await currency.save();
    return currency.money;
}

// ==============================
// 6️⃣ مثال: خصم رصيد
// ==============================
async function removeMoney(userID, amount) {
    await ensureUser(userID);
    const currency = await Currency.findOne({ userID });
    currency.money = Math.max(0, currency.money - amount);
    currency.updatedAt = new Date();
    await currency.save();
    return currency.money;
}

// ==============================
// 7️⃣ مثال: استرجاع بيانات المستخدم
// ==============================
async function getUserData(userID) {
    await ensureUser(userID);
    const user = await User.findOne({ userID });
    const currency = await Currency.findOne({ userID });
    return { user, currency };
}

// ==============================
// 8️⃣ اختبار سريع
// ==============================
(async () => {
    const userID = "61577861540407";
    
    console.log(await addMoney(userID, 500));   // ➕ إضافة
    console.log(await removeMoney(userID, 100)); // ➖ خصم
    console.log(await getUserData(userID));      // بيانات كاملة
})();
