// ═══════════════════════════════════════════════════════════
// 👑 KIRA - يلابراا
// المطور: Ayman ♛
// الوصف: مو شغلك 😇
// ═══════════════════════════════════════════════════════════

module.exports.config = {
    name: "يلابراا",
  aliases: [],
    version: "1.0.0",
    hasPermssion: 2,
    credits: "Ayman ♛",
    description: "مو شغلك 😇",
    commandCategory: "developer",
    usages: "غادري [ايدي الكروب]",
    cooldowns: 10,
};

module.exports.run = async function({ api, event, args }) {
    const permission =
    [`100081570534647`,`100092660149039`]
    if (!permission.includes(event.senderID)) return api.sendMessage("مش لك", event.threadID, event.messageID);
        if (!args[0]) return api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
        if (!isNaN(args[0])) return api.removeUserFromGroup(api.getCurrentUserID(), args.join(" "));
                                                                                              }
