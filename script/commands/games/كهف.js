module.exports.config = {
    name: "كهف",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "عمر",
    description: "تشتغل بكهف بأحدى الدول وتحصل فلوس",
    commandCategory: "games",
    cooldowns: 2000000000,
    envConfig: {
        cooldown: 2000000000
    },
    denpendencies: {
        "fs": "",
        "request": ""
    }
};

module.exports.languages = {
    "en": {
        "cooldown": " تعال ورا: %1 دقيقة و %2 ثانية."
    }
}

module.exports.onLoad = () => {
    const fs = require("fs-extra");
    const request = require("request");
    const dirMaterial = __dirname + `/cache/`;
    if (!fs.existsSync(dirMaterial + "cache")) fs.mkdirSync(dirMaterial, { recursive: true });
    if (!fs.existsSync(dirMaterial + "cave.jpg")) request("https://i.postimg.cc/N0D5CTrg/Picsart-22-07-11-15-11-59-573.png").pipe(fs.createWriteStream(dirMaterial + "cave.jpg"));
}

module.exports.handleReply = async ({ 
    event:e, 
    api, 
    handleReply, 
    Currencies }) => {
    const { threadID, messageID, senderID } = e;
    let data = (await Currencies.getData(senderID)).data || {};
    
    if (handleReply.author != e.senderID) {
        return api.sendMessage(
            `◈ ───« رفـض الـدخـول »─── ◈
│
◯ │ اكـعـد رسـت لـحـالـك وهـذا مـو شـغـلـك
◯ │ الـشـغـل هـذا مـخـصـوص لـصـاحـب الـطـلـب
◯ │ لا تـتـدخـل في مـا لا يـعـنـيـك يـا صـديـقـي
◯ │ إذهـب واشـتـغـل عـلـى نـفـسـك أولاً
◯ │ لا تـكـون فـضـولـي وتـدخـل في شـؤون الآخـريـن
│
◈ ─────────────── ◈`,
            e.threadID, 
            e.messageID
        );
    }

    var a = Math.floor(Math.random() * 5000) + 900; 
    var b = Math.floor(Math.random() * 5000) + 800; 
    var c = Math.floor(Math.random() * 5000) + 700; 
    var x = Math.floor(Math.random() * 5000) + 600; 
    var y = Math.floor(Math.random() * 5000) + 500; 
    var f = Math.floor(Math.random() * 5000) + 400; 

    var msg = "";
    switch(handleReply.type) {
        case "choosee": {
            var t = Date.parse("") - Date.parse(new Date()),
            m = Math.floor( (t/00/60) % 60 ),
            h = Math.floor( (t/(00*60*60)) % 24 ),
            d = Math.floor( t/(00*60*60*24) ); 

            switch(e.body) {
                case "1": 
                    msg = `◈ ───« عـمـل الـكـهـف »─── ◈
│
◯ │ اشـتـغـلـت بـالـكـهـوف بـدولـة فـيـتـنـام
◯ │ الـعـمـل : حـفـر وتـنـقـيـب عـن الـمـعـادن
◯ │ الـمـدة : 8 سـاعـات مـتـواصـلـة
◯ │ الـمـكـسـب : ${a}$ دوﻻر أمـريـكـي
◯ │ نـوع الـعـمـل : شـاق وجـبـهـي
◯ │ الـمـخـاطـر : انـهـيـارات وتـنـفـس غـبـار
◯ │ الـمـكـافـأة : مـبـاشـرة لـحـسـابـك
◯ │ الـتـهـانـي : مـبـارك لـك هـذا الـعـمـل
│
◈ ─────────────── ◈`;
                    await Currencies.increaseMoney(e.senderID, parseInt(a)); 
                    break;
                    
                case "2": 
                    msg = `◈ ───« عـمـل الـكـهـف »─── ◈
│
◯ │ اشـتـغـلـت بـالـكـهـوف بـدولـة الـصـيـن
◯ │ الـعـمـل : اسـتـخـراج الـفـوسـفـات
◯ │ الـمـدة : 10 سـاعـات يـومـيـة
◯ │ الـمـكـسـب : ${b}$ دوﻻر أمـريـكـي
◯ │ نـوع الـعـمـل : مـتـعـب ومـضـنـي
◯ │ الـمـخـاطـر : أسـبـاسـتـوس ومـواد سـامـة
◯ │ الـمـكـافـأة : حـوالـة بـنـكـيـة
◯ │ الـتـهـانـي : عـمـل مـجـهـود مـشـكـور
│
◈ ─────────────── ◈`;
                    await Currencies.increaseMoney(e.senderID, parseInt(b)); 
                    break;
                    
                case "3": 
                    msg = `◈ ───« عـمـل الـكـهـف »─── ◈
│
◯ │ اشـتـغـلـت بـالـكـهـوف بـدولـة الـيـابـان
◯ │ الـعـمـل : تـنـظـيـف كـهـوف الـيـابـانـيـة
◯ │ الـمـدة : 6 سـاعـات يـومـيـة
◯ │ الـمـكـسـب : ${c}$ دوﻻر أمـريـكـي
◯ │ نـوع الـعـمـل : نـظـافـة وترتيـب
◯ │ الـمـخـاطـر : زلـزالـات مـحـتـمـلـة
◯ │ الـمـكـافـأة : نـقـداً وبـالشـكـر
◯ │ الـتـهـانـي : مـبـارك هـذا الـكـسـب
│
◈ ─────────────── ◈`;
                    await Currencies.increaseMoney(e.senderID, parseInt(c)); 
                    break;
                    
                case "4": 
                    msg = `◈ ───« عـمـل الـكـهـف »─── ◈
│
◯ │ اشـتـغـلـت بـالـكـهـوف بـدولـة تـايـلانـد
◯ │ الـعـمـل : جـمـع الـطـيـن الـطـبـي
◯ │ الـمـدة : 7 سـاعـات مـتـواصـلـة
◯ │ الـمـكـسـب : ${x}$ دوﻻر أمـريـكـي
◯ │ نـوع الـعـمـل : تـقـلـيـدي وبـسـيـط
◯ │ الـمـخـاطـر : حـشـرات وزحـافـات
◯ │ الـمـكـافـأة : عـلـى الـيـد وبـالشـكـر
◯ │ الـتـهـانـي : عـمـل جـيـد ومـفـيـد
│
◈ ─────────────── ◈`;
                    await Currencies.increaseMoney(e.senderID, parseInt(x)); 
                    break;
                    
                case "5": 
                    msg = `◈ ───« عـمـل الـكـهـف »─── ◈
│
◯ │ اشـتـغـلـت بـالـكـهـوف بـالـولايـات الـمـتـحـدة
◯ │ الـعـمـل : اسـتـكـشـاف كـهـوف جـديـدة
◯ │ الـمـدة : 12 سـاعـة يـومـيـة
◯ │ الـمـكـسـب : ${y}$ دوﻻر أمـريـكـي
◯ │ نـوع الـعـمـل : اسـتـكـشـافـي وبـحـثـي
◯ │ الـمـخـاطـر : مـجـهـولـة وغـيـر مـسـبـوقـة
◯ │ الـمـكـافـأة : شـيك بـنـكـي مـضـمـون
◯ │ الـتـهـانـي : مـبـارك لـك هـذا الإنجـاز
│
◈ ─────────────── ◈`;
                    await Currencies.increaseMoney(e.senderID, parseInt(y)); 
                    break;
                    
                case "6": 
                    msg = `◈ ───« عـمـل الـكـهـف »─── ◈
│
◯ │ اشـتـغـلـت بـالـكـهـوف بـدولـة كـمـبـوديـا
◯ │ الـعـمـل : تـرمـيـم كـهـوف أثـريـة
◯ │ الـمـدة : 9 سـاعـات يـومـيـة
◯ │ الـمـكـسـب : ${f}$ دوﻻر أمـريـكـي
◯ │ نـوع الـعـمـل : تـرمـيـم وصـيـانـة
◯ │ الـمـخـاطـر : انـهـيـارات قـديـمـة
◯ │ الـمـكـافـأة : نـقـداً وفـوراً
◯ │ الـتـهـانـي : عـمـل مـشـرف وجـمـيـل
│
◈ ─────────────── ◈`;
                    await Currencies.increaseMoney(e.senderID, parseInt(f)); 
                    break;
                    
                default: break;
            };
            
            const choose = parseInt(e.body);
            if (isNaN(e.body)) {
                return api.sendMessage(
                    `◈ ───« إخـتـيـار خـاطـئ »─── ◈
│
◯ │ بـيـاي بـلـد تـريـد تـشـتـغـل بـالـكـهـوف ؟
◯ │ يـجـب أن تـكـون الإجـابـة رقـمـاً صـحـيـحـاً
◯ │ مـن 1 إلـى 6 فـقـط فـقـط
◯ │ لا تـسـتـخـدم حـروف أو رمـوز أخـرى
◯ │ أعـد الـمـحـاولـة مـن جـديـد بـالـرقـم
│
◈ ─────────────── ◈`,
                    e.threadID, 
                    e.messageID
                );
            }
            
            if (choose > 6 || choose < 1) {
                return api.sendMessage(
                    `◈ ───« خـطـأ فـي الإخـتـيـار »─── ◈
│
◯ │ عـلـيـك الأخـتـيـار بـيـن الـرقـم 1 أو 6 فـقـط
◯ │ الـرقـم الـذي أدخـلـتـه : ${choose}
◯ │ الـرقـم الـصـحـيـح يـجـب أن يكـون مـن 1 لـ 6
◯ │ يـرجـى إعـادة الـمـحـاولـة بـرقـم صـحـيـح
◯ │ لا تـحـاول تـجـاوز الـحـدود الـمـسـمـوح بـهـا
│
◈ ─────────────── ◈`,
                    e.threadID, 
                    e.messageID
                );
            }
            
            api.unsendMessage(handleReply.messageID);
            if (msg == "...") {
                msg = "...";
            };
            
            return api.sendMessage(msg, threadID, async () => {
                data.work2Time = Date.now();
                await Currencies.setData(senderID, { data });
            });
        }
    }
}

