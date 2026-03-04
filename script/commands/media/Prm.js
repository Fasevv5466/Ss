const axios = require("axios");

module.exports.config = {
  name: "برومبت",
  version: "1.0",
  hasPermssion: 0,
  credits: "Y-ANBU",
  description: "تحليل الصور والحصول على برومبت تلقائي مع اختيار ستايل",
  commandCategory: "Ai",
  usages: ".ذكاء [رقم الموديل]",
};
module.exports.run = async ({ api, event, args }) => {
  try {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return api.sendMessage("رد ع صوره",event.threadID,event.messageID);
    }
    const modelId = args.find(arg => ["0", "1", "2", "3"].includes(arg));
    if (!modelId) {
      return api.sendMessage(
        `⚙️| قم بـ ادخال رقم الموديل\n\n(0) prompt normal\n(1) flux\n(2) midjourney\n(3) Stable Diffusion`, event.threadID,event.messageID);
    }
    const imageUrl = event.messageReply.attachments[0].url;
    const response = await axios.post(
      "https://prompt-yassine3323735-fexx0qpo.leapcell.dev/generate-prompt",
      {
        imageUrl: imageUrl,
        modelId: parseInt(modelId)
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    const prompt = response.data.prompt;
    api.sendMessage(prompt, event.threadID, event.messageID);
  } catch (err) {
    console.log(err);
    api.sendMessage(err,event.threadID,event.messageID);
  }
};
