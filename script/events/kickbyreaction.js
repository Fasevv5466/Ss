module.exports.config = {
  name: "kickfast",
  version: "1.0.0",
  credits: "Ayman",
  hasPermssion: 0,
  description: "طرد سريع بالتفاعل 🐢",
  commandCategory: "المطور"
};

module.exports.handleEvent = async function({ api, event }) {
  // المطور فقط
  if (event.senderID !== "61577861540407") return;
  
  if (event.type === "message_reaction" && event.reaction === "🐢") {
    const { threadID, userID } = event;
    
    try {
      await api.removeUserFromGroup(userID, threadID);
      api.sendMessage(`✅ تم طرد ${userID}`, threadID);
    } catch {
      api.sendMessage("❌ فشل الطرد", threadID);
    }
  }
};
