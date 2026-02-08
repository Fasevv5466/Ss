// ═══════════════════════════════════════════════════════════
// 👑 KIRA - ريأكت
// المطور: Ayman ♛
// الوصف: ردود البوت
// ═══════════════════════════════════════════════════════════

module.exports.config = {
  name: "ريأكت",
  aliases: [],
  version: "1.1.1",
  hasPermission: 2,
	prefix: false,
  credits: "Ayman ♛", description: "ردود البوت",   commandCategory: "utility", cooldowns: 0, }; const fs = require("fs");

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) { var { threadID, messageID } = event; let react = event.body.toLowerCase();

 
if (
	react.includes("ضحك") ||
	react.includes("وسخ") ||
	react.includes("غبي") ||
	react.includes("معتوه") ||
	react.includes("كلب") ||
	react.includes("🤡") ||
	react.includes("دراسه") ||
	react.includes("شيت") ||
	react.includes("لول") ||
	react.includes("جراده") ||
	react.includes("عفن") ||
	react.includes("🙂") ||
	react.includes("خرا") ||
	react.includes("خنزير") ||
	react.includes("ملل") ||
	react.includes("طيز") ||
	react.includes("حزن") ||
	react.includes("سكس") ||
	react.includes("عععع") ||
	react.includes("يع") ||
	react.includes("فك يو") ||
	react.includes("تغير") ||
	react.includes("sus") ||
	react.includes("بيض") ||
	react.includes("كلبه") ||
	react.includes("يبنلل") ||
	react.includes("كلاون") ||
	react.includes("كرنج") ||
	react.includes("ساس") ||
	react.includes("😂") ||
	react.includes("lol") ||
	react.includes("wtf") ||
	react.includes("شلل") ||
	react.includes("روعب") ||
	react.includes("يمهه") ||
	react.includes("زباله") ||
	react.includes("هععع") ||
	react.includes("تراش") ||
	react.includes("نام") ||
	react.includes("عيب") ||
	react.includes("هنيكك") ||
	react.includes("انيكك") ||
	react.includes("هسبك") ||
	react.includes("كيفكم") ||
	react.includes("حيوان") ||
	react.includes("حءير") ||
	react.includes("الرفاق") ||
	react.includes("الحياه")
) {
	var msg = {
		body: "",
	};
	api.sendMessage(msg, threadID, messageID);
	api.setMessageReaction("😆", event.messageID, (err) => {}, true);
}

if (
	react.includes("الله") ||
	react.includes("النبي") ||
	react.includes("الحب") ||
	react.includes("كيف") ||
	react.includes("دومك") ||
	react.includes("👀") ||
	react.includes("امي") ||
	react.includes("رمضان") ||
	react.includes("قرأن") ||
	react.includes("دعاء") ||
	react.includes("قبله") ||
	react.includes("عناق") ||
	react.includes("بوت") ||
	react.includes("شادو") ||
	react.includes("المطور") ||
	react.includes("منور") ||
	react.includes("الموافقه") ||
	react.includes("المجموعات") ||
	react.includes("اوامر") ||
	react.includes("القاءمه") ||
	react.includes("زواج") ||
	react.includes("الحب") ||
	react.includes("love") ||
	react.includes("sleep") ||
	react.includes("نوم") ||
	react.includes("نام") ||
	react.includes("eat") ||
	react.includes("افطر") ||
	react.includes("اتغذي") ||
	react.includes("عشاء") ||
	react.includes("فطور") ||
	react.includes("فجر") ||
	react.includes("سراب") ||
	react.includes("صبح") ||
	react.includes("ظهر") ||
	react.includes("عصر") ||
	react.includes("مغرب") ||
	react.includes("الجروب") ||
	react.includes("الفيلق") ||
	react.includes("🤧") ||
	react.includes("💞") ||
	react.includes("🌿") ||
	react.includes("💆") ||
	react.includes("❤️") ||
	react.includes("احترام") ||
	react.includes("تقدير") ||
	react.includes("حكي") ||
	react.includes("🙃") ||
	react.includes("كرامه") ||
	react.includes("رسل") ||
	react.includes("مرتي") ||
	react.includes("ادمن") ||
	react.includes("طفل") ||
	react.includes("حياتي") ||
	react.includes("ءلبي") ||
	react.includes("طفلتي") ||
	react.includes("عقلي") ||
	react.includes("قلبي") ||
	react.includes("روحي") ||
	react.includes("كيوتتي") ||
	react.includes("تدلل") ||
	react.includes("حبي") ||
	react.includes("الزواج") ||
	react.includes("الزواج") ||
	react.includes("🤭") ||
	react.includes("🌚")
) {
	var lab = {
		body: "",
	};
	api.sendMessage(lab, threadID, messageID);
	api.setMessageReaction("❤️", event.messageID, (err) => {}, true);
}

if (
	react.includes("حزن") ||
	react.includes("وجع") ||
	react.includes("قرف") ||
	react.includes("تبا") ||
	react.includes("اااخ") ||
	react.includes("🥀") ||
	react.includes("احزان") ||
	react.includes("تعبت") ||
	react.includes("كرهت حياتي") ||
	react.includes("تعبان") ||
	react.includes("حزينه") ||
	react.includes("كسلان") ||
	react.includes("مريض") ||
	react.includes("حزينة") ||
	react.includes("😕") ||
	react.includes("☹️") ||
	react.includes("🥸") ||
	react.includes("👽") ||
	react.includes(":(") ||
	react.includes("👾") ||
	react.includes("🤧") ||
	react.includes("اكتئاب") ||
	react.includes("احباط") ||
	react.includes("عياط") ||
	react.includes("بكا") ||
	react.includes("ببكي") ||
	react.includes("حنيت")
) {
	var sad = {
				body: ""
			}
			api.sendMessage(sad, threadID, messageID);
    api.setMessageReaction("🙁", event.messageID, (err) => {}, true)
          };
    if(react.includes("صباح") || react.includes("مساء") || react.includes("ثبح") || react.includes("سلام") || react.includes("السلام") || react.includes("نمت") || react.includes("صبح") || react.includes("ظهر") || react.includes("عصر") || react.includes("مغرب") || react.includes("عشاء") || react.includes("ليل") || react.includes("نهار")) {
      var heart = {
				body: ""
			}
			api.sendMessage(heart, threadID, messageID);
    api.setMessageReaction("💖", event.messageID, (err) => {}, true)
                }
        }
	module.exports.run = function({ api, event, client, __GLOBAL }) {

  }
 