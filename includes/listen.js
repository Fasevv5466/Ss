// ════════════════════════════════════════════════════════════
// 📡 Listen.js - نسخة غير مشفرة
// ════════════════════════════════════════════════════════════
// هذا الملف مسؤول عن الاستماع لجميع الرسائل والأحداث
// ════════════════════════════════════════════════════════════

module.exports = function({ api, models }) {
    const { writeFileSync, readFileSync, existsSync, createReadStream, unlinkSync } = require("fs-extra");
    const axios = require("axios");
    const moment = require("moment-timezone");
    const logger = require("../utils/log.js");
    
    // ════════════════════════════════════════════════════════════
    // 🔧 استيراد المعالجات (Handlers)
    // ════════════════════════════════════════════════════════════
    
    const handleCommand = require("./handle/handleCommand")({ api, models });
    const handleCommandEvent = require("./handle/handleCommandEvent")({ api, models });
    const handleReply = require("./handle/handleReply")({ api, models });
    const handleReaction = require("./handle/handleReaction")({ api, models });
    const handleEvent = require("./handle/handleEvent")({ api, models });
    const handleRefresh = require("./handle/handleRefresh")({ api, models });
    const handleCreateDatabase = require("./handle/handleCreateDatabase")({ api, models });
    const handleNotification = require("./handle/handleNotification.js");
    
    // ════════════════════════════════════════════════════════════
    // 📅 نظام التذكيرات والمواعيد
    // ════════════════════════════════════════════════════════════
    
    const pathDataSchedule = __dirname + "/../modules/commands/cache/data/datlich.json";
    
    // وقت الفحص (10 دقائق)
    const checkTime = 10 * 60 * 1000;
    
    // ════════════════════════════════════════════════════════════
    // 🎯 نظام التفاعل اليومي/الأسبوعي (TOP)
    // ════════════════════════════════════════════════════════════
    
    const Users = require("./controllers/users")({ models, api });
    const Threads = require("./controllers/threads")({ models, api });
    const Currencies = require("./controllers/currencies")({ models });
    
    // ════════════════════════════════════════════════════════════
    // 🔢 دالة حساب الوقت بالميلي ثانية
    // ════════════════════════════════════════════════════════════
    
    const monthToMS = [
        null, // الشهر 0 غير موجود
        31 * 24 * 60 * 60 * 1000, // يناير
        28 * 24 * 60 * 60 * 1000, // فبراير
        31 * 24 * 60 * 60 * 1000, // مارس
        30 * 24 * 60 * 60 * 1000, // أبريل
        31 * 24 * 60 * 60 * 1000, // مايو
        30 * 24 * 60 * 60 * 1000, // يونيو
        31 * 24 * 60 * 60 * 1000, // يوليو
        31 * 24 * 60 * 60 * 1000, // أغسطس
        30 * 24 * 60 * 60 * 1000, // سبتمبر
        31 * 24 * 60 * 60 * 1000, // أكتوبر
        30 * 24 * 60 * 60 * 1000, // نوفمبر
        31 * 24 * 60 * 60 * 1000  // ديسمبر
    ];

    // دالة تحويل التاريخ إلى ميلي ثانية
    function calculateTimeMS(timeArray) {
        const [day, month, year, hour, minute, second] = timeArray;
        
        // التحقق من صحة البيانات
        if (day > getDaysInMonth(month, year) || day < 1) {
            throw new Error("اليوم غير صحيح");
        }
        if (month > 12 || month < 1) {
            throw new Error("الشهر غير صحيح");
        }
        if (year < 2000) {
            throw new Error("السنة غير صحيحة");
        }
        if (hour > 23 || hour < 0) {
            throw new Error("الساعة غير صحيحة");
        }
        if (minute > 59 || minute < 0) {
            throw new Error("الدقيقة غير صحيحة");
        }
        if (second > 59 || second < 0) {
            throw new Error("الثانية غير صحيحة");
        }

        // حساب السنوات
        const yearsPassed = year - 2000;
        const yearToMS = yearsPassed * 365 * 24 * 60 * 60 * 1000;
        const leapYears = Math.floor(yearsPassed / 4);
        const leapDaysMS = leapYears * 24 * 60 * 60 * 1000;

        // حساب الأشهر
        let monthMS = 0;
        for (let i = 1; i < month; i++) {
            monthMS += monthToMS[i];
        }
        
        // إضافة يوم إضافي في السنة الكبيسة
        if (year % 4 === 0 && month > 2) {
            monthMS += 24 * 60 * 60 * 1000;
        }

        // حساب الأيام والساعات والدقائق والثواني
        const dayMS = (day - 1) * 24 * 60 * 60 * 1000;
        const hourMS = hour * 60 * 60 * 1000;
        const minuteMS = minute * 60 * 1000;
        const secondMS = second * 1000;
        
        const oneDayMS = 24 * 60 * 60 * 1000;

        return yearToMS + leapDaysMS + monthMS + dayMS + hourMS + minuteMS + secondMS - oneDayMS;
    }

    function getDaysInMonth(month, year) {
        if (month === 2) {
            return (year % 4 === 0) ? 29 : 28;
        }
        return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
    }

    // ════════════════════════════════════════════════════════════
    // ⏰ نظام فحص المواعيد كل 10 دقائق
    // ════════════════════════════════════════════════════════════
    
    const checkSchedules = async () => {
        // إنشاء الملف إذا لم يكن موجوداً
        if (!existsSync(pathDataSchedule)) {
            writeFileSync(pathDataSchedule, JSON.stringify({}, null, 4));
        }

        let schedules = JSON.parse(readFileSync(pathDataSchedule));
        const currentTime = moment().tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY_HH:mm:ss");
        const [currentDay, currentMonth, currentYear, currentHour, currentMinute, currentSecond] = 
            currentTime.split(/[_/:]/);
        
        let currentTimeMS = calculateTimeMS([
            parseInt(currentDay),
            parseInt(currentMonth),
            parseInt(currentYear),
            parseInt(currentHour),
            parseInt(currentMinute),
            parseInt(currentSecond)
        ]);

        const schedulesToSend = [];

        const processSchedule = async (scheduleKey) => {
            return new Promise(async (resolve) => {
                try {
                    const scheduleTimeArray = scheduleKey.split('_').map(Number);
                    const scheduleTimeMS = calculateTimeMS(scheduleTimeArray);
                    
                    if (scheduleTimeMS < currentTimeMS) {
                        // التحقق إذا كان الوقت قد مضى أكثر من 10 دقائق
                        if (currentTimeMS - scheduleTimeMS > checkTime) {
                            // حذف الموعد
                            for (const boxID in schedules) {
                                if (schedules[boxID][scheduleKey]) {
                                    schedules[boxID][scheduleKey].TID = boxID;
                                    schedulesToSend.push(schedules[boxID][scheduleKey]);
                                    delete schedules[boxID][scheduleKey];
                                }
                            }
                            writeFileSync(pathDataSchedule, JSON.stringify(schedules, null, 4));
                        } else {
                            // حذف الموعد بدون إرسال
                            for (const boxID in schedules) {
                                if (schedules[boxID][scheduleKey]) {
                                    delete schedules[boxID][scheduleKey];
                                }
                            }
                            writeFileSync(pathDataSchedule, JSON.stringify(schedules, null, 4));
                        }
                    }
                } catch (error) {
                    console.error("خطأ في معالجة الموعد:", error);
                }
                resolve();
            });
        };

        // معالجة جميع المواعيد
        for (const boxID in schedules) {
            const boxSchedules = Object.keys(schedules[boxID]);
            for (const schedule of boxSchedules) {
                await processSchedule(schedule);
            }
        }

        // إرسال المواعيد المستحقة
        for (const schedule of schedulesToSend) {
            try {
                // الحصول على معلومات المجموعة
                const threadInfo = await api.getThreadInfo(schedule.TID);
                const participantIDs = threadInfo.participantIDs;
                participantIDs.splice(participantIDs.indexOf(api.getCurrentUserID()), 1);

                const nameArray = schedule.name || "🥰🥰🥰";
                const mentions = [];
                let nameIndex = 0;

                for (let i = 0; i < participantIDs.length; i++) {
                    if (i >= nameArray.length) {
                        nameArray += " ‍ ";
                    }
                    mentions.push({
                        tag: nameArray[i],
                        id: participantIDs[i],
                        fromIndex: i + 1
                    });
                }

                const messageBody = {
                    body: nameArray,
                    mentions: mentions
                };

                // إضافة المرفقات إذا وجدت
                if (schedule.ATTACHMENT && schedule.ATTACHMENT.length > 0) {
                    messageBody.attachment = [];
                    for (const attachment of schedule.ATTACHMENT) {
                        const response = await axios.get(encodeURI(attachment.url), {
                            responseType: 'arraybuffer'
                        });
                        const filePath = __dirname + '/../modules/commands/cache/' + attachment.fileName;
                        writeFileSync(filePath, Buffer.from(response.data, 'utf-8'));
                        messageBody.attachment.push(createReadStream(filePath));
                    }
                }

                console.log(messageBody);

                // تغيير عنوان المجموعة إذا كان مطلوباً
                if (schedule.KOFIL && schedule.TID) {
                    await api.setTitle(schedule.KOFIL, schedule.TID);
                }

                // إرسال الرسالة
                await api.sendMessage(messageBody, schedule.TID, () => {
                    if (schedule.ATTACHMENT && schedule.ATTACHMENT.length > 0) {
                        schedule.ATTACHMENT.forEach(att => {
                            const filePath = __dirname + '/../modules/commands/cache/' + att.fileName;
                            unlinkSync(filePath);
                        });
                    }
                });

            } catch (error) {
                console.error("خطأ في إرسال الموعد:", error);
            }
        }
    };

    // تشغيل فحص المواعيد كل 10 دقائق
    setInterval(checkSchedules, checkTime * 10);

    // ════════════════════════════════════════════════════════════
    // 🎯 نظام TOP التفاعل اليومي والأسبوعي
    // ════════════════════════════════════════════════════════════

    logger("بدء نظام التفاعل", "[ SYSTEM ]");

    const checkInteractionReset = async () => {
        try {
            const allThreads = await Threads.getAll();
            
            for (const thread of allThreads) {
                const threadID = String(thread.threadID);
                const threadData = thread.data || {};
                
                // تحديث عداد الأسبوع
                if (threadData.week && threadData.week >= 7) {
                    logger("بدء إعادة تعيين تفاعل الأسبوع", "[ TOP ]");
                    
                    // الحصول على أعضاء المجموعة
                    const allUsers = await Users.getAll(['userID', 'exp', 'data']);
                    const filteredUsers = allUsers.filter(user => 
                        threadData.members && threadData.members.includes(user.userID)
                    );
                    
                    // ترتيب حسب التفاعل الأسبوعي
                    const sortedUsers = filteredUsers
                        .map(user => ({
                            id: user.userID,
                            weekExp: (user.data && user.data.week) || 0
                        }))
                        .sort((a, b) => b.weekExp - a.weekExp)
                        .slice(0, 10);

                    let topMessage = "»𝗧𝗢𝗣 𝗧𝗨̛𝗢̛𝗡𝗚 𝗧𝗔́𝗖 𝗧𝗨𝗔̂̀𝗡«\n\n";
                    
                    for (let i = 0; i < sortedUsers.length; i++) {
                        const userName = await Users.getNameUser(sortedUsers[i].id) || "مستخدم";
                        topMessage += `${i + 1}. ${userName} (${sortedUsers[i].weekExp})\n`;
                    }

                    if (global.config.notiGroup && sortedUsers.length > 0) {
                        api.sendMessage(topMessage, threadID);
                    }

                    // إعادة تعيين التفاعل الأسبوعي
                    threadData.week = 0;
                    await Threads.setData(threadID, { data: threadData });
                    
                    for (const user of allUsers) {
                        if (user.data) {
                            user.data.week = 0;
                            await Users.setData(user.userID, { data: user.data });
                        }
                    }
                }

                // تحديث عداد اليوم
                if (threadData.day && threadData.day >= 1) {
                    logger("بدء إعادة تعيين تفاعل اليوم", "[ TOP ]");
                    
                    const allUsers = await Users.getAll(['userID', 'exp', 'data']);
                    const filteredUsers = allUsers.filter(user => 
                        threadData.members && threadData.members.includes(user.userID)
                    );
                    
                    const sortedUsers = filteredUsers
                        .map(user => ({
                            id: user.userID,
                            dayExp: (user.data && user.data.day) || 0
                        }))
                        .sort((a, b) => b.dayExp - a.dayExp)
                        .slice(0, 10);

                    let topMessage = "»𝗧𝗢𝗣 𝗧𝗨̛𝗢̛𝗡𝗚 𝗧𝗔́𝗖 𝗡𝗚𝗔̀𝗬«\n\n";
                    
                    for (let i = 0; i < sortedUsers.length; i++) {
                        const userName = await Users.getNameUser(sortedUsers[i].id) || "مستخدم";
                        topMessage += `${i + 1}. ${userName} (${sortedUsers[i].dayExp})\n`;
                    }

                    if (global.config.notiGroup && sortedUsers.length > 0) {
                        api.sendMessage(topMessage, threadID);
                    }

                    // إعادة تعيين التفاعل اليومي
                    threadData.day = 0;
                    await Threads.setData(threadID, { data: threadData });
                    
                    for (const user of allUsers) {
                        if (user.data) {
                            user.data.day = 0;
                            await Users.setData(user.userID, { data: user.data });
                        }
                    }
                }

                // تحديث العدادات
                if (threadData.week !== undefined) {
                    threadData.week = (threadData.week || 0) + 1;
                }
                if (threadData.day !== undefined) {
                    threadData.day = (threadData.day || 0) + 1;
                }
                
                await Threads.setData(threadID, { data: threadData });
            }
        } catch (error) {
            console.error("خطأ في نظام TOP:", error);
        }
    };

    // تشغيل فحص التفاعل كل 24 ساعة
    setInterval(checkInteractionReset, 24 * 60 * 60 * 1000);

    // ════════════════════════════════════════════════════════════
    // 👂 الدالة الرئيسية للاستماع
    // ════════════════════════════════════════════════════════════

    return async (event) => {
        try {
            // ════════════════════════════════════════════════════════════
            // 🔔 معالجة الإشعارات
            // ════════════════════════════════════════════════════════════
            
            if (event.type === "change_thread_image") {
                if (global.config.NOTIFICATION) {
                    handleNotification({ api });
                }
                api.sendMessage("» [ 𝐂𝐀̣̂𝐏 𝐍𝐇𝐀̣̂𝐓 𝐍𝐇𝐎́𝐌 ]\n»  " + event.snippet, event.threadID);
            }

            // ════════════════════════════════════════════════════════════
            // 🎯 معالجة أنواع الأحداث المختلفة
            // ════════════════════════════════════════════════════════════
            
            switch (event.type) {
                case "message":
                case "message_reply":
                case "message_unsend":
                    // معالجة الأوامر
                    handleCommand({ event });
                    handleCommandEvent({ event });
                    handleReply({ event });
                    handleReaction({ event });
                    break;

                case "event":
                case "message_reaction":
                    handleEvent({ event });
                    handleRefresh({ event });

                    // رسالة المنشن إذا كانت مفعّلة
                    if (event.type === "message_reaction" && global.config.notiGroup) {
                        let messageContent = "» [ 𝐂𝐀̣̂𝐏 𝐍𝐇𝐀̣̂𝐓 𝐍𝐇𝐎́𝐌 ]\n» ";
                        messageContent += event.logMessageBody;

                        // استبدال "Bạn" باسم البوت
                        if (event.senderID !== api.getCurrentUserID()) {
                            messageContent = messageContent.replace("Bạn", global.config.BOTNAME);
                        }

                        api.sendMessage(messageContent, event.threadID);
                    }
                    break;

                case "message_reaction":
                    // معالجة التفاعل على الرسائل
                    const { iconUnsend } = global.config;
                    
                    if (iconUnsend.status && 
                        event.senderID !== api.getCurrentUserID() && 
                        event.reaction === iconUnsend.icon) {
                        api.unsendMessage(event.messageID);
                    }

                    handleReaction({ event });
                    break;

                default:
                    break;
            }

        } catch (error) {
            console.error("خطأ في Listen:", error);
            logger(`خطأ في Listen: ${error.message}`, "error");
        }
    };
};

// ════════════════════════════════════════════════════════════
// 📝 الميزات الرئيسية:
// ════════════════════════════════════════════════════════════
//
// ✅ نظام المواعيد والتذكيرات
// ✅ نظام TOP التفاعل اليومي والأسبوعي
// ✅ معالجة جميع أنواع الرسائل والأحداث
// ✅ نظام حذف الرسائل بالتفاعل
// ✅ دعم المرفقات في المواعيد
// ✅ إشعارات المجموعة
// ✅ معالجة الأخطاء المحسّنة
//
// ════════════════════════════════════════════════════════════
