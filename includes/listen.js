module.exports = function({ api, models }) {
    const moment = require("moment-timezone");
    const path = require("path");
    const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

    const handleCommand = require("./handle/handleCommand")({ api, models });
    const handleReply = require("./handle/handleReply")({ api, models });
    const handleReaction = require("./handle/handleReaction")({ api, models });
    const handleEvent = require("./handle/handleEvent")({ api, models });
    const handleCreateDatabase = require("./handle/handleCreateDatabase")({ api, models });

    return async (event) => {
        // 1. تسجيل المستخدم في KiraDB فور إرسال رسالة
        handleCreateDatabase({ event });

        // 2. نظام زيادة الخبرة (XP) والمال مع كل رسالة
        if (event.type == "message" || event.type == "message_reply") {
            try {
                await mongodb.addMoney(event.senderID, 10); // يعطيه 10$ على كل رسالة كحافز
            } catch (e) { console.log("XP Error") }
        }

        // 3. معالج الأحداث الرئيسي
        switch (event.type) {
            case "message":
            case "message_reply":
                handleCommand({ event });
                handleReply({ event });
                break;
            case "message_reaction":
                if (event.reaction === "😡" && event.senderID === api.getCurrentUserID()) {
                    api.unsendMessage(event.messageID);
                }
                handleReaction({ event });
                break;
            case "event":
                handleEvent({ event });
                break;
            default:
                break;
        }
    };
};
