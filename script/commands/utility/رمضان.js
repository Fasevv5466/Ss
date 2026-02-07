module.exports.config = {
  name: "رمضان",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ayman",
  description: "العد التنازلي لرمضان",
  commandCategory: "utility",
  cooldowns: 5
};

module.exports.handleEvent = async function ({ api, event }) {
  if (!event.body) return;
  const input = event.body.toLowerCase();

  if (input.includes("رمضان") || input === "متى الرمضان") {
    return this.run({ api, event });
  }
};

module.exports.run = function ({ event, api }) {
    const { threadID, messageID } = event;
    
    const ramadanDate = new Date("February 18, 2026 00:00:00").getTime();
    const now = new Date().getTime();
    const t = ramadanDate - now;
    
    if (t <= 0) {
      return api.sendMessage(
        `◈ ───« رمـضـان »─── ◈
│
◯ │ مـبـارك
◯ │ عـلـيـكـم
◯ │ الـشـهـر
◯ │ تـقـبـل الله
◯ │ مـنـا ومـنـكـم
│
◈ ─────────────── ◈`,
        threadID, 
        messageID
      );
    }

    const seconds = Math.floor((t / 1000) % 60);
    const minutes = Math.floor((t / 1000 / 60) % 60);
    const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    const days = Math.floor(t / (1000 * 60 * 60 * 24));

    const response = `◈ ───« رمـضـان »─── ◈
│
◯ │ الـوقـت الـمـتـبـقـي
◯ │ لـرمـضـان 2026 :
│
◯ │ ${days} يـوم
◯ │ ${hours} سـاعـة
◯ │ ${minutes} دقـيـقـة
◯ │ ${seconds} ثـانـيـة
│
◯ │ اللـهـم بـلـغـنـا
◯ │ رمـضـان
│
◈ ─────────────── ◈`;

    return api.sendMessage(response, threadID, messageID);
};
