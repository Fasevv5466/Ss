const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const { threadID, messageID, senderID } = event;
    
    try {
        const senderData = await Users.getData(senderID);
        const senderName = senderData.name;
        const threadData = await api.getThreadInfo(threadID);
        const users = threadData.userInfo;

        const myData = users.find((user) => user.id === senderID);
        if (!myData || !myData.gender) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nلم أتمكن من تحديد جنسك", threadID, messageID);
        }

        const myGender = myData.gender.toUpperCase();
        let matchCandidates = [];

        if (myGender === "MALE") {
            matchCandidates = users.filter(user => user.gender === "FEMALE" && user.id !== senderID);
        } else if (myGender === "FEMALE") {
            matchCandidates = users.filter(user => user.gender === "MALE" && user.id !== senderID);
        } else {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nجنسك غير محدد، لا يمكن إيجاد تطابق", threadID, messageID);
        }

        if (matchCandidates.length === 0) {
            return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nلا يوجد تطابق مناسب في المجموعة", threadID, messageID);
        }

        const selectedMatch = matchCandidates[Math.floor(Math.random() * matchCandidates.length)];
        const matchName = selectedMatch.name;

        const width = 800;
        const height = 400;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        const background = await loadImage("https://files.catbox.moe/29jl5s.jpg");
        ctx.drawImage(background, 0, 0, width, height);

        const sIdImage = await loadImage(
            `https://graph.facebook.com/${senderID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
        );
        const pairPersonImage = await loadImage(
            `https://graph.facebook.com/${selectedMatch.id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`
        );

        function drawCircle(ctx, img, x, y, size) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, x, y, size, size);
            ctx.restore();
        }

        drawCircle(ctx, sIdImage, 385, 40, 170);
        drawCircle(ctx, pairPersonImage, width - 213, 190, 170);

        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        
        const outputPath = path.join(cacheDir, `pair_${Date.now()}.png`);
        const out = fs.createWriteStream(outputPath);
        const stream = canvas.createPNGStream();
        stream.pipe(out);

        out.on("finish", () => {
            const lovePercent = Math.floor(Math.random() * 31) + 70;

            const message = `⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nتم العثور على توافق ناجح\n\n${senderName} ❤️\n${matchName} ❤️\n\nنسبة الحب: ${lovePercent}%\n\nأتمنى لكما سنوات من السعادة`;

            api.sendMessage({
                body: message,
                attachment: fs.createReadStream(outputPath)
            }, threadID, () => {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }, messageID);
        });

    } catch (error) {
        console.error('Pair Error:', error);
        api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 FUN ━━ ⌬\n\nحدث خطأ أثناء البحث عن التطابق", threadID, messageID);
    }
};

module.exports.config = {
    name: "زوجة",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "إيجاد شريك عشوائي من المجموعة",
    commandCategory: "fun",
    usages: "زوجة",
    cooldowns: 5
};
