const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
    name: "سمعني",
    version: "3.5.0",
    hasPermssion: 0,
    credits: "KIRA SYSTEM",
    description: "عرض كافة الأغاني المتاحة أو البحث في المكتبة المحلية",
    commandCategory: "media",
    usages: "[اسم الأغنية] أو بدون إضافات لعرض الكل",
    cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const query = args.join(" ").toLowerCase();
    
    // المسار الخاص بمجلد الأغاني
    const songsDir = path.join(__dirname, "../../commands/media/song"); 
    const header = `⌬ ━━━━━━━━━━━━ ⌬\n      🎵 مـكـتـبـة كـيـرا\n⌬ ━━━━━━━━━━━━ ⌬`;

    try {
        if (!fs.existsSync(songsDir)) {
            return api.sendMessage("❌ مـجـلـد الأغـانـي غـيـر مـوجـود. اسـتـخـدم [جلب_الداتا] أولاً.", threadID, messageID);
        }

        // قراءة كل الملفات الصوتية المتاحة
        const allFiles = fs.readdirSync(songsDir).filter(file => file.endsWith(".mp3") || file.endsWith(".m4a"));

        if (allFiles.length === 0) {
            return api.sendMessage("📭 الـمـكـتـبـة فـارغـة حـالـيـاً.", threadID, messageID);
        }

        let matches;
        let titleMsg;

        if (!query) {
            // إذا لم يكتب المستخدم شيئاً، نعرض أول 20 أغنية متاحة
            matches = allFiles.slice(0, 20);
            titleMsg = `📜 الأغـانـي الـمـتـاحـة فـي الـمـكـتـبـة:`;
        } else {
            // إذا كتب المستخدم نصاً، نبحث عنه
            matches = allFiles.filter(f => f.toLowerCase().includes(query)).slice(0, 20);
            titleMsg = `🔍 نـتـائـج الـبـحـث عـن: [ ${query} ]`;
        }

        if (matches.length === 0) {
            return api.sendMessage(`❌ لـم أجـد أغـانـي تـطـابـق "${query}" فـي الـمـكـتـبـة.`, threadID, messageID);
        }

        // بناء الرسالة
        let msg = `${header}\n${titleMsg}\n\n`;
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
        return api.sendMessage(`⚠️ اخـتـيـار غـيـر صـحـيـح، اخـتـر رقـمـاً مـن الـقـائـمـة.`, threadID, messageID);
    }

    const selectedSong = matches[choice - 1];
    const songPath = path.join(songsDir, selectedSong);

    api.unsendMessage(handleReply.messageID);

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
