const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "joinNoti",
    eventType: ["log:subscribe"],
    version: "5.3.0",
    credits: "KIRA System",
    description: "ترحيب مزخرف ومختصر جداً",
    category: "events"
};

module.exports.run = async function({ api, event, Users }) {
    const { threadID, logMessageData, author } = event;

    if (logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔  ━━ ⌬\n✅ تم الاتصال بنجاح!`, threadID);
    }

    try {
        const newMembers = logMessageData.addedParticipants;
        const adderData = await Users.getData(author);
        const adderName = adderData?.name || "رابط دعوة";

        const gifs = [
            "https://media.giphy.com/media/10N247rib4BlVC/giphy.gif",
            "https://media.giphy.com/media/MdLFOyVZtoUPm/giphy.gif",
            "https://media.giphy.com/media/bqSkJ4IwNcoZG/giphy.gif"
        ];
        const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

        let mentions = [];
        let names = "";
        newMembers.forEach(m => {
            mentions.push({ tag: m.fullName, id: m.userFbId });
            names += `${m.fullName}، `;
        });

        // الرسالة المزخرفة والمختصرة
        const msg = `⌬ ━━ 𝗞𝗜𝗥𝗔  ━━ ⌬\n` +
                    `👋 أهلاً: {names}\n` +
                    `💫 بواسطة: ${adderName}\n` +
                    `⌬ ━━━━━━━━━ ⌬`.replace(/{names}/g, names.slice(0, -2));

        const cachePath = path.join(__dirname, "cache", `j_${Date.now()}.gif`);
        if (!fs.existsSync(path.dirname(cachePath))) fs.mkdirSync(path.dirname(cachePath), { recursive: true });

        const res = await axios.get(randomGif, { responseType: "arraybuffer" });
        fs.writeFileSync(cachePath, Buffer.from(res.data));

        return api.sendMessage({
            body: msg,
            attachment: fs.createReadStream(cachePath),
            mentions
        }, threadID, () => {
            if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
        });

    } catch (e) {
        console.error(e);
    }
};
