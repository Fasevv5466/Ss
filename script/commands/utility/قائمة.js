module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID } = event;
    
    try {
        const threadInfo = await api.getThreadInfo(threadID);
        const participantIDs = threadInfo.participantIDs;
        
        const balances = [];
        for (const userID of participantIDs) {
            const balance = await Currencies.getData(userID);
            const name = await Users.getNameUser(userID);
            balances.push({
                name: name,
                money: balance ? balance.money : 0
            });
        }
        
        balances.sort((a, b) => b.money - a.money);
        
        let message = "⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nقائمة الأغنى في المجموعة:\n\n";
        
        for (let i = 0; i < Math.min(10, balances.length); i++) {
            const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i+1}.`;
            message += `${medal} ${balances[i].name}\n${balances[i].money.toLocaleString()} دولار\n\n`;
        }
        
        return api.sendMessage(message, threadID, messageID);
        
    } catch (error) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nفشل جلب القائمة", threadID, messageID);
    }
};

module.exports.config = {
    name: "قائمة",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "قائمة الأغنى في المجموعة",
    commandCategory: "utility",
    usages: "قائمة",
    cooldowns: 10
};
