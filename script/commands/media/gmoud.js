// ═══════════════════════════════════════════════════════════
// 👑 KIRA - غموض
// المطور: Ayman ♛
// الوصف: يقترحلك افلام عشوائية
// ═══════════════════════════════════════════════════════════

module.exports.config = {
	name: "غموض",
  aliases: [],
	version: "1.1.2",
	hasPermssion: 0,
	credits: "Ayman ♛",
	description: "يقترحلك افلام عشوائية",
	commandCategory: "media",
	usages: "ا",
	cooldowns: 1,
};
module.exports.handleEvent = function ({ api, event }) {
	const { commands } = global.client;
	
	if (!event.body) return;

	const { threadID, messageID, body } = event;

	if (body.indexOf("askme") != 0) return;

	const splitBody = body.slice(body.indexOf("askme")).trim().split(/\s+/);


	if (splitBody.length == 1 || !commands.has(splitBody[1].toLowerCase())) return;

	const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
	const command = commands.get(splitBody[1].toLowerCase());

	const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;

	return api.sendMessage(`⚔️ ${command.config.name} ⚔️\n${command.config.description}\n\n❯ Cách sử dụng: ${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}\n❯ Thuộc nhóm: ${command.config.commandCategory}\n❯ Thời gian chờ: ${command.config.cooldowns} giây(s)\n❯ Quyền hạn: ${((command.config.hasPermssion == 0) ? "Người dùng" : (command.config.hasPermssion == 1) ? "Quản trị viên" : "Người vận hành bot" )}\n❯ Prefix: ${prefix}\n\n» Module code by ${command.config.credits} «`, threadID, messageID);
};

module.exports.run = async function({ api, args, Users, event, Threads, utils, client }) {
const { commands } = global.client;
const { threadID, messageID } = event;
const command = commands.get((args[0] || "").toLowerCase());
const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
if (!command) {
const command = commands.values();
var tl = [,"Murder on The Orient Express","The Game","Identity","The Fugitive" ,"Clue","Knives Out" ,"L.A. Confidential","The Hateful Eight" ,"Rear Window","Shutter Island" ,"ZODIAC","Memories of Murder" ,"The Girl With The Dragon Tattoo","Primal Fear" ,"Gone Girl","Mystic River" ,"The Usual Suspects","Prisoners" ,"Seven","Memento" ,"The Bone Collector","Kiss The Girls" ,"Searching","Sherlock Holmes","basic instinct","The Secret in Their Eyes","Basic Instinct" ,"witness","Witness","The Silence of the lambs" ,"Hannibal","Red Dragon","ماكو افلام عزلنة !","Seven","Shutter island","2001:A space","OdysseEnemy","Inception","The maze","runner","Now you see me","Fight club","Knives out","The father","The Truman show","Get out","Gone gril","The invisible man","Memento","Nightcrawler","Prisoners","Arrial","Brightburn","A monster call","Confession","Spilt","Shutter island","Ready or not","Tomorrow land"
];
var tle = tl[Math.floor(Math.random() * tl.length)];
var lon = `[👀] اقتراحي مشان عيونك :

${tle}`;
return api.sendMessage(lon, event.threadID, event.messageID);
}
const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;
return api.sendMessage(`⚔️ ${command.config.name} ⚔️\n${command.config.description}\n\n❯ Cách sử dụng: ${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}\n❯ Thuộc nhóm: ${command.config.commandCategory}\n❯ Thời gian chờ: ${command.config.cooldowns} giây(s)\n❯ Quyền hạn: ${((command.config.hasPermssion == 0) ? "Người dùng" : (command.config.hasPermssion == 1) ? "Quản trị viên" : "Người vận hành bot" )}\n❯ Prefix: ${prefix}\n\n» Module code by ${command.config.credits} «`, threadID, messageID);
};