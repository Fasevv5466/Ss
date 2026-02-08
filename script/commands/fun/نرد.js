module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    const dice = Math.floor(Math.random() * 6) + 1;
    const diceEmoji = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][dice - 1];
    
    return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\n${diceEmoji}\n\nالنتيجة: ${dice}`, threadID, messageID);
};

module.exports.config = {
    name: "نرد",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "رمي حجر نرد",
    commandCategory: "fun",
    usages: "نرد",
    cooldowns: 3
};
