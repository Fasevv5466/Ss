module.exports.config = {
    name: "رعب",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "يقترحلك افلام عشوائية",
    commandCategory: "ai",
    usages: "ا",
    cooldowns: 1
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, args, Users, event, Threads, utils, client }) {
    const { commands } = global.client;
    const { threadID, messageID } = event;
    const command = commands.get((args[0] || "").toLowerCase());
    const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
    if (!command) {
    const command = commands.values();
    var tl = ["Scream • 2022","The Conjuring • 2013","The Shining • 1980","Misery • 1990","The Exorcist • 1973","The Mist • 2007","Friday the 13TH • 2009","A Nightmare on Elm Street • 1984","عزلنه !","Chainsaw Massacre • 2022","The Rings • 2002","A quiet place • 2018","Jigsaw • 2017","IT • 2017","Child's Play • 1988","Slender Man • 2018","Brightburn • 2019","The purge • 2013","The purg 2 • 2016","Happy death day • 2017","A quiet place 2 • 2020","wrong turn • 2003","predator • 2010","Bird box • 2018","Greenland • 2020","My name is Anna • 2018","Happy death day • 2019"];
    var tle = tl[Math.floor(Math.random() * tl.length)];
    var lon = ` [💆] ذوقي عمك جرب:
    
    ${tle}`;
    return api.sendMessage(lon, event.threadID, event.messageID);
    }
    const prefix = (threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : global.config.PREFIX;
    return api.sendMessage(`⚔️ ${command.config.name} ⚔️\n${command.config.description}\n\n❯ Cách sử dụng: ${prefix}${command.config.name} ${(command.config.usages) ? command.config.usages : ""}\n❯ Thuộc nhóm: ${command.config.commandCategory}\n❯ Thời gian chờ: ${command.config.cooldowns} giây(s)\n❯ Quyền hạn: ${((command.config.hasPermssion == 0) ? "Người dùng" : (command.config.hasPermssion == 1) ? "Quản trị viên" : "Người vận hành bot" )}\n❯ Prefix: ${prefix}\n\n» Module code by ${command.config.credits} «`, threadID, messageID);
};
