// ═══════════════════════════════════════════════════════════
// 👑 KIRA - نيم
// المطور: Ayman ♛
// الوصف: قم بتغيير لقبك في مجموعتك أو الشخص الذي تضع علامة عليه
// ═══════════════════════════════════════════════════════════

 module.exports.config = {
	name: "نيم",
  aliases: [],
	version: "1.0.0",
	hasPermssion: 0,
	credits: "Ayman ♛",
	description: "قم بتغيير لقبك في مجموعتك أو الشخص الذي تضع علامة عليه",
	commandCategory: "utility",
	usages: "",
	cooldowns: 3
};

module.exports.run = async function({ api, event, args }) {
	const name = args.join(" ")
	const mention = Object.keys(event.mentions)[0];
	if (!mention) return api.changeNickname(`${name}`, event.threadID, event.senderID);
	if (mention[0]) return api.changeNickname(`${name.replace(event.mentions[mention], "")}`, event.threadID, mention);
}
