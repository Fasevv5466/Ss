const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const piVoiceModels = {
    1: "Pi 1",
    2: "Pi 2",
    3: "Pi 3",
    4: "Pi 4",
    5: "Pi 5",
    6: "Pi 6",
    7: "Pi 7",
    8: "Pi 8"
};

async function callPi(query, session, voice = false, model = 1) {
    const { data: { public: baseUrl } } = await axios.get("https://raw.githubusercontent.com/Tanvir0999/stuffs/refs/heads/main/raw/addresses.json");
    const { data } = await axios.get(`${baseUrl}/pi?query=${encodeURIComponent(query)}&session=${encodeURIComponent(session)}&voice=${voice}&model=${model}`);
    return data.data;
}

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID } = event;
    const input = args.join(" ").trim();

    if (!input) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nقدم رسالة أو استخدم: بي setvoice [on/off/1-8] أو بي list", threadID, messageID);
    }

    let userData = await Users.getData(senderID);
    let voiceSetting = userData.pi_voice || { voice: false, model: 1 };

    if (input.toLowerCase().startsWith("setvoice")) {
        const cmd = input.split(" ")[1]?.toLowerCase();

        if (!cmd || (!["on", "off"].includes(cmd) && isNaN(cmd))) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nاستخدم: بي setvoice on أو بي setvoice off أو بي setvoice [1-8]", threadID, messageID);
        }

        if (cmd === "on") {
            voiceSetting.voice = true;
        } else if (cmd === "off") {
            voiceSetting.voice = false;
        } else {
            const modelNum = parseInt(cmd);
            if (!piVoiceModels[modelNum]) {
                return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nالموديلات المدعومة: 1 إلى 8", threadID, messageID);
            }
            voiceSetting.voice = true;
            voiceSetting.model = modelNum;
        }

        userData.pi_voice = voiceSetting;
        await Users.setData(senderID, userData);
        
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nالصوت: ${voiceSetting.voice ? "مفعل" : "معطل"}\nالموديل: ${piVoiceModels[voiceSetting.model]}`, threadID, messageID);
    }

    if (input.toLowerCase() === "list") {
        const usage = userData.pi_usageCount || 0;
        const currentModel = piVoiceModels[voiceSetting.model] || `موديل ${voiceSetting.model}`;
        const modelList = Object.entries(piVoiceModels)
            .map(([id, name]) => `${id}. ${name}`).join("\n");

        return api.sendMessage(
            `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nمعلومات Pi:\n\nالصوت: ${voiceSetting.voice ? "مفعل" : "معطل"}\nالموديل: ${currentModel}\nعدد الاستخدامات: ${usage}\n\nالموديلات المتاحة:\n${modelList}`,
            threadID, messageID
        );
    }

    const session = `pi-${senderID}`;

    try {
        const res = await callPi(input, session, voiceSetting.voice, voiceSetting.model);
        
        userData.pi_usageCount = (userData.pi_usageCount || 0) + 1;
        await Users.setData(senderID, userData);

        if (!res?.text) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nلم يستجب Pi", threadID, messageID);
        }

        let msgPayload = { body: `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n${res.text}` };

        if (voiceSetting.voice && res.audio) {
            try {
                const cacheDir = path.join(__dirname, 'cache');
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
                
                const audioPath = path.join(cacheDir, `pi_${Date.now()}.mp3`);
                const audioResponse = await axios.get(res.audio, { responseType: 'arraybuffer' });
                fs.writeFileSync(audioPath, Buffer.from(audioResponse.data));
                
                msgPayload.attachment = fs.createReadStream(audioPath);
                
                await api.sendMessage(msgPayload, threadID, (err, info) => {
                    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
                    
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: info.messageID,
                        author: senderID,
                        session,
                        type: "pi"
                    });
                }, messageID);
                
                return;
            } catch (audioErr) {
                console.error("Pi Audio Error:", audioErr);
            }
        }

        return api.sendMessage(msgPayload, threadID, (err, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID,
                session,
                type: "pi"
            });
        }, messageID);

    } catch (err) {
        console.error("Pi Error:", err);
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nفشل الاتصال بـ Pi: ${err.message}`, threadID, messageID);
    }
};

module.exports.handleReply = async function({ api, event, handleReply, Users, Threads, Currencies, models }) {
    if (String(event.senderID) !== String(handleReply.author)) return;

    const { threadID, messageID, senderID, body } = event;
    const query = body?.trim();
    
    if (!query) return;

    api.unsendMessage(handleReply.messageID);

    let userData = await Users.getData(senderID);
    const voiceSetting = userData.pi_voice || { voice: false, model: 1 };
    const session = handleReply.session || `pi-${senderID}`;

    try {
        const res = await callPi(query, session, voiceSetting.voice, voiceSetting.model);
        
        userData.pi_usageCount = (userData.pi_usageCount || 0) + 1;
        await Users.setData(senderID, userData);

        if (!res?.text) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nلم يستجب Pi", threadID, messageID);
        }

        let msgPayload = { body: `⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\n${res.text}` };

        if (voiceSetting.voice && res.audio) {
            try {
                const cacheDir = path.join(__dirname, 'cache');
                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
                
                const audioPath = path.join(cacheDir, `pi_${Date.now()}.mp3`);
                const audioResponse = await axios.get(res.audio, { responseType: 'arraybuffer' });
                fs.writeFileSync(audioPath, Buffer.from(audioResponse.data));
                
                msgPayload.attachment = fs.createReadStream(audioPath);
                
                await api.sendMessage(msgPayload, threadID, (err, info) => {
                    if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
                    
                    global.client.handleReply.push({
                        name: module.exports.config.name,
                        messageID: info.messageID,
                        author: senderID,
                        session,
                        type: "pi"
                    });
                }, messageID);
                
                return;
            } catch (audioErr) {
                console.error("Pi Audio Error:", audioErr);
            }
        }

        return api.sendMessage(msgPayload, threadID, (err, info) => {
            global.client.handleReply.push({
                name: module.exports.config.name,
                messageID: info.messageID,
                author: senderID,
                session,
                type: "pi"
            });
        }, messageID);

    } catch (err) {
        console.error("Pi Error:", err);
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 UTILITY ━━ ⌬\n\nفشل الاتصال بـ Pi: ${err.message}`, threadID, messageID);
    }
};

module.exports.config = {
    name: "بي",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "محادثة مع Pi AI بالنص أو الصوت",
    commandCategory: "utility",
    usages: "بي [رسالتك] | بي setvoice [on/off/1-8] | بي list",
    cooldowns: 5
};
