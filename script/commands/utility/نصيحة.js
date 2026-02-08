module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    const advice = [
        "النجاح هو الانتقال من فشل إلى فشل دون فقدان الحماس",
        "لا تقارن نفسك بالآخرين، قارن نفسك بمن كنت بالأمس",
        "السعادة ليست وجهة بل رحلة",
        "الوقت كالسيف إن لم تقطعه قطعك",
        "من جد وجد ومن زرع حصد",
        "الصبر مفتاح الفرج",
        "اعمل لدنياك كأنك تعيش أبداً",
        "أفضل وقت لزراعة شجرة كان منذ 20 عاماً، ثاني أفضل وقت هو الآن"
    ];
    
    const randomAdvice = advice[Math.floor(Math.random() * advice.length)];
    
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n${randomAdvice}`, threadID, messageID);
};

module.exports.config = {
    name: "نصيحة",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "نصيحة عشوائية",
    commandCategory: "utility",
    usages: "نصيحة",
    cooldowns: 5
};
