// ═══════════════════════════════════════════════════════════
// 👑 KIRA - الاوامر
// المطور: Ayman ♛
// الوصف: عرض قائمة الأوامر والمعلومات
// ═══════════════════════════════════════════════════════════

module.exports.config = {
	name: "الاوامر",
  aliases: [],
	version: "1.1.1",
	hasPermssion: 0,
	credits: "Ayman ♛", // تم التعديل بواسطة تاو تاو
	description: "عرض قائمة الأوامر والمعلومات",
	commandCategory: "utility",
	usages: "[اسم الأمر]",
	cooldowns: 5
};

module.exports.languages = {
	"ar": {},
	"en": {}
}

module.exports.run = async function({
	api,
	event,
	args,
	Currencies,
	__GLOBAL
}) {
	const { events } = global.client;
	const time = process.uptime(),
		hours = Math.floor(time / (60 * 60)),
		minutes = Math.floor((time % (60 * 60)) / 60),
		seconds = Math.floor(time % 60);

	const moment = require("moment-timezone");
	const timeNow = moment.tz("Asia/Riyadh").format("DD/MM/YYYY || HH:mm:ss");

	const { commands } = global.client;
	const {
		threadID: tid,
		messageID: mid,
		senderID: sid
	} = event;

	let msg = "", array = [], i = 0;
	const cmds = global.client.commands;
	const TIDdata = global.data.threadData.get(tid) || {};
	const prefix = TIDdata.PREFIX || global.config.PREFIX;

	// Function to display permission levels in a readable format
	function TextPr(permission) {
		return permission === 0 ? "User" : permission === 1 ? "Moderator" : "Admin";
	}

	if (!args[0]) { // عند عدم وجود حجة، عرض جميع الأوامر
		for (const cmd of cmds.values()) {
			msg += `💞${++i}. ${cmd.config.name}: ${cmd.config.description}\n`;
		}
		return api.sendMessage(msg, tid, mid);
	}

	let type = args[0].toLowerCase();
	for (const cmd of cmds.values()) {
		array.push(cmd.config.name.toString());
	}

	if (!array.includes(type)) {
		const stringSimilarity = require('string-similarity');
		const checker = stringSimilarity.findBestMatch(type, array);
		const closestMatch = checker.bestMatch.rating >= 0.5 ? checker.bestMatch.target : null;

		msg = `=== 『 المساعدة 』 ===\n━━━━━━━━━━━━━━━━\n[⚜️] ➜ لم يتم العثور على الأمر '${type}' في النظام.\n`;
		if (closestMatch) msg += `[⚜️] ➜ الأمر الأقرب هو '${closestMatch}'`;
		return api.sendMessage(msg, tid, mid);
	}

	const cmd = cmds.get(type).config;
	msg = `[🧸] ➜ الاسم: ${cmd.name} ( ${cmd.version} )\n[🔗] ➜ الصلاحية: ${TextPr(cmd.hasPermssion)}\n[👤] ➜ المؤلف: ${cmd.credits}\n[💬] ➜ الوصف: ${cmd.description}\n[⏳] ➜ وقت التبريد: ${cmd.cooldowns} ثانية\n[📅] ➜ الوقت الآن: ${timeNow}\n`;
	return api.sendMessage(msg, tid, mid);
}
