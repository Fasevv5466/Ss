/**
 * ═══════════════════════════════════════════════════════════
 * 🛡️ AntiOut Event - نسخة مصححة
 * ═══════════════════════════════════════════════════════════
 * الهيكل: محدّث ليتوافق مع نظام KIRA
 * الوظيفة: منع الخروج من المجموعة وإعادة العضو فوراً
 * ═══════════════════════════════════════════════════════════
 */

const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ═══════════════════════════════════════════════════════════
// 📋 إعدادات الحدث
// ═══════════════════════════════════════════════════════════

module.exports.config = {
    name: "antiout",
    eventType: ["log:unsubscribe"],
    version: "4.0.0",
    credits: "Kira AI - Fixed by Claude",
    description: "منع الخروج من المجموعة وإعادة العضو تلقائياً",
    category: "protection"
};

// ═══════════════════════════════════════════════════════════
// 🎯 تنفيذ الحدث
// ═══════════════════════════════════════════════════════════

module.exports.run = async function({ event, api, Users }) {
    const { threadID, logMessageData, author } = event;
    const leftID = logMessageData.leftParticipantFbId;
    
    console.log("\n🛡️ ═══ AntiOut Event Triggered ═══");
    console.log(`   Left User: ${leftID}`);
    console.log(`   Thread: ${threadID}`);
    console.log(`   Author: ${author}`);

    // تجاهل إذا كان البوت هو من غادر
    if (leftID == api.getCurrentUserID()) {
        console.log("   ⚠️ البوت غادر - تجاهل\n");
        return;
    }

    // تنفيذ إذا كان العضو غادر بنفسه
    if (author == leftID) {
        try {
            // جلب اسم المستخدم
            const userData = await Users.getData(leftID) || {};
            const name = userData.name || "العضو";
            
            console.log(`   👤 اسم العضو: ${name}`);
            console.log(`   🔄 محاولة إعادة العضو...`);
            
            // دالة الزخرفة
            const bold = (text) => {
                try {
                    return global.utils.toBoldSans(text);
                } catch {
                    return text;
                }
            };

            // إعادة العضو للمجموعة
            api.addUserToGroup(leftID, threadID, async (err) => {
                const header = `⌬ ━━━ ${bold("KIRA PROTECT")} ━━━ ⌬`;
                const footer = "⌬ ━━━━━━━━━━━━━━━━ ⌬";
                
                if (err) {
                    console.log(`   ❌ فشلت الإعادة: ${err}\n`);
                    
                    return api.sendMessage(
                        `${header}\n\n` +
                        `⚠️ ${bold("ERROR")}\n\n` +
                        `لم أستطع إعادة 『${name}』\n` +
                        `يبدو أنه أغلق الإضافة أو حظر البوت!\n\n` +
                        `${footer}`,
                        threadID
                    );
                    
                } else {
                    console.log(`   ✅ تمت إعادة العضو بنجاح!\n`);
                    
                    // محاولة إرسال رسالة مع GIF
                    const gifURL = "https://i.imgur.com/kA3qN5T.gif";
                    const cachePath = path.join(process.cwd(), "includes", "handle", "cache");
                    
                    if (!fs.existsSync(cachePath)) {
                        fs.mkdirSync(cachePath, { recursive: true });
                    }
                    
                    const imgPath = path.join(cachePath, `antiout_${leftID}.gif`);
                    const msgBody = `${header}\n\n` +
                                  `🎯 ${bold("NO ESCAPE")}..\n\n` +
                                  `✨ تـمـت إعـادة: [ ${name} ]\n\n` +
                                  `${footer}`;

                    try {
                        // تحميل الصورة
                        const { data } = await axios.get(gifURL, { 
                            responseType: "arraybuffer",
                            timeout: 5000 
                        });
                        
                        fs.writeFileSync(imgPath, Buffer.from(data, "utf-8"));

                        return api.sendMessage({
                            body: msgBody,
                            attachment: fs.createReadStream(imgPath)
                        }, threadID, () => {
                            // حذف الملف بعد الإرسال
                            if (fs.existsSync(imgPath)) {
                                fs.unlinkSync(imgPath);
                            }
                        });
                        
                    } catch (imageError) {
                        console.log(`   ⚠️ فشل تحميل الصورة: ${imageError.message}`);
                        // إرسال الرسالة بدون صورة
                        return api.sendMessage(msgBody, threadID);
                    }
                }
            });
            
        } catch (error) {
            console.error("   ❌ خطأ في AntiOut:", error.message);
            console.error(error.stack + "\n");
        }
    } else {
        console.log("   ℹ️ عضو تم طرده (ليس خروج ذاتي) - تجاهل\n");
    }
};

/**
 * ═══════════════════════════════════════════════════════════
 * 📖 التحسينات في هذه النسخة:
 * ═══════════════════════════════════════════════════════════
 * 
 * ✅ هيكل موحد مع باقي Events
 * ✅ error handling محسّن
 * ✅ logging مفصّل للتتبع
 * ✅ timeout للصور لتجنب التعليق
 * ✅ fallback للرسائل بدون صور
 * ✅ تنظيف الملفات المؤقتة
 * 
 * ═══════════════════════════════════════════════════════════
 */
