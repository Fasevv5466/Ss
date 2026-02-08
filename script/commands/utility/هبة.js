// ═══════════════════════════════════════════════════════════
// 👑 KIRA - هبة
// المطور: Ayman ♛
// الوصف: ذكاء هبة المطور - متوافق مع OpenAI v4
// ═══════════════════════════════════════════════════════════

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY, // تأكد أنه مضاف في Render
});

if (!global.heba_chat_memory) {
  global.heba_chat_memory = new Map();
}

module.exports.config = {
  name: "هبة",
  aliases: [],
  version: "4.0.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "ذكاء هبة المطور - متوافق مع OpenAI v4",
  commandCategory: "utility",
  usages: "[سؤالك]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const prompt = args.join(" ");

  if (!prompt) {
    return api.sendMessage("╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n✨ نعم! أنا معك، هل تريد سؤالي عن شيء؟\n╰──────────────╯", threadID, messageID);
  }

  // 1. استرجاع أو إنشاء الذاكرة
  if (!global.heba_chat_memory.has(senderID)) {
    global.heba_chat_memory.set(senderID, [
      { role: "system", content: "أنتِ 'هبة'، بوت ذكي ولطيف، تتحدثين بالعربية بأسلوب مساعد." }
    ]);
  }

  let userMemory = global.heba_chat_memory.get(senderID);
  userMemory.push({ role: "user", content: prompt });

  if (userMemory.length > 10) userMemory.shift();

  api.setMessageReaction("⌛", messageID, () => {}, true);
  
  api.sendMessage("╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n🧠 جاري التفكير والرد...\n╰──────────────╯", threadID, async (err, info) => {
    try {
      // 2. طلب الرد باستخدام طريقة الإصدار الرابع v4
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: userMemory,
        max_tokens: 800,
        temperature: 0.7
      });

      const reply = response.choices[0].message.content.trim();
      userMemory.push({ role: "assistant", content: reply });
      global.heba_chat_memory.set(senderID, userMemory);

      api.setMessageReaction("✅", messageID, () => {}, true);
      
      return api.editMessage(
        `╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n\n🤖 هبة:\n${reply}\n\n╰──────────────╯`,
        info.messageID
      );

    } catch (error) {
      console.error("OpenAI v4 Error:", error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      
      let errorMsg = "❌ حدث خطأ في معالجة طلبك.";
      if (error.status === 401) errorMsg = "❌ خطأ: التوكن غير صحيح (Unauthorized).";
      if (error.status === 429) errorMsg = "❌ خطأ: انتهى رصيد الـ API الخاص بك (Quota Exceeded).";

      return api.editMessage(`╭──── • 𝑯𝑬𝑩𝑨 • ────╮\n${errorMsg}\n╰──────────────╯`, info.messageID);
    }
  }, messageID);
};
