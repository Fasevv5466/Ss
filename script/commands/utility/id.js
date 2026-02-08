// ═══════════════════════════════════════════════════════════
// 👑 KIRA - تيد
// المطور: Ayman ♛
// الوصف: ايدي الكروب
// ═══════════════════════════════════════════════════════════

module.exports.config = {
	name: "تيد",
  aliases: [],
	version: "1.0.0", 
	hasPermssion: 0,
	credits: "Ayman ♛",
	description: "ايدي الكروب", 
	commandCategory: "utility",
	usages: "ا",
	cooldowns: 5, 
	dependencies: '',
};

module.exports.run = async function({ api, event }) {
  api.sendMessage(event.threadID, event.threadID);
};
