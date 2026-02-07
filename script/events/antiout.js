const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "antiout",
  eventType: ["log:unsubscribe"],
  version: "2.0.0",
  credits: "Ayman",
  description: "نظام إعادة الأعضاء المزخرف والفوري"
};

module.exports.run = async ({ event, api, Users }) => {
  const { threadID, logMessageData, author } = event;
  const leftID = logMessageData.leftParticipantFbId;
  
  if (leftID == api.getCurrentUserID()) return;
  
  if (author == leftID) {
    try {
      const name = await Users.getNameUser(leftID) || "العضو";
      
      api.addUserToGroup(leftID, threadID, async (err) => {
        if (err) {
          return api.sendMessage(`╭─────╼🚫╾─────╮\n  مـانـع الـخـروج\n╰─────╼🚫╾─────╯\n\n⚠️ لا يمكن إعادة 『${name}』\nربما أغلق إضافة الغرباء!`, threadID);
        } else {
          const gifURL = "https://i.imgur.com/kA3qN5T.gif";
          const cachePath = path.join(__dirname, "cache");
          
          if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
          const imgPath = path.join(cachePath, `antiout_${Date.now()}.gif`);
          
          const msgBody = `╭─────╼🚫╾─────╮\n  مـانـع الـخـروج مـن هـبة\n╰─────╼🚫╾─────╯\n\n🎯 لا هروب من إمبراطورية هبة..\n\n✨ تـمـت إعـادة: [ ${name} ]\n\n💡 اكتب "اطرديني" للخروج\n\n━━━━━━━━━━━━━━`;
          
          try {
            const { data } = await axios.get(gifURL, { responseType: "arraybuffer" });
            fs.writeFileSync(imgPath, Buffer.from(data, "utf-8"));
            
            return api.sendMessage({
              body: msgBody,
              attachment: fs.createReadStream(imgPath)
            }, threadID, () => fs.existsSync(imgPath) && fs.unlinkSync(imgPath));
          } catch {
            return api.sendMessage(msgBody, threadID);
          }
        }
      });
    } catch (e) {
      console.log("خطأ Antiout:", e);
    }
  }
};
