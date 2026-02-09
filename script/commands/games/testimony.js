// داخل أي أمر من أوامر الألعاب
const { addMoney, removeMoney, getUserData } = require("../../includes/mongodb");

module.exports.config = {
  name: "testmoney",
  version: "1.0",
  hasPermssion: 0,
  description: "اختبار الرصيد",
  commandCategory: "game",
  usages: "testmoney",
};

module.exports.run = async function({ api, event }) {
    const userID = event.senderID;

    // إضافة 500
    const afterAdd = await addMoney(userID, 500);

    // خصم 100
    const afterRemove = await removeMoney(userID, 100);

    // استرجاع كامل البيانات
    const { user, currency } = await getUserData(userID);

    // إرسال رسالة للمستخدم
    api.sendMessage(`💰 رصيدك النهائي: ${currency.money}\nEXP: ${currency.exp}`, event.threadID);
};
