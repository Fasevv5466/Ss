// ═══════════════════════════════════════════════════════════
// 👑 KIRA - حماية
// المطور: Ayman ♛
// الوصف: حماية شاملة (الاسم، الصورة، الثيم، الإيموجي)
// ═══════════════════════════════════════════════════════════

const fs = require("fs-extra");
const path = __dirname + "/cache/antichange.json";

module.exports.config = {
  name: "حماية",
  aliases: [],
  version: "4.0.0",
  hasPermssion: 1,
  credits: "Ayman ♛",
  description: "حماية شاملة (الاسم، الصورة، الثيم، الإيموجي)",
  commandCategory: "utility",
  usages: "تشغيل / ايقاف",
  cooldowns: 0
};

module.exports.onLoad = () => {
  if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}));
};

module.exports.handleEvent = async function ({ api, event, Threads }) {
  const { threadID, logMessageType, logMessageData, author } = event;
  const botID = api.getCurrentUserID();

  // جلب البيانات المخزنة
  let data = JSON.parse(fs.readFileSync(path));
  if (!data[threadID] || data[threadID].status == false) return;

  // 1. حماية اسم المجموعة
  if (logMessageType == "log:thread-name") {
    if (author == botID) return;
    api.setTitle(data[threadID].name, threadID, () => {
      api.sendMessage("◈ ──『 تـنـبـيـه مـلـكـي 』── ◈\n\n◯ مـمـنـوع تـغـيـيـر اسـم الـمـمـلـكـة سـيـدي.\n◉ تـمـت إعـادة الاسـم بـأوامـر أيـمـن 👑", threadID);
    });
  }

  // 2. حماية صورة المجموعة
  if (logMessageType == "log:thread-icon") {
    if (author == botID) return;
    // البوت لا يمكنه إعادة الصورة القديمة تلقائياً بسهولة دون تخزين رابط، لكنه سيقوم بتنبيهك أو منع العملية إذا توفرت الصلاحيات
    api.sendMessage("◈ ──『 تـنـبـيـه مـلـكـي 』── ◈\n\n◯ مـمـنـوع تـغـيـيـر هـويـة الـمـمـلـكـة الـبـصـريـة.\n◉ جـارٍ إبـلاغ الإمـبـراطـور أيـمـن 🛡️", threadID);
  }

  // 3. حماية الثيم (اللون) والإيموجي
  if (logMessageType == "log:thread-color" || logMessageType == "log:thread-emoji") {
    if (author == botID) return;
    const threadInfo = await api.getThreadInfo(threadID);
    
    // إعادة الثيم والإيموجي كما كانا مخزنين
    api.changeThreadColor(data[threadID].color, threadID);
    api.changeThreadEmoji(data[threadID].emoji, threadID);
    
    api.sendMessage("◈ ──『 تـنـبـيـه مـلـكـي 』── ◈\n\n◯ مـمـنـوع الـعـبـث بـألوان وزخـارف الـقـصـر.\n◉ تـمـت اسـتـعـادة الـنـظـام الـسـابـق ✅", threadID);
  }
};

module.exports.run = async function ({ api, event, Threads }) {
  const { threadID, messageID } = event;
  let data = JSON.parse(fs.readFileSync(path));
  const threadInfo = await api.getThreadInfo(threadID);

  if (!data[threadID]) {
    data[threadID] = {
      name: threadInfo.threadName,
      color: threadInfo.color,
      emoji: threadInfo.emoji,
      status: false
    };
  }

  if (data[threadID].status == false) {
    data[threadID].status = true;
    data[threadID].name = threadInfo.threadName;
    data[threadID].color = threadInfo.color;
    data[threadID].emoji = threadInfo.emoji;
    
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    return api.sendMessage("◈ ───『 الـحـصـن الـمـلـكـي 』─── ◈\n\n◯ تـم تـفـعـيـل الـحـمـايـة الـشـامـلـة:\n✅ حـمـايـة الاسـم\n✅ حـمـايـة الـثـيـم\n✅ حـمـايـة الإيـمـوجـي\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑", threadID, messageID);
  } else {
    data[threadID].status = false;
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    return api.sendMessage("◈ ───『 الـحـصـن الـمـلـكـي 』─── ◈\n\n◯ تـم إيـقـاف الـحـمـايـة بـنـجـاح سـيدي.\n⚠️ الـمـجـموعـة الآن مـكـشـوفـة لـلـتـغـيـيـرات.", threadID, messageID);
  }
};
