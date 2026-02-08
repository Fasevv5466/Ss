// ═══════════════════════════════════════════════════════════
// 👑 KIRA - صراحة
// المطور: Ayman ♛
// الوصف: لعبة صراحة ذكية - يسألك ويحلل إجابتك
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "صراحة",
  aliases: [],
  version: "2.5.0",
  hasPermssion: 0,
  credits: "Ayman ♛",
  description: "لعبة صراحة ذكية - يسألك ويحلل إجابتك",
  commandCategory: "fun",
  usages: "[صراحة]",
  cooldowns: 5,
  dependencies: {
    "axios": ""
  }
};

module.exports.handleReply = async function ({ api, event, handleReply, Users }) {
  const { threadID, messageID, body, senderID } = event;
  if (handleReply.author != senderID) return;

  const name = await Users.getNameUser(senderID);
  
  // تحليل ذكي بسيط للإجابة
  let reaction = "";
  if (body.length < 3) {
    reaction = "إجابتك قصيرة جداً.. هل تحاول الهروب من الصراحة؟ 🤨";
  } else if (body.includes("لا") || body.includes("ما ادري")) {
    reaction = "ممم.. تبدو غامضاً اليوم، لكنني سأصدقك هذه المرة. 🙄";
  } else {
    reaction = "أحسنت! صراحتك تعجبني، أنت شخص شجاع وواضح. ✨";
  }

  api.unsendMessage(handleReply.messageID);
  
  const msg = `◈ ───『 تـحـلـيـل الـصـراحة ⚖️ 』─── ◈\n\n◯ الـعـضـو: ${name}\n◯ إجـابـتـك: "${body}"\n\n◉ تـعـلـيـق الـبـوت: ${reaction}\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;
  
  return api.sendMessage(msg, threadID, messageID);
};

module.exports.run = async function({ api, event, Users }) {
  const { threadID, messageID, senderID } = event;

  const questions = [
    'ما أسوأ شيء فعلته في حياتك ولم يعرفه أحد؟',
    'ما آخر قرار أخذته وندمت عليه بشدة؟',
    'ما هي الصفة التي تكرهها في نفسك وتتمنى تغييرها؟',
    'هل شعرت يوماً بالظلم تجاه شخص ولم تعتذر له؟',
    'هل أحببت شخصاً من طرف واحد من قبل؟',
    'ما هو الشيء الذي يمثل لك "خطاً أحمر" لا يمكن تجاوزه؟',
    'من هو أول شخص يخطر على بالك عند وقوعك في ضيق؟',
    'إذا خيرت بين المال والراحة، ماذا تختار بكل صراحة؟',
    'ما هي الفكرة المجنونة التي تراودك دائماً؟',
    'هل شعرت يوماً بالندم لأنك ساعدت شخصاً لا يستحق؟',
    'أوصف حياتك الحالية في كلمة واحدة فقط؟',
    'ما هو الشيء الذي يجعلك لا تستطيع النوم ليلاً؟',
    'هل تعرضت لصدمة عاطفية غيرت مجرى حياتك؟',
    'ماذا ستفعل إذا أتيحت لك فرصة للهجرة دون رجعة؟',
    'هل أنت راضٍ عن نفسك بنسبة كم من 10؟',
    'ما هو الموقف الذي شعرت فيه أنك ضعيف جداً؟',
    'من هو الشخص الذي تود أن تراه يبكي أمامك ولماذا؟',
    'لو عاد بك الزمن، ما هو الشيء الذي لن تفعله أبداً؟',
    'هل تتصنع القوة بينما أنت مكسور من الداخل؟',
    'ما هي العادة التي تود التخلص منها فوراً؟'
  ];

  const question = questions[Math.floor(Math.random() * questions.length)];
  const name = await Users.getNameUser(senderID);

  const msg = `◈ ───『 كـرسـي الـصـراحة ⚔️ 』─── ◈\n\n◯ يـا [ ${name} ]..\n◉ سـؤالـك هـو:\n\n" ${question} "\n\n👈 رُد عـلـى هـذه الـرسـالـة بـإجـابـتـك الـصـريـحـة..\n———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;

  return api.sendMessage(msg, threadID, (error, info) => {
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: senderID,
      question: question
    });
  }, messageID);
};
