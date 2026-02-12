const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "سمعني",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "KIRA SYSTEM",
    description: "البحث في مكتبة الأغاني المحلية واختيارها بالرقم",
    commandCategory: "media",
    usages: "[اسم الأغنية]",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ").toLowerCase();
    
    // المسار اللي حملت فيه الأغاني من GitHub
    const songsDir = path.join(__dirname, "../../commands/media/song"); 
    const header = `⌬ ━━━━━━━━━━━━ ⌬\n      🎵 مـكـتـبـة كـيـرا\n⌬ ━━━━━━━━━━━━ ⌬`;

    if (!query) return api.sendMessage(`${header}\n⚠️ يـرجـى كـتـابـة اسـم الأغـنـيـة لـلـبـحـث!\n${header}`, threadID, messageID);

    try {
        if (!fs.existsSync(songsDir)) {
            return api.sendMessage("❌ مـجـلـد الأغـانـي غـيـر مـوجـود. اسـتـخـدم [جلب_الداتا] أولاً.", threadID, messageID);
        }

        // قراءة كل الملفات في المجلد
        const allFiles = fs.readdirSync(songsDir).filter(file => file.endsWith(".mp3") || file.endsWith(".m4a"));
        
        // البحث عن الأغاني اللي فيها الكلمة المطلوبة
        const matches = allFiles.filter(f => f.toLowerCase().includes(query)).slice(0, 10);

        if (matches.length === 0) {
            return api.sendMessage("❌ لـم أجـد هـذه الأغـنـيـة فـي الـمـكـتـبـة الـمـحـلـيـة.", threadID, messageID);
        }

        // بناء القائمة للمستخدم
        let msg = `${header}\n🔍 نـتـائـج الـبـحـث عـن: [ ${query} ]\n\n`;
        matches.forEach((song, index) => {
            msg += `${index + 1}. 🎵 ${song.replace(/\.(mp3|m4a)/g, "")}\n`;
        });
        msg += `\n⚠️ رد بـرقـم الأغـنـيـة لـتـشـغـيـلـهـا.\n${header}`;

        return api.sendMessage(msg, threadID, (err, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID,
                matches: matches,
                songsDir: songsDir
            });
        }, messageID);

    } catch (e) {
        console.error(e);
        return api.sendMessage("⚠️ حـدث خـطأ فـي قـراءة الـمـكـتـبـة.", threadID, messageID);
    }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
    const { threadID, messageID, body, senderID } = event;
    if (senderID !== handleReply.author) return;

    const choice = parseInt(body);
    const { matches, songsDir } = handleReply;
    const header = `⌬ ━━━━━━━━━━━━ ⌬\n      🎵 مـكـتـبـة كـيـرا\n⌬ ━━━━━━━━━━━━ ⌬`;

    if (isNaN(choice) || choice < 1 || choice > matches.length) {
        return api.sendMessage(`⚠️ اخـتـيـار غـيـر صـحـيـح، اخـتـر مـن 1 إلـى ${matches.length}`, threadID, messageID);
    }

    const selectedSong = matches[choice - 1];
    const songPath = path.join(songsDir, selectedSong);

    api.unsendMessage(handleReply.messageID); // حذف قائمة الخيارات لتنظيف الشات

    try {
        const msg = {
            body: `${header}\n✅ جـاري إرسـال: ${selectedSong.replace(/\.(mp3|m4a)/g, "")}\n${header}`,
            attachment: fs.createReadStream(songPath)
        };
        return api.sendMessage(msg, threadID, messageID);
    } catch (e) {
        return api.sendMessage("❌ فـشـل إرسـال الـمـلـف الـصـوتـي.", threadID, messageID);
    }
};
