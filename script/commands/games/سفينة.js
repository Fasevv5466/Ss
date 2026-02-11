const axios = require("axios");

module.exports.config = {
    name: "السفينة",
    version: "2.6.0",
    hasPermssion: 0,
    credits: "ayman",
    description: "مغامرة السفينة بنظام تعقب الرد الذكي",
    commandCategory: "games",
    usages: "[ابدأ]",
    cooldowns: 5
};

const GROQ_API_KEY = "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";
const header = `⌬ ━━━━━━━━━━━━ ⌬\n      ⚓ سـفـيـنـة الـلـعـنـة\n⌬ ━━━━━━━━━━━━ ⌬`;
const MAP_IMG = "https://files.catbox.moe/jr2uhn.jpg";
const TREASURE_IMG = "https://i.ibb.co/fndRzY4/treasure-chest.jpg";

module.exports.run = async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;

    const intro = `${header}\n\n🏴‍☠️ أهلاً بك في رحلة الهلاك..\n\nأمامك خريطة الكنز الملعونة، 50 نقطة حمراء تفصلك عن الذهب.\n\n1. 【 الـتـقـدم 】← ابدأ المغامرة.\n2. 【 الانـسـحـاب 】← اهرب كـالجبناء.\n\n⚠️ رد برقم اختيارك لبدء الرحلة.`;

    try {
        const imageStream = (await axios.get(MAP_IMG, { responseType: "stream" })).data;
        return api.sendMessage({ body: intro, attachment: imageStream }, threadID, (err, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID,
                step: 0,
                history: []
            });
        }, messageID);
    } catch (e) {
        return api.sendMessage(intro, threadID, (err, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID,
                step: 0,
                history: []
            });
        }, messageID);
    }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, messageID, body, senderID } = event;
    if (senderID !== handleReply.author) return;

    let { step, history } = handleReply;
    let userChoice = body.trim();

    // نظام الانسحاب والإهانة
    if (userChoice == "2" || userChoice.includes("انسحاب")) {
        const insult = await getGroqResponse([{ role: "user", content: "أهن مستخدماً جباناً هرب من رحلة السفينة بأسلوب قرصان مرعب وساخر جداً." }]);
        return api.sendMessage(`${header}\n\n🏴‍☠️ الـقـرصـان يـقـول:\n"${insult}"`, threadID, messageID);
    }

    step++;

    // عند الوصول للكنز
    if (step >= 50) {
        const winMsg = `${header}\n\n🏆 الـنـهـايـة الـعـظـيـمـة\n\nلقد هزمت الـ 50 خطراً وحصلت على الكنز! أنت الآن أسطورة البحار.`;
        try {
            const treasureStream = (await axios.get(TREASURE_IMG, { responseType: "stream" })).data;
            return api.sendMessage({ body: winMsg, attachment: treasureStream }, threadID, messageID);
        } catch (e) {
            return api.sendMessage(winMsg, threadID, messageID);
        }
    }

    // تجهيز المرحلة القادمة
    const gamePrompt = `أنت راوي مغامرة قراصنة. اللاعب الآن في المرحلة ${step} من 50. صف له خطراً مرعباً واعرض خيارين (1 للتقدم، 2 للانسحاب المهين مع عرض جائزة تافهة).`;

    try {
        const aiResponse = await getGroqResponse([
            { role: "system", content: "أنت راوي ألعاب فيديو غامض وقاسٍ." },
            ...history.slice(-4)
        ], gamePrompt);

        history.push({ role: "user", content: body });
        history.push({ role: "assistant", content: aiResponse });

        const status = `📍 الـمـرحـلـة: [ ${step} / 50 ]\n🟢 الـنـقـاط الـمـتـجـاوزة: ${step - 1}`;

        return api.sendMessage(`${header}\n\n${status}\n\n${aiResponse}`, threadID, (err, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID,
                step: step,
                history: history
            });
        }, messageID);

    } catch (e) {
        return api.sendMessage("⚠️ عاصفة في الاتصال، حاول الرد مجدداً.", threadID, messageID);
    }
};

async function getGroqResponse(messages, customPrompt = "") {
    if (customPrompt) messages.push({ role: "user", content: customPrompt });
    const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: "llama3-70b-8192",
        messages: messages,
        temperature: 0.8
    }, {
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" }
    });
    return res.data.choices[0].message.content;
}
