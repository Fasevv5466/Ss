module.exports.config = {
    name: "حماية_فورية",
    eventType: ["log:thread-admins"],
    version: "3.0.0",
    credits: "ayman",
    description: "حماية الإدارة الفورية - إعادة البوت والمطور مشرفين في أقل من ثانية",
};

module.exports.run = async function ({ event, api, Threads }) {
    const { logMessageType, logMessageData, author, threadID } = event;
    const botID = api.getCurrentUserID();
    const adminID = global.config.ADMINBOT[0]; // أيدي المطور من الإعدادات

    // تنفيذ الحماية إذا كان الفاعل ليس البوت نفسه
    if (author == botID) return;

    // 1. في حال تم تنزيل (البوت) أو (المطور) من الإدارة
    if (logMessageType == "log:thread-admins" && logMessageData.ADMIN_EVENT == "remove_admin") {
        if (logMessageData.TARGET_ID == botID || logMessageData.TARGET_ID == adminID) {
            
            // سحب إدارة الفاعل + إعادة البوت + إعادة المطور (في نفس اللحظة)
            api.changeAdminStatus(threadID, author, false);
            api.changeAdminStatus(threadID, botID, true);
            api.changeAdminStatus(threadID, adminID, true);
            
            return api.sendMessage("⌬ تم تفعيل الحماية الفورية: ممنوع المساس بالإدارة!", threadID);
        }
    }

    // 2. في حال محاولة إضافة مشرف جديد (منع سرقة الكروب)
    if (logMessageType == "log:thread-admins" && logMessageData.ADMIN_EVENT == "add_admin") {
        api.changeAdminStatus(threadID, author, false);
        api.changeAdminStatus(threadID, logMessageData.TARGET_ID, false);
        
        return api.sendMessage("⌬ حماية كيرا: لا يسمح برفع مشرفين جدد حالياً.", threadID);
    }
};
