const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const mongoPath = path.join(process.cwd(), "includes", "mongodb.js");
const mongoDB = require(mongoPath);

module.exports = {
    config: {
        name: "joinNoti",
        eventType: ["log:subscribe"],
        version: "2.6.0",
        author: "Kira AI"
    },

    run: async function({ api, event }) {
        const { threadID } = event;
        const bold = (text) => global.utils.toBoldSans(text);
        const header = `⌬ ━━━ ${bold("KIRA SYSTEM")} ━━━ ⌬`;
        const footer = `⌬ ━━━━━━━━━━━━━━━━ ⌬`;

        // 1. عند دخول البوت للمجموعة (الرسالة المطلوبة)
        if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
            api.changeNickname(`[ ${global.config.PREFIX} ] • ${global.config.BOTNAME}`, threadID, api.getCurrentUserID());
            
            const wakeupMsg = `${header}\n\nاوووف.. أيقظتوني مجدداً! 😴\n\n✅ تـم تـفـعـيـل الـبـوت بـنـجـاح\n🤖 اكـتـب (${global.config.PREFIX}الاوامر) لـلـبـدء.\n\n${footer}`;
            const wakeupGif = "https://media.giphy.com/media/10N247rib4BlVC/giphy.gif";
            const cachePath = path.join(process.cwd(), "includes", "handle", "cache");
            if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });
            const imgPath = path.join(cachePath, `wakeup_${Date.now()}.gif`);

            try {
                const { data } = await axios.get(wakeupGif, { responseType: "arraybuffer" });
                fs.writeFileSync(imgPath, Buffer.from(data, "utf-8"));
                return api.sendMessage({
                    body: wakeupMsg,
                    attachment: fs.createReadStream(imgPath)
                }, threadID, () => {
                    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                });
            } catch (err) {
                return api.sendMessage(wakeupMsg, threadID);
            }
        }

        // 2. ترحيب الأعضاء (نفس الزخرفة والبنك)
        try {
            const addedParticipants = event.logMessageData.addedParticipants;
            const threadInfo = await api.getThreadInfo(threadID);
            
            for (const user of addedParticipants) {
                const id = user.userFbId;
                const userName = user.fullName;
                const balance = await mongoDB.getBalance(id);

                const msg = `⌬ ━━━ ${bold("KIRA WELCOME")} ━━━ ⌬\n\n` +
                          `👋 أهـلاً بـك: [ ${userName} ]\n` +
                          `🏰 فـي: [ ${threadInfo.threadName} ]\n` +
                          `💰 رصـيدك: [ ${balance}$ ]\n\n` +
                          `✨ نـتـمـنى لـك وقـتـاً مـمـتـعـاً مـعـنا!\n\n` +
                          `${footer}`;

                const gifs = [
                    "https://media.giphy.com/media/bqSkJ4IwNcoZG/giphy.gif",
                    "https://media.giphy.com/media/MdLFOyVZtoUPm/giphy.gif",
                    "https://media.giphy.com/media/cKtQKy2VylZC0/giphy.gif",
                    "https://media.giphy.com/media/7ihhFw8q0LzBS/giphy.gif",
                    "https://media.giphy.com/media/l8vODjlQrm2YM/giphy.gif",
                    "https://media.giphy.com/media/cxPtMDHG8Ljry/giphy.gif"
                ];
                
                const randomGif = gifs[Math.floor(Math.random() * gifs.length)];
                const cachePath = path.join(process.cwd(), "includes", "handle", "cache");
                const imgPath = path.join(cachePath, `welcome_${id}_${Date.now()}.gif`);

                try {
                    const { data } = await axios.get(randomGif, { responseType: "arraybuffer" });
                    fs.writeFileSync(imgPath, Buffer.from(data, "utf-8"));
                    api.sendMessage({ body: msg, attachment: fs.createReadStream(imgPath) }, threadID, () => {
                        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                    });
                } catch (err) {
                    api.sendMessage(msg, threadID);
                }
            }
        } catch (e) {
            console.error("خطأ ترحيب كيرا: " + e);
        }
    }
};
