const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "antiout",
        eventType: ["log:unsubscribe"],
        version: "3.5.0",
        author: "Kira AI",
        category: "الحماية"
    },

    run: async ({ event, api, Users }) => {
        const { threadID, logMessageData, author } = event;
        const leftID = logMessageData.leftParticipantFbId;

        if (leftID == api.getCurrentUserID()) return;

        if (author == leftID) {
            try {
                const userData = await Users.getData(leftID) || {};
                const name = userData.name || "العضو";
                
                // استخدام دالة الزخرفة المربوطة في بوتك
                const bold = (text) => global.utils.toBoldSans(text);

                api.addUserToGroup(leftID, threadID, async (err) => {
                    // ═══ زخرفة كيرا المعتمدة ═══
                    const header = `⌬ ━━━ ${bold("KIRA PROTECT")} ━━━ ⌬`;
                    const footer = "⌬ ━━━━━━━━━━━━━━━━ ⌬";
                    
                    if (err) {
                        return api.sendMessage(`${header}\n\n⚠️ ${bold("ERROR")}\n\nلم أستطع إعادة 『${name}』\nيبدو أنه أغلق الإضافة أو حظر البوت!\n\n${footer}`, threadID);
                    } else {
                        const gifURL = "https://i.imgur.com/kA3qN5T.gif";
                        const cachePath = path.join(process.cwd(), "includes", "handle", "cache");
                        if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });
                        
                        const imgPath = path.join(cachePath, `antiout_${leftID}.gif`);
                        const msgBody = `${header}\n\n🎯 ${bold("NO ESCAPE")}..\n\n✨ تـمـت إعـادة: [ ${name} ]\n\n${footer}`;

                        try {
                            const { data } = await axios.get(gifURL, { responseType: "arraybuffer" });
                            fs.writeFileSync(imgPath, Buffer.from(data, "utf-8"));

                            return api.sendMessage({
                                body: msgBody,
                                attachment: fs.createReadStream(imgPath)
                            }, threadID, () => {
                                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                            });
                        } catch (e) {
                            return api.sendMessage(msgBody, threadID);
                        }
                    }
                });
            } catch (error) {
                console.log("❌ خطأ في Antiout الخاص بكيرا:", error);
            }
        }
    }
};
