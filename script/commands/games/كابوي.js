module.exports.config = {
    name: "كابوي",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "كابوي - لعبة راعي البقر",
    commandCategory: "games",
    usages: "ا",
    cooldowns: 0
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    var i, w;
            i = (await Currencies.getData(senderID)) || {};
            w = i.money || 0
            if (w < parseInt(maxMoney)) return false;
            else return true;
};
