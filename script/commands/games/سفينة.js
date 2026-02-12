const axios = require("axios");

module.exports.config = {
    name: "السفينة",
    version: "2.8.0",
    hasPermssion: 0,
    credits: "Ayman",
    description: "مغامرة السفينة - نسخة مستقرة",
    commandCategory: "games",
    usages: "السفينة",
    cooldowns: 5
};

const header = `⌬ ━━━━━━━━━━━━ ⌬\n      ⚓ سـفـيـنـة الـلـعـنـة\n⌬ ━━━━━━━━━━━━ ⌬`;
const MAP_IMG = "https://files.catbox.moe/jr2uhn.jpg";
const TREASURE_IMG = "https://files.catbox.moe/m1hwrf.jpg";

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;

    const intro = `${header}\n\n🏴‍☠️ أهـلاً بـك فـي رحـلـة الـهـلاك..\n\n1. 【 الـتـقـدم الـشـجـاع 】\n2. 【 الـانـسـحـاب الـجـبـان 】\n\n⪼ رد بـرقـم اخـتـيـارك لـلـبـدء.`;

    try {
        const imageStream = (await axios.get(MAP_IMG, { responseType: "stream" })).data;
        return api.sendMessage({ body: intro, attachment: imageStream }, threadID, (err, info) => {
            global.client.handleReply.push({
                name: "السفينة",
                messageID: info.messageID,
                author: senderID,
                step: 0,
                history: []
            });
        }, messageID);
    } catch (e) {
        return api.sendMessage(intro, threadID, (err, info) => {
            global.client.handleReply.push({ name: "السفينة", messageID: info.messageID, author: senderID, step: 0, history: [] });
        }, messageID);
    }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, messageID, body, senderID } = event;
    if (String(senderID) !== String(handleReply.author)) return;

    let { step, history } = handleReply;
    let userChoice = body.trim();

    // خيار الانسحاب
    if (userChoice == "2" && step == 0 || userChoice == "4") {
        return api.sendMessage(`${header}\n\n🏴‍☠️ هـربـت كـالـفـئران!\n⪼ انـتـهـت الـمـغـامـرة بـجـبـن.\n${header}`, threadID, messageID);
    }

    if (step > 0 && !["1", "2", "3", "4"].includes(userChoice)) return;

    step++;

    if (step >= 50) {
        const winMsg = `${header}\n\n🏆 مـبـروك يـا مـلـك الـبـحـار!\n⪼ لـقـد نـلـت الـكـنـز الـأخـيـر.\n${header}`;
        try {
            const trImg = (await axios.get(TREASURE_IMG, { responseType: "stream" })).data;
            return api.sendMessage({ body: winMsg, attachment: trImg }, threadID, messageID);
        } catch (e) { return api.sendMessage(winMsg, threadID, messageID); }
    }

    try {
        api.setMessageReaction("⏳", messageID, () => {}, true);
        const aiResponse = await getAiAction(step, history, userChoice);

        history.push({ role: "user", content: userChoice });
        history.push({ role: "assistant", content: aiResponse });

        const status = `📍 الـمـرحـلـة: [ ${step} / 50 ]\n⌬ ━━━━━━━━━━━━ ⌬`;

        return api.sendMessage(`${header}\n\n${status}\n${aiResponse}`, threadID, (err, info) => {
            global.client.handleReply.push({
                name: "السفينة",
                messageID: info.messageID,
                author: senderID,
                step: step,
                history: history
            });
        }, messageID);
    } catch (e) {
        return api.sendMessage("⚠️ عـاصـفـة فـي الـسـيـرفـر، رد مـجـدداً.", threadID, messageID);
    }
};

async function getAiAction(step, history, choice) {
    const API_URL = "https://api.groq.com/openai/v1/chat/completions";
    const API_KEY = "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";

    const prompt = `أنت راوي مغامرة قراصنة. اللاعب في المرحلة ${step} من 50. صف له خطراً جديداً باختصار شديد جداً (سطرين) واعرض 4 خيارات مرقمة (1 هجوم، 2 دفاع، 3 خدعة، 4 انسحاب).`;

    const res = await axios.post(API_URL, {
        model: "mixtral-8x7b-32768",
        messages: [{ role: "system", content: "راوي قراصنة مختصر." }, ...history.slice(-2), { role: "user", content: prompt }]
    }, { headers: { "Authorization": `Bearer ${API_KEY}` } });

    return res.data.choices[0].message.content.trim();
}
