module.exports.config = {
    name: "تصويت",
    version: "2.0.0",
    hasPermssion: 1,
    credits: "ايمن",
    description: "إنشاء تصويت",
    commandCategory: "admin",
    usages: "تصويت [السؤال] | تصويت نعم/لا/نتائج",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args, Users, Threads, Currencies, models }) {
        const { threadID, messageID, senderID } = event;
        
        if (!global.polls[threadID]) {
            const question = args.join(" ");
            if (!question) {
                return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nاكتب سؤال التصويت", threadID, messageID);
            }
            
            global.polls[threadID] = {
                question: question,
                votes: { yes: 0, no: 0 },
                voters: []
            };
            
            return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nتصويت: ${question}\n\nللتصويت:\n• تصويت نعم\n• تصويت لا\n• تصويت نتائج`, threadID, messageID);
        }
        
        const poll = global.polls[threadID];
        const vote = args[0]?.toLowerCase();
        
        if (vote === "نتائج") {
            const total = poll.votes.yes + poll.votes.no;
            const yesPercent = total > 0 ? Math.round((poll.votes.yes / total) * 100) : 0;
            const noPercent = total > 0 ? Math.round((poll.votes.no / total) * 100) : 0;
            
            return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\n${poll.question}\n\nنعم: ${poll.votes.yes} (${yesPercent}%)\nلا: ${poll.votes.no} (${noPercent}%)\n\nإجمالي الأصوات: ${total}`, threadID, messageID);
        }
        
        if (poll.voters.includes(senderID)) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nلقد صوت مسبقاً", threadID, messageID);
        }
        
        if (vote === "نعم") {
            poll.votes.yes++;
            poll.voters.push(senderID);
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nتم تسجيل صوتك: نعم", threadID, messageID);
        }
        
        if (vote === "لا") {
            poll.votes.no++;
            poll.voters.push(senderID);
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nتم تسجيل صوتك: لا", threadID, messageID);
        }
        
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 ADMIN ━━ ⌬\n\nاستخدم: تصويت نعم/لا/نتائج", threadID, messageID);
};
