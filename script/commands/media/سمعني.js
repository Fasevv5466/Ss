
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");

module.exports.config = {
  name: "سمعني",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "تحميل وتشغيل الأغاني من YouTube",
  commandCategory: "ترفيه",
  usages: "سمعني [اسم الأغنية]",
  cooldowns: 10,
  youtubeKey: "AIzaSyCLyuBSAeTt6XkwGyP0nTh8O7sZXEEpV0Q"
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const { youtubeKey } = module.exports.config;

  const query = args.join(" ").trim();
  if (!query) {
    return api.sendMessage(
      "⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n🎵 اكتب اسم الأغنية:\nمثال: سمعني طيف",
      threadID, messageID
    );
  }

  const waitMsg = await api.sendMessage(
    `⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n🔍 جاري البحث عن: ${query}...`,
    threadID
  );

  try {
    const searchResponse = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: query,
        type: "video",
        maxResults: 5,
        key: youtubeKey
      },
      timeout: 10000
    });

    const videos = searchResponse.data.items;
    if (!videos || videos.length === 0) {
      api.unsendMessage(waitMsg.messageID);
      return api.sendMessage(
        `⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ لم أجد نتائج لـ: ${query}`,
        threadID, messageID
      );
    }

    const list = videos.map((v, i) =>
      `${i + 1}. 🎵 ${v.snippet.title}\n    👤 ${v.snippet.channelTitle}`
    ).join("\n\n");

    api.unsendMessage(waitMsg.messageID);

    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n📋 نتائج: ${query}\n\n${list}\n\n⚡ رد برقم الأغنية (1-${videos.length})`,
      threadID,
      (err, info) => {
        if (!err) {
          global.client.handleReply.push({
            name: "سمعني",
            messageID: info.messageID,
            author: senderID,
            videos
          });
        }
      },
      messageID
    );

  } catch (e) {
    api.unsendMessage(waitMsg.messageID);
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ فشل البحث: ${e.message}`,
      threadID, messageID
    );
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, messageID, body, senderID } = event;

  if (senderID !== handleReply.author) return;

  const choice = parseInt(body);
  const { videos } = handleReply;

  if (isNaN(choice) || choice < 1 || choice > videos.length) {
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n⚠️ اختر رقماً من 1 إلى ${videos.length}`,
      threadID, messageID
    );
  }

  const selected = videos[choice - 1];
  const videoId = selected.id.videoId;
  const title = selected.snippet.title;
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  api.unsendMessage(handleReply.messageID);
  const downloadMsg = await api.sendMessage(
    `⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n⏳ جاري تحميل: 🎵 ${title}...`,
    threadID
  );

  try {
    const tempDir = path.join(process.cwd(), "cache");
    fs.ensureDirSync(tempDir);
    const outputPath = path.join(tempDir, `${Date.now()}.mp3`);

    const ytDlpPath = fs.existsSync(path.join(process.cwd(), "yt-dlp"))
      ? path.join(process.cwd(), "yt-dlp")
      : "yt-dlp";

    const command = `"${ytDlpPath}" -x --audio-format mp3 --audio-quality 0 --no-playlist --no-check-certificate -o "${outputPath}" "${videoUrl}"`;

    exec(command, { maxBuffer: 1024 * 1024 * 20 }, (err) => {
      if (err) {
        api.unsendMessage(downloadMsg.messageID);
        return api.sendMessage(
          "⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ فشل التحميل.",
          threadID, messageID
        );
      }

      const sizeMB = fs.statSync(outputPath).size / (1024 * 1024);
      if (sizeMB > 26) {
        fs.unlinkSync(outputPath);
        api.unsendMessage(downloadMsg.messageID);
        return api.sendMessage(
          `⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ الملف كبير جداً (${sizeMB.toFixed(1)}MB)`,
          threadID, messageID
        );
      }

      api.unsendMessage(downloadMsg.messageID);
      api.sendMessage(
        {
          body: `⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n✅ تم التحميل\n🎵 ${title}`,
          attachment: fs.createReadStream(outputPath)
        },
        threadID,
        () => { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); },
        messageID
      );
    });

  } catch (e) {
    api.unsendMessage(downloadMsg.messageID);
    return api.sendMessage(
      `⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬\n\n❌ خطأ: ${e.message}`,
      threadID, messageID
    );
  }
};