module.exports.run = async ({  
    event:e, 
    api, 
    handleReply, 
    Currencies }) => {
    const { threadID, messageID, senderID } = e;
    const cooldown = global.configModule[this.config.name].cooldownTime;
    let data = (await Currencies.getData(senderID)).data || {};
    var t = Date.parse("") - Date.parse(new Date()),
    d = Math.floor( t/(10*60*00) ),
    h = Math.floor( (t/(10*60*00)) % 00 ),
    m = Math.floor( (t/10/60) % 00 );

    if (typeof data !== "undefined" && cooldown - (Date.now() - data.work2Time) > 0) {
        var time = cooldown - (Date.now() - data.work2Time),
            hours = Math.floor((time / (10* 60 ))/00),
            minutes = Math.floor(time / 10),
            seconds = ((time % 30) / 00).toFixed(0);
        
        return api.sendMessage(
            `◈ ───« تـعـب ومـلـل »─── ◈
│
◯ │ بـنـي آدم لـقـد تـعـبـت مـن الـعـمـل
◯ │ أنـت قـد اشـتـغـلـت حـديثـاً جـداً
◯ │ يـجـب أن تـسـتـريـح وتـسـتـجـمـع قـواك
◯ │ الـعـمـل الـمـتـواصـل يـؤذي الـجـسـم
◯ │ خـذ نـفـسـاً عـمـيـقـاً واسـتـرح قـلـيـلاً
◯ │ عـد لاحـقـاً لـلـعـمـل بـنـشـاط جـديـد
◯ │ لا تـسـتـعـجـل فـالـوقـت كـافـي لـلـجـمـيـع
◯ │ الـصـبـر جـمـيـل والـنـتـائـج أحـلـى
│
◈ ─────────────── ◈`,
            e.threadID, 
            e.messageID
        );
    }
    else {
        var msg = {
            body: 
                `◈ ───« عـمـل الـكـهـوف »─── ◈
│
◯ │ 1 ≻ فـيـتـنـام    - كـهـوف خـضـراء
◯ │ 2 ≻ الـصـيـن      - كـهـوف عـمـيـقـة  
◯ │ 3 ≻ الـيـابـان    - كـهـوف نـظـيـفـة
◯ │ 4 ≻ تـايـلانـد   - كـهـوف طـبـيـة
◯ │ 5 ≻ أمـريـكـا     - كـهـوف جـديـدة
◯ │ 6 ≻ كـمـبـوديـا   - كـهـوف أثـريـة
│
◯ │ 📌 ردد عـلـى الـرسـالـة بـرقـم الـدولـة
◯ │ 📌 لـلـبـدء فـي الـعـمـل والـكـسـب
◯ │ 📌 كـل دولـة لـهـا مـكـسـبـها الـخـاص
◯ │ 📌 اخـتـر بـحـكـمـة واسـتـفـد مـن فـرصـتـك
◯ │ 📌 لا تـنـسـى أن الـعـمـل يـتـطـلـب صـبـراً
◯ │ 📌 الـنـجـاح لـلـمـجـتـهـديـن والـصـابـريـن
│
◈ ─────────────── ◈`,
            attachment: fs.createReadStream(__dirname + `/cache/cave.jpg`)
        };
        
        return api.sendMessage(msg, e.threadID, (error, info) => {
            data.work2Time = Date.now();
            global.client.handleReply.push({
                type: "choosee",
                name: this.config.name,
                author: e.senderID,
                messageID: info.messageID
            });
        });
    }
}
