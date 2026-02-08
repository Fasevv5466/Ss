const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const stream = require('stream');
const { promisify } = require('util');

const pipeline = promisify(stream.pipeline);
const API_ENDPOINT = "https://free-goat-api.onrender.com/4k";
const CACHE_DIR = path.join(__dirname, 'cache');

function extractImageUrl(args, event) {
    let imageUrl = args.find(arg => arg.startsWith('http'));

    if (!imageUrl && event.messageReply && event.messageReply.attachments && event.messageReply.attachments.length > 0) {
        const imageAttachment = event.messageReply.attachments.find(att => att.type === 'photo' || att.type === 'image');
        if (imageAttachment && imageAttachment.url) {
            imageUrl = imageAttachment.url;
        }
    }
    return imageUrl;
}

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    const imageUrl = extractImageUrl(args, event);

    if (!imageUrl) {
        return api.sendMessage("⌬ ━━ 𝗞𝗜𝗥𝗔 𝗠𝗘𝗗𝗜𝗔 ━━ ⌬\n❌ | يرجى تقديم رابط صورة أو الرد على صورة لتحسين الجودة.", event.threadID, event.messageID);
    }

    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
    }

    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    let tempFilePath;

    try {
        const fullApiUrl = `${API_ENDPOINT}?url=${encodeURIComponent(imageUrl)}`;
        const apiResponse = await axios.get(fullApiUrl, { timeout: 45000 });
        const data = apiResponse.data;

        if (!data.image) {
            throw new Error("API returned success but missing final image URL.");
        }

        const upscaledImageUrl = data.image;
        const imageDownloadResponse = await axios.get(upscaledImageUrl, {
            responseType: 'stream',
            timeout: 60000,
        });

        const fileHash = Date.now() + Math.random().toString(36).substring(2, 8);
        tempFilePath = path.join(CACHE_DIR, `upscale_4k_${fileHash}.jpg`);
        await pipeline(imageDownloadResponse.data, fs.createWriteStream(tempFilePath));

        api.setMessageReaction("✅", event.messageID, () => {}, true);
        await api.sendMessage({
            body: "⌬ ━━ 𝗞𝗜𝗥𝗔 𝗠𝗘𝗗𝗜𝗔 ━━ ⌬\n✅ | تم تحسين جودة الصورة بنجاح!",
            attachment: fs.createReadStream(tempFilePath)
        }, event.threadID, event.messageID);

    } catch (error) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        let errorMessage = "⌬ ━━ 𝗞𝗜𝗥𝗔 𝗠𝗘𝗗𝗜𝗔 ━━ ⌬\n❌ | فشل في تحسين جودة الصورة.";
        if (error.response) {
            if (error.response.status === 400) {
                errorMessage = "⌬ ━━ 𝗞𝗜𝗥𝗔 𝗠𝗘𝗗𝗜𝗔 ━━ ⌬\n❌ | رابط غير صالح أو الصورة صغيرة/كبيرة جداً.";
            } else {
                errorMessage = `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗠𝗘𝗗𝗜𝗔 ━━ ⌬\n❌ | خطأ ${error.response.status}. الخدمة غير متاحة.`;
            }
        } else if (error.message.includes('timeout')) {
            errorMessage = "⌬ ━━ 𝗞𝗜𝗥𝗔 𝗠𝗘𝗗𝗜𝗔 ━━ ⌬\n❌ | انتهت مهلة الطلب.";
        }
        console.error("Upscale Error:", error);
        api.sendMessage(errorMessage, event.threadID, event.messageID);
    } finally {
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
        }
    }
};

module.exports.config = {
    name: "تطوير",
    aliases: ["upscale", "hd", "enhance"],
    version: "1.0",
    author: "ايمن",
    countDown: 15,
    role: 0,
    longDescription: "تحسين جودة الصور إلى دقة أعلى باستخدام الذكاء الاصطناعي.",
    category: "media"
};
