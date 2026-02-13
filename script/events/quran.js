const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");

module.exports.config = {
    name: "quran_auto",
    version: "3.0.0",
    credits: "KIRA SYSTEM",
    description: "إرسال مقاطع قرآنية تلقائية (114 سورة) كل 60-90 دقيقة"
};

const quranData = {
    reciter: "ياسر الدوسري",
    baseUrl: "https://server11.mp3quran.net/yasser/",
    surahs: [
        { n: "001", s: "الفاتحة" }, { n: "002", s: "البقرة" }, { n: "003", s: "آل عمران" }, { n: "004", s: "النساء" }, { n: "005", s: "المائدة" },
        { n: "006", s: "الأنعام" }, { n: "007", s: "الأعراف" }, { n: "008", s: "الأنفال" }, { n: "009", s: "التوبة" }, { n: "010", s: "يونس" },
        { n: "011", s: "هود" }, { n: "012", s: "يوسف" }, { n: "013", s: "الرعد" }, { n: "014", s: "إبراهيم" }, { n: "015", s: "الحجر" },
        { n: "016", s: "النحل" }, { n: "017", s: "الإسراء" }, { n: "018", s: "الكهف" }, { n: "019", s: "مريم" }, { n: "020", s: "طه" },
        { n: "021", s: "الأنبياء" }, { n: "022", s: "الحج" }, { n: "023", s: "المؤمنون" }, { n: "024", s: "النور" }, { n: "025", s: "الفرقان" },
        { n: "026", s: "الشعراء" }, { n: "027", s: "النمل" }, { n: "028", s: "القصص" }, { n: "029", s: "العنكبوت" }, { n: "030", s: "الروم" },
        { n: "031", s: "لقمان" }, { n: "032", s: "السجدة" }, { n: "033", s: "الأحزاب" }, { n: "034", s: "سبأ" }, { n: "035", s: "فاطر" },
        { n: "036", s: "يس" }, { n: "037", s: "الصافات" }, { n: "038", s: "ص" }, { n: "039", s: "الزمر" }, { n: "040", s: "غافر" },
        { n: "041", s: "فصلت" }, { n: "042", s: "الشورى" }, { n: "043", s: "الزخرف" }, { n: "044", s: "الدخان" }, { n: "045", s: "الجاثية" },
        { n: "046", s: "الأحقاف" }, { n: "047", s: "محمد" }, { n: "048", s: "الفتح" }, { n: "049", s: "الحجرات" }, { n: "050", s: "ق" },
        { n: "051", s: "الذاريات" }, { n: "052", s: "الطور" }, { n: "053", s: "النجم" }, { n: "054", s: "القمر" }, { n: "055", s: "الرحمن" },
        { n: "056", s: "الواقعة" }, { n: "057", s: "الحديد" }, { n: "058", s: "المجادلة" }, { n: "059", s: "الحشر" }, { n: "060", s: "الممتحنة" },
        { n: "061", s: "الصف" }, { n: "062", s: "الجمعة" }, { n: "063", s: "المنافقون" }, { n: "064", s: "التغابن" }, { n: "065", s: "الطلاق" },
        { n: "066", s: "التحريم" }, { n: "067", s: "الملك" }, { n: "068", s: "القلم" }, { n: "069", s: "الحاقة" }, { n: "070", s: "المعارج" },
        { n: "071", s: "نوح" }, { n: "072", s: "الجن" }, { n: "073", s: "المزمل" }, { n: "074", s: "المدثر" }, { n: "075", s: "القيامة" },
        { n: "076", s: "الإنسان" }, { n: "077", s: "المرسلات" }, { n: "078", s: "النبأ" }, { n: "079", s: "النازعات" }, { n: "080", s: "عبس" },
        { n: "081", s: "التكوير" }, { n: "082", s: "الانفطار" }, { n: "083", s: "المطففين" }, { n: "084", s: "الانشقاق" }, { n: "085", s: "البروج" },
        { n: "086", s: "الطارق" }, { n: "087", s: "الأعلى" }, { n: "088", s: "الغاشية" }, { n: "089", s: "الفجر" }, { n: "090", s: "البلد" },
        { n: "091", s: "الشمس" }, { n: "092", s: "الليل" }, { n: "093", s: "الضحى" }, { n: "094", s: "الشرح" }, { n: "095", s: "التين" },
        { n: "096", s: "العلق" }, { n: "097", s: "القدر" }, { n: "098", s: "البينة" }, { n: "099", s: "الزلزلة" }, { n: "100", s: "العاديات" },
        { n: "101", s: "القارعة" }, { n: "102", s: "التكاثر" }, { n: "103", s: "العصر" }, { n: "104", s: "الهمزة" }, { n: "105", s: "الفيل" },
        { n: "106", s: "قريش" }, { n: "107", s: "الماعون" }, { n: "108", s: "الكوثر" }, { n: "109", s: "الكافرون" }, { n: "110", s: "النصر" },
        { n: "111", s: "المسد" }, { n: "112", s: "الإخلاص" }, { n: "113", s: "الفلق" }, { n: "114", s: "الناس" }
    ]
};

module.exports.onLoad = async function ({ api }) {
    console.log("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬: تم تشغيل النظام التلقائي لـ 114 سورة.");
    
    // فحص جميع الجروبات وتفعيل الدائرة التلقائية
    const threads = await api.getThreadList(100, null, ["INBOX"]);
    threads.forEach(t => {
        if (t.isGroup) {
            scheduleAutoSend(api, t.threadID);
        }
    });
};

async function scheduleAutoSend(api, threadID) {
    // وقت عشوائي بين 60 و 90 دقيقة
    const waitTime = (Math.floor(Math.random() * (90 - 60 + 1)) + 60) * 60 * 1000;

    setTimeout(async () => {
        await processAndSend(api, threadID);
        scheduleAutoSend(api, threadID);
    }, waitTime);
}

async function processAndSend(api, threadID) {
    try {
        const surah = quranData.surahs[Math.floor(Math.random() * quranData.surahs.length)];
        const duration = Math.floor(Math.random() * (90 - 60 + 1)) + 60;
        const audioUrl = `${quranData.baseUrl}${surah.n}.mp3`;

        const cachePath = path.join(__dirname, "cache");
        if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);

        const input = path.join(cachePath, `in_${Date.now()}.mp3`);
        const output = path.join(cachePath, `out_${Date.now()}.mp3`);

        const res = await axios.get(audioUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(input, Buffer.from(res.data));

        ffmpeg(input)
            .setStartTime(Math.floor(Math.random() * 30)) // بداية عشوائية بسيطة
            .setDuration(duration)
            .save(output)
            .on('end', async () => {
                await api.sendMessage({
                    body: `⌬ ━━ 𝗞𝗜𝗥𝗔 𝗤𝗨𝗥𝗔𝗡 ━━ ⌬\n\n📖 سورة: ${surah.s}\n🎙️ القارئ: ${quranData.reciter}\n⏱️ المقطع: ${duration} ثانية\n\n⌬ ━━━━━━━━━━━━ ⌬`,
                    attachment: fs.createReadStream(output)
                }, threadID);
                fs.unlinkSync(input);
                fs.unlinkSync(output);
            })
            .on('error', () => fs.unlinkSync(input));

    } catch (err) { console.error(err); }
}

module.exports.run = async function({}) {}; 
