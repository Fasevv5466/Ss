module.exports = function ({ api, models, Users, Threads, Currencies }) {
  const axios = require("axios");
  const stringSimilarity = require("string-similarity"),
    escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  
  const GROQ_API_KEY = "Gsk_5xXabJMctRfDGK7i3cc4WGdyb3FYAhrMgglcp5sPAY7N6lOm01fz";

  return async function ({ event }) {
    const { PREFIX, ADMINBOT } = global.config;
    const { commands, threadData } = global.client;
    var { body, senderID, threadID, messageID } = event;

    if (!body) return;
    senderID = String(senderID);
    threadID = String(threadID);
    
    const threadSetting = threadData.get(threadID) || {};
    const prefix = threadSetting.PREFIX || PREFIX;
    const botID = api.getCurrentUserID();
    const prefixRegex = new RegExp(`^(<@!?${botID}>|${escapeRegex(prefix)})\\s*`);
    const [matchedPrefix] = body.match(prefixRegex) || [null];

    if (!matchedPrefix) return;

    const args = body.slice(matchedPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    var command = commands.get(commandName);

    // 🧠 منطق المعالجة الذكي عند عدم وجود الأمر
    if (!command) {
      const allCmds = Array.from(commands.keys());
      const checker = stringSimilarity.findBestMatch(commandName, allCmds);
      const closest = checker.bestMatch.target;

      // محاولة استخدام الذكاء الاصطناعي أولاً
      try {
        const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: `أنتِ كيرا، بنت عراقية ذكية وساخرة. المستخدم كتب أمراً غير موجود وهو "${commandName}". إذا كان قريباً من "${closest}" ألمحي له بذكاء، وإلا ردي بكلمات ساخرة مختصرة جداً (أقل من 10 كلمات).` },
            { role: "user", content: body.slice(matchedPrefix.length) }
          ],
          max_tokens: 40
        }, { 
          headers: { "Authorization": `Bearer ${GROQ_API_KEY}` },
          timeout: 3000 // مهلة 3 ثواني فقط لضمان سرعة الرد
        });
        
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 𝗔𝗜 ━━ ⌬\n${res.data.choices[0].message.content}`, threadID, messageID);

      } catch (error) {
        // 🔄 الانتقال التلقائي للكود القديم في حال تعطل الذكاء الاصطناعي
        const fallbackReplies = [
          `قصدك "${closest}"؟ لأن هذا الأمر مو عندي.`,
          `الأمر غلط، جرب "${closest}" عيوني.`,
          `تأكد من الإملاء، يمكن قصدك "${closest}".`,
          `ماكو هيج أمر، أظن تريد "${closest}".`
        ];
        return api.sendMessage(`⌬ ━━ 𝗞𝗜𝗥𝗔 𝗨𝗧𝗜𝗟𝗜𝗧𝗬 ━━ ⌬\n\n❌ خطأ: "${commandName}" غير مسجل\n💡 هل تقصد: '${closest}'؟`, threadID, messageID);
      }
    }

    // --- تنفيذ الأمر إذا كان موجوداً ---
    var permssion = ADMINBOT.includes(senderID) ? 2 : 0;
    if (command.config.hasPermssion > permssion) {
        return api.sendMessage("ما عندك صلاحية لهيج شغل.", threadID, messageID);
    }

    try {
      command.run({ api, event, args, Users, Threads, Currencies, permssion });
    } catch (e) {
      api.sendMessage(`صار خلل: ${e.message}`, threadID);
    }
  };
};
