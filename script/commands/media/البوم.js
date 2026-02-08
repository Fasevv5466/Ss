const axios = require("axios");
const fs = require("fs");
const path = require("path");

// دالة جلب رابط الـ API الأساسي
const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports.config = {
    name: "البوم",
    version: "1.7.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "البوم فيديوهات متنوع (أنمي، مضحك، إسلامي...)",
    commandCategory: "media",
    usages: "[رقم الصفحة] أو [add تصنيف رابط]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const apiUrl = await baseApiUrl();
    const { threadID, messageID, senderID } = event;

    // --- قسم إضافة فيديو جديد ---
    if (args[0] === "add") {
        const DEV_ID = global.config.ADMINBOT[0]; 
        if (senderID !== DEV_ID) return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n❌ عذراً، إضافة الفيديوهات للمطور فقط.", threadID, messageID);

        if (!args[1]) return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n❌ حدد التصنيف: البوم add <تصنيف>", threadID, messageID);
        const category = args[1].toLowerCase();

        // الرد على فيديو
        if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
            const attachment = event.messageReply.attachments[0];
            if (attachment.type !== "video") return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n❌ يُسمح بمقاطع الفيديو فقط.", threadID, messageID);
            try {
                const response = await axios.post("https://api.imgur.com/3/upload", { image: attachment.url }, {
                    headers: { Authorization: "Bearer edd3135472e670b475101491d1b0e489d319940f", "Content-Type": "application/json" }
                });
                const imgurLink = response.data?.data?.link;
                if (!imgurLink) throw new Error("فشل رفع Imgur");
                const uploadResponse = await axios.post(`${apiUrl}/api/album/add`, { category, videoUrl: imgurLink });
                return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n✅ ${uploadResponse.data.message}`, threadID, messageID);
            } catch (error) {
                return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n❌ ${error.message}`, threadID, messageID);
            }
        }
        // عبر الرابط المباشر
        if (!args[2]) return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n❌ قدم رابط فيديو أو رد على فيديو.", threadID, messageID);
        const videoUrl = args[2];
        try {
            const response = await axios.post(`${apiUrl}/album/add`, { category, videoUrl });
            return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n✅ ${response.data.message}`, threadID, messageID);
        } catch (error) {
            return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n❌ ${error.message}`, threadID, messageID);
        }
    } 
    // --- قسم القائمة والعرض ---
    else if (args[0] === "list") {
        try {
            const response = await axios.get(`${apiUrl}/api/album/list`);
            api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n📜 ${response.data.message}`, threadID, messageID);
        } catch (error) {
            api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n❌ ${error.message}`, threadID, messageID);
        }
    } 
    else {
        const displayNames = [
            "فيديو مضحك", "فيديو إسلامي", "فيديو حزين", "فيديو أنمي", "فيديو لوفي",
            "فيديو موقف", "فيديو إغراء", "فيديو زوجين", "فيديو زهور", "فيديو سيارات",
            "فيديو حب", "فيديو كلمات", "فيديو قطط", "فيديو 18+", "فيديو فري فاير",
            "فيديو كرة قدم", "فيديو أطفال", "فيديو أصدقاء", "فيديو ببجي", "فيديو جمالي",
            "فيديو ناروتو", "فيديو دراغون بول", "فيديو بليتش", "فيديو ديمون سلاير", "فيديو جوجوتسو",
            "فيديو سولو ليفلينج", "فيديو طوكيو ريفينجرز", "فيديو بلو لوك", "فيديو تشينسو مان", "فيديو ديث نوت",
            "فيديو ون بيس", "فيديو هجوم العمالقة", "فيديو ساكاموتو دايز", "فيديو ويند بريكر", "فيديو ون بنش مان",
            "فيديو أليا روسيا", "فيديو بلو بوكس", "فيديو هنتر x هنتر", "فيديو حياة وحيد", "فيديو هانيمي"
        ];

        const realCategories = [
            "funny", "islamic", "sad", "anime", "lofi", "attitude", "horny", "couple",
            "flower", "bikecar", "love", "lyrics", "cat", "18+", "freefire",
            "football", "baby", "friend", "pubg", "aesthetic", "naruto", "dragon", "bleach", "demon", "jjk", "solo", "tokyo", "bluelock", "cman", "deathnote", "onepiece", "attack", "sakamoto", "wind", "onepman", "alya", "bluebox", "hunter", "loner", "hanime"
        ];

        const captions = displayNames.map(name => name + " ✨");

        const itemsPerPage = 10;
        const page = parseInt(args[0]) || 1;
        const totalPages = Math.ceil(displayNames.length / itemsPerPage);
        if (page < 1 || page > totalPages) return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n❌ صفحة غير صالحة! اختر بين 1 - ${totalPages}.`, threadID, messageID);

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const displayedCategories = displayNames.slice(startIndex, endIndex);

        const message = `⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n📼 قائمة فيديوهات الألبوم:\n` +
            displayedCategories.map((option, index) => `${startIndex + index + 1}. ${option}`).join("\n") +
            `\n\n📄 الصفحة [${page}/${totalPages}]\nℹ️ رد برقم الفيديو للمشاهدة.`;

        await api.sendMessage(message, threadID, (error, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID,
                page,
                startIndex,
                displayNames,
                realCategories,
                captions,
                type: "album"
            });
        }, messageID);
    }
};

module.exports.handleReply = async function({ api, event, handleReply }) {
    if (event.senderID != handleReply.author) return;
    const { threadID, messageID, body } = event;
    api.unsendMessage(handleReply.messageID);

    const reply = parseInt(body);
    const index = reply - 1;
    if (isNaN(reply) || index < 0 || index >= handleReply.realCategories.length) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n❌ رد برقم صالح من القائمة.", threadID, messageID);
    }

    const category = handleReply.realCategories[index];
    const caption = handleReply.captions[index];

    try {
        const apiUrl = await baseApiUrl();
        const response = await axios.get(`${apiUrl}/api/album/videos/${category}?userID=${event.senderID}`);
        if (!response.data.success) return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n${response.data.message}`, threadID, messageID);

        const videoUrls = response.data.videos;
        if (!videoUrls || videoUrls.length === 0) return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n❌ لا توجد فيديوهات لهذا التصنيف.", threadID, messageID);

        const randomVideoUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];
        const filePath = path.join(__dirname, `cache/album_${Date.now()}.mp4`);

        const video = await axios({
            url: randomVideoUrl,
            method: "GET",
            responseType: "stream",
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const writer = fs.createWriteStream(filePath);
        video.data.pipe(writer);

        writer.on("finish", () => {
            api.sendMessage({
                body: `⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n✅ ${caption}`,
                attachment: fs.createReadStream(filePath)
            }, threadID, () => { if(fs.existsSync(filePath)) fs.unlinkSync(filePath); }, messageID);
        });

    } catch (error) {
        api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 MEDIA ━━ ⌬\n\n❌ فشل جلب الفيديو: ${error.message}`, threadID, messageID);
    }
};
