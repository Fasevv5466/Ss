const path = require("path");

module.exports = function ({ models, api }) {
    // استدعاء محرك المونغو لربط المجموعات
    const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

    async function getInfo(threadID) {
        try {
            // جلب المعلومات من فيسبوك مباشرة
            return await api.getThreadInfo(threadID);
        }
        catch (error) { 
            console.error("❌ [Threads] خطأ في جلب معلومات المجموعة:", error);
            return {};
        };
    }

    async function getAll() {
        try {
            // جلب جميع المجموعات المسجلة في KiraDB
            return await mongodb.getAllThreads(); 
        }
        catch (error) {
            console.error(error);
            return [];
        }
    }

    async function getData(threadID) {
        try {
            // جلب إعدادات المجموعة من المونغو
            let data = await mongodb.getThreadData(threadID);
            
            if (!data) {
                console.log(`📡 [KiraDB] تسجيل مجموعة جديدة: ${threadID}`);
                // إذا لم توجد المجموعة، يتم إنشاؤها بإعدادات افتراضية
                return { threadID, threadName: "KIRA Group", settings: {} };
            }
            
            return data;
        } 
        catch (error) { 
            console.error("❌ [Threads] خطأ في جلب بيانات المجموعة:", error);
            return false;
        }
    }

    async function setData(threadID, options = {}) {
        try {
            // تحديث إعدادات المجموعة في المونغو (مثل البادئة Prefix أو الترحيب)
            await mongodb.updateThreadData(threadID, options);
            console.log(`✅ [KiraDB] تم تحديث إعدادات المجموعة: ${threadID}`);
            return true;
        } catch (error) { 
            console.error("❌ [Threads] فشل في تحديث البيانات:", error);
            return false;
        }
    }

    async function createData(threadID, defaults = {}) {
        try {
            // إنشاء سجل جديد للمجموعة في القاعدة السحابية
            await mongodb.createThread(threadID, defaults);
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }

    async function delData(threadID) {
        try {
            // حذف المجموعة من القاعدة (اختياري)
            await mongodb.deleteThread(threadID);
            return true;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    }

    return {
        getInfo,
        getAll,
        getData,
        setData,
        delData,
        createData
    };
};
