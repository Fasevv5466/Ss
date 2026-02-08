module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    const expression = args.join(" ");
    if (!expression) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nاكتب العملية الحسابية\nمثال: حساب 5 + 3", threadID, messageID);
    }
    
    try {
        const result = eval(expression.replace(/[^-()\d/*+.]/g, ''));
        
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n${expression} = ${result}`, threadID, messageID);
    } catch (error) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nعملية حسابية خاطئة", threadID, messageID);
    }
};

module.exports.config = {
    name: "حساب",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "آلة حاسبة",
    commandCategory: "utility",
    usages: "حساب [العملية]",
    cooldowns: 3
};
