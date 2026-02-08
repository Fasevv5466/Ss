// ═══════════════════════════════════════════════════════════
// 👑 KIRA - رؤية
// المطور: Ayman ♛
// الوصف: 
// ═══════════════════════════════════════════════════════════

module.exports.config = {
	name: "رؤية",
  aliases: [],
	version: "1.0.0",
	hasPermssion: 2,
	credits: "Ayman ♛",
	description: "",
	prefix: false,
		commandCategory: "utility",
  usages: "",
	cooldowns: 0
};

module.exports.handleEvent = async ({ api, event, args }) => {
    api.markAsReadAll(() => {});
};

module.exports.run = async function({}) {}