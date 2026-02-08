const fs = require("fs-extra");
const axios = require("axios");

// ═══════════════════════════════════════════════════════════
// 👑 KIRA - لعبة احزر العلم
// المطور: Ayman ♛
// الوصف: لعبة تفاعلية لتخمين أعلام الدول
// ═══════════════════════════════════════════════════════════

module.exports.config = {
    name: "اعلام",
    aliases: ["علم", "flag", "flags"],
    version: "3.0.0",
    hasPermssion: 0,
    credits: "Ayman ♛",
    description: "🎯 لعبة احزر العلم - جوائز ومكافآت",
    commandCategory: "games",
    usages: ".اعلام",
    cooldowns: 5
};

const CACHE_DIR = __dirname + "/cache";
fs.ensureDirSync(CACHE_DIR);

// قاعدة بيانات الأعلام الموسعة
const FLAGS = [
    // دول عربية
    { image: "https://i.pinimg.com/originals/6f/a0/39/6fa0398e640e5545d94106c2c42d2ff8.jpg", answer: "العراق", difficulty: 1 },
    { image: "https://i.pinimg.com/originals/66/38/a1/6638a104725f4fc592c1b832644182cc.jpg", answer: "فلسطين", difficulty: 1 },
    { image: "https://i.pinimg.com/originals/f9/47/0e/f9470ea33ff6fbf794b0b8bb00a5ccb4.jpg", answer: "المغرب", difficulty: 1 },
    { image: "https://i.pinimg.com/564x/72/d7/d9/72d7d9586177d3cd05adbd0d9f494b20.jpg", answer: "السعودية", difficulty: 1 },
    { image: "https://i.pinimg.com/564x/e1/2d/13/e12d13ee06067dc324086ac1cf699a4f.jpg", answer: "تونس", difficulty: 1 },
    { image: "https://i.pinimg.com/564x/21/47/ba/2147ba2a3780fb5b9395af5a0eb30deb.jpg", answer: "سوريا", difficulty: 1 },
    { image: "https://i.pinimg.com/564x/a9/e9/c3/a9e9c3a54aa9fbe2400cc85c8dc45dc3.jpg", answer: "ليبيا", difficulty: 1 },
    { image: "https://i.pinimg.com/564x/2d/2d/6e/2d2d6ec65a733e1a04c4442ed1aad404.jpg", answer: "الكويت", difficulty: 1 },
    { image: "https://i.pinimg.com/564x/94/46/15/94461526e1bdd96f36daf2a788c51ea7.jpg", answer: "الاردن", difficulty: 1 },
    { image: "https://i.pinimg.com/564x/41/cf/c8/41cfc821d08adfdee59d6a3503ba0c0b.jpg", answer: "لبنان", difficulty: 1 },
    { image: "https://i.pinimg.com/originals/e8/8e/e7/e88ee7f3ba7ff9181aabdd9520bdfa64.jpg", answer: "الجزائر", difficulty: 1 },
    { image: "https://i.pinimg.com/564x/d0/da/17/d0da173c43093d6dd7d557bdbc8fef65.jpg", answer: "السودان", difficulty: 1 },
    { image: "https://i.pinimg.com/originals/2d/a2/6e/2da26e58efd5f32fe2e33b9654907ab5.gif", answer: "الصومال", difficulty: 2 },
    { image: "https://i.pinimg.com/564x/03/d1/24/03d1245ce41669d15ab285c31e1b2b4c.jpg", answer: "موريتانيا", difficulty: 2 },
    
    // دول عالمية
    { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/256px-Flag_of_Brazil.svg.png", answer: "البرازيل", difficulty: 1 },
    { image: "https://i.pinimg.com/originals/0e/10/d2/0e10d2240dd28af2eff27ce0fa8b5b8d.jpg", answer: "اليابان", difficulty: 1 },
    { image: "https://i.pinimg.com/564x/69/b2/0a/69b20a2431b0f6105661f1d4d5d7509c.jpg", answer: "كوريا", difficulty: 1 },
    { image: "https://i.pinimg.com/236x/53/76/b4/5376b4793712faa060cabb4fe8e85b20.jpg", answer: "الصين", difficulty: 1 },
    { image: "https://i.pinimg.com/564x/8a/40/f6/8a40f62eadc052d92641ec1f32f67053.jpg", answer: "الارجنتين", difficulty: 1 },
    { image: "https://i.pinimg.com/236x/c8/aa/36/c8aa36dadd87d63233ef72e84aebe694.jpg", answer: "كندا", difficulty: 1 },
    { image: "https://i.pinimg.com/564x/d3/28/0f/d3280f4c8423cb190eebadd0acc6c88e.jpg", answer: "فرنسا", difficulty: 1 },
    { image: "https://i.pinimg.com/236x/8f/ef/24/8fef241778c6e4c6bfcdab543567adff.jpg", answer: "امريكا", difficulty: 1 },
    { image: "https://i.pinimg.com/564x/49/1d/40/491d4027acb78b7d4bad83ed011cb0db.jpg", answer: "البوسنة", difficulty: 2 }
];

module.exports.handleReply = async function ({ api, event, handleReply, Currencies, Users }) {
    const { threadID, messageID, senderID, body } = event;
    
    if (event.senderID !== handleReply.author) return;
    
    const userAnswer = body.trim().toLowerCase();
    const correctAnswer = handleReply.correctAnswer.toLowerCase();
    const userName = await Users.getNameUser(senderID);
    
    try {
        if (userAnswer === correctAnswer || 
            userAnswer.includes(correctAnswer) || 
            correctAnswer.includes(userAnswer)) {
            
            // حساب الجائزة حسب الصعوبة
            const reward = handleReply.difficulty === 1 ? 100 : 200;
            
            await Currencies.increaseMoney(senderID, reward);
            
            const AYMAN_ID = "61577861540407";
            const message = senderID === AYMAN_ID
                ? `💖 ───『 إجابة صحيحة 』─── 💖

🎉 رائع يا أيمن! إجابتك صحيحة!
🏆 الجواب: ${handleReply.correctAnswer}
💰 المكافأة: ${reward} دينار

💖 ─── فخورة بك - كيرا ─── 💖`
                : `◈ ───『 إجابة صحيحة 』─── ◈

🎉 ممتاز ${userName}!
🏆 الجواب: ${handleReply.correctAnswer}
💰 المكافأة: ${reward} دينار

◈ ────── كيرا ────── ◈`;
            
            api.sendMessage(message, threadID, messageID);
            api.unsendMessage(handleReply.messageID);
            
        } else {
            api.sendMessage(
                `❌ خطأ! حاول مرة أخرى\n💡 تلميح: يبدأ بحرف "${handleReply.correctAnswer.charAt(0)}"`,
                threadID,
                messageID
            );
        }
        
        // حذف الصورة المؤقتة
        const imagePath = `${CACHE_DIR}/flag_${handleReply.author}.jpg`;
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        
    } catch (error) {
        console.error("Flag Game Error:", error);
    }
};

module.exports.run = async function ({ api, event, Users }) {
    const { threadID, messageID, senderID } = event;
    
    try {
        // اختيار علم عشوائي
        const randomFlag = FLAGS[Math.floor(Math.random() * FLAGS.length)];
        const imagePath = `${CACHE_DIR}/flag_${senderID}.jpg`;
        
        // تحميل الصورة
        const response = await axios.get(randomFlag.image, {
            responseType: "arraybuffer",
            timeout: 15000
        });
        
        fs.writeFileSync(imagePath, Buffer.from(response.data));
        
        const userName = await Users.getNameUser(senderID);
        const AYMAN_ID = "61577861540407";
        
        const message = senderID === AYMAN_ID
            ? `💖 ───『 لعبة الأعلام 』─── 💖

🎮 تحدي جديد لك يا أيمن!
🏁 ما هي الدولة صاحبة هذا العلم؟

💰 الجائزة: ${randomFlag.difficulty === 1 ? "100" : "200"} دينار
⏱️ الوقت: 60 ثانية

💖 ─── بالتوفيق - كيرا ─── 💖`
            : `◈ ───『 🏁 لعبة الأعلام 』─── ◈

👤 اللاعب: ${userName}
🎯 احزر اسم الدولة!

💰 الجائزة: ${randomFlag.difficulty === 1 ? "100" : "200"} دينار
⏱️ الوقت: 60 ثانية
📊 الصعوبة: ${randomFlag.difficulty === 1 ? "⭐ سهل" : "⭐⭐ متوسط"}

◈ ────── كيرا ────── ◈`;
        
        const sentMessage = await api.sendMessage(
            {
                body: message,
                attachment: fs.createReadStream(imagePath)
            },
            threadID
        );
        
        global.client.handleReply.push({
            name: this.config.name,
            messageID: sentMessage.messageID,
            author: senderID,
            correctAnswer: randomFlag.answer,
            difficulty: randomFlag.difficulty
        });
        
        // حذف تلقائي بعد 60 ثانية
        setTimeout(() => {
            api.unsendMessage(sentMessage.messageID);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
            
            // إزالة من handleReply
            const index = global.client.handleReply.findIndex(
                reply => reply.messageID === sentMessage.messageID
            );
            if (index !== -1) {
                global.client.handleReply.splice(index, 1);
            }
        }, 60000);
        
    } catch (error) {
        console.error("Flag Game Start Error:", error);
        return api.sendMessage(
            "❌ حدث خطأ أثناء بدء اللعبة! حاول مرة أخرى.",
            threadID,
            messageID
        );
    }
};
