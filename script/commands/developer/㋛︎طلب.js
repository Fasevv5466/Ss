// ═══════════════════════════════════════════════════════════
// 👑 KIRA - طلب
// المطور: Ayman ♛
// الوصف: إدارة طلبات الصداقة الخاصة بالبوت (قبول/حذف)
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "طلب",
  aliases: [],
  version: "1.1.0",
  hasPermssion: 2, // للمطور فقط لحماية حساب البوت
  credits: "Ayman ♛",
  description: "إدارة طلبات الصداقة الخاصة بالبوت (قبول/حذف)",
  commandCategory: "developer",
  usages: "إدارة الطلبات",
  cooldowns: 5
};

module.exports.handleReply = async ({ handleReply, event, api }) => {
  const { author, listRequest } = handleReply;
  if (author != event.senderID) return;
  
  const args = event.body.replace(/ +/g, " ").toLowerCase().split(" ");
  const action = args[0];
  
  const form = {
    av: api.getCurrentUserID(),
    fb_api_caller_class: "RelayModern",
    variables: {
      input: {
        source: "friends_tab",
        actor_id: api.getCurrentUserID(),
        client_mutation_id: Math.round(Math.random() * 19).toString()
      },
      scale: 3,
      refresh_num: 0
    }
  };

  const success = [];
  const failed = [];

  if (action === "قبول" || action === "add") {
    form.fb_api_req_friendly_name = "FriendingCometFriendRequestConfirmMutation";
    form.doc_id = "3147613905362928";
  } else if (action === "حذف" || action === "del") {
    form.fb_api_req_friendly_name = "FriendingCometFriendRequestDeleteMutation";
    form.doc_id = "4108254489275063";
  } else {
    return api.sendMessage("◈ ──『 تـنـبـيـه مـلـكـي 』── ◈\n\n◯ يرجى اختيار إجراء صحيح:\n◉ [قبول] أو [حذف] + الرقم أو [الكل]\n———————————————", event.threadID, event.messageID);
  }

  let targetIndexes = args.slice(1);
  if (args[1] === "الكل" || args[1] === "all") {
    targetIndexes = listRequest.map((_, index) => index + 1);
  }

  api.sendMessage(`⏳ جاري تنفيذ الأمر على ${targetIndexes.length} طلب...`, event.threadID);

  for (const index of targetIndexes) {
    const u = listRequest[parseInt(index) - 1];
    if (!u) {
      failed.push(`الرقم ${index} غير موجود`);
      continue;
    }

    form.variables.input.friend_requester_id = u.node.id;
    const currentVars = JSON.stringify(form.variables);

    try {
      const res = await api.httpPost("https://www.facebook.com/api/graphql/", { ...form, variables: currentVars });
      if (JSON.parse(res).errors) failed.push(u.node.name);
      else success.push(u.node.name);
    } catch (e) {
      failed.push(u.node.name);
    }
  }

  const resultMsg = `◈ ───『 نـتـائـج الإدارة ⚖️ 』─── ◈\n\n` +
    `✅ تـم ${action === 'قبول' ? 'قـبـول' : 'حـذف'} (${success.length}) طـلـب:\n${success.join("\n")}\n` +
    `${failed.length > 0 ? `\n❌ فـشـل مـع (${failed.length}) شخص: ${failed.join(", ")}` : ""}\n` +
    `———————————————\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;

  api.sendMessage(resultMsg, event.threadID, event.messageID);
};

module.exports.run = async ({ event, api }) => {
  const moment = require("moment-timezone");
  const { threadID, messageID, senderID } = event;

  const form = {
    av: api.getCurrentUserID(),
    fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
    fb_api_caller_class: "RelayModern",
    doc_id: "4499164963466303",
    variables: JSON.stringify({ input: { scale: 3 } })
  };

  try {
    const response = await api.httpPost("https://www.facebook.com/api/graphql/", form);
    const listRequest = JSON.parse(response).data.viewer.friending_possibilities.edges;

    if (listRequest.length === 0) {
      return api.sendMessage("◈ ──『 تـنـبـيـه 』── ◈\n\n◯ سيدي، لا توجد طلبات صداقة حالياً.\n———————————————", threadID, messageID);
    }

    let msg = "◈ ──『 قـائـمـة الـطـلـبـات 📥 』── ◈\n";
    listRequest.forEach((user, i) => {
      const time = moment(user.time * 1000).tz("Asia/Baghdad").format("DD/MM/YYYY HH:mm:ss");
      msg += `\n${i + 1}. الإسم: ${user.node.name}\n🆔 الآيدي: ${user.node.id}\n⏰ الوقت: ${time}\n`;
    });

    msg += `\n———————————————\n👈 رد عـلـى الـرسـالـة بـ:\n[قبول] أو [حذف] + الرقم (أو كلمة الكل)\n│←› بـأوامـر: الـتـوب أيـمـن 👑`;

    api.sendMessage(msg, threadID, (e, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        listRequest,
        author: senderID
      });
    }, messageID);

  } catch (err) {
    api.sendMessage("⚠️ عذراً سيدي، حدث خطأ أثناء جلب الطلبات.", threadID, messageID);
  }
};
