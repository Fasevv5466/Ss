module.exports.config = {
  name: "قولي",
  version: "1.0.1",
  hasPermssion: 0,
  credits: "عمر",
  description: "يقول أي شيء تريده بصوت عربي",
  commandCategory: "utility",
  usages: "قولي [نص]",
  cooldowns: 5,
  dependencies: {
    "path": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID } = event;
  
  try {
    const { createReadStream, unlinkSync } = global.nodemodule["fs-extra"];
    const { resolve } = global.nodemodule["path"];
    var content = (event.type == "message_reply") ? event.messageReply.body : args.join(" ");
    var languageToSay = (["ru","en","ko","ja"].some(item => content.indexOf(item) == 0)) ? content.slice(0, content.indexOf(" ")) : global.config.language;
    var msg = (languageToSay != global.config.language) ? content.slice(3, content.length) : content;
    
    if (!msg || msg.trim() === "") {
      return api.sendMessage(
        `◈ ───« نـص غـيـر صـحـيـح »─── ◈
│
◯ │ يـرجـى كـتـابـة نـص للـقـراءة
◯ │ أو الـرد عـلـى رسـالـة
◯ │ الأمـر : قـولـي [نـص]
◯ │ مـثـال : قـولـي مـرحـبـا
│
◈ ─────────────── ◈`,
        threadID,
        messageID
      );
    }
    
    const path = resolve(__dirname, 'cache', `${event.threadID}_${event.senderID}.mp3`);
    await global.utils.downloadFile(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(msg)}&tl=ar&client=tw-ob`, path);
    
    api.setMessageReaction("🎤", messageID, () => {}, true);
    
    return api.sendMessage({
      body: `◈ ───« تـم الـقـراءة »─── ◈
│
◯ │ تـم قـراءة الـنـص بـصـوت عـربـي
◯ │ الـنـص : ${msg.substring(0, 100)}...
│
◈ ─────────────── ◈`,
      attachment: createReadStream(path)
    }, threadID, () => unlinkSync(path), messageID);
  } catch (e) {
    console.log(e);
    return api.sendMessage(
      `◈ ───« خـطـأ فـي الـقـراءة »─── ◈
◯ │ عـذراً، لـم أسـتـطـع قـراءة الـنـص
◯ │ أو تـقـصـيـر الـنـص قـلـيـلاً
◈ ─────────────── ◈`,
      threadID,
      messageID
    );
  }
}
