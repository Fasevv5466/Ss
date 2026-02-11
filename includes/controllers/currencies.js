const path = require("path");

module.exports = function ({ models, api }) {
    // استدعاء ملف المونغو الخاص بنا
    const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

    async function getAll(...data) {
        // في المونغو نستخدم دالة جلب الكل إذا احتجتها للـ TOP
        try {
            return await mongodb.getAllUsers(); 
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async function getData(userID) {
        try {
            // جلب البيانات مباشرة من البنك السحابي
            let data = await mongodb.getUserData(userID);
            
            if (!data) {
                console.log(`📝 [KiraDB] إنشاء حساب بنكي جديد لـ ${userID}`);
                // يمكنك إضافة منطق إنشاء مستخدم هنا إذا لم يكن موجوداً
                return { currency: { money: 1000, exp: 0 } }; 
            }
            
            // تحويل هيكلة المونغو لتناسب السورس (عشان الأوامر القديمة ما تخرب)
            return {
                userID: data.senderID,
                money: data.currency.money,
                exp: data.currency.exp,
                data: data.user
            };
        } 
        catch (error) {
            console.error('❌ [KiraDB] خطأ في getData:', error);
            return false;
        }
    }

    async function setData(userID, options = {}) {
        try {
            // تحديث البيانات في المونغو
            // إذا كانت الخيارات تحتوي على money، نحدثها
            if (options.hasOwnProperty('money')) {
                const currentData = await mongodb.getUserData(userID);
                const diff = options.money - currentData.currency.money;
                if (diff > 0) await mongodb.addMoney(userID, diff);
                else if (diff < 0) await mongodb.removeMoney(userID, Math.abs(diff));
            }
            return true;
        } 
        catch (error) {
            console.error('❌ [KiraDB] خطأ في setData:', error);
            return false;
        }
    }

    async function increaseMoney(userID, money) {
        try {
            // الربط المباشر بدالة الإضافة في المونغو
            await mongodb.addMoney(userID, money);
            console.log(`💰 [BANK] تم إيداع ${money}$ في حساب ${userID}`);
            return true;
        }
        catch (error) {
            console.error('❌ [BANK] خطأ في الإيداع:', error);
            return false;
        }
    }

    async function decreaseMoney(userID, money) {
        try {
            // الربط المباشر بدالة الخصم في المونغو
            const success = await mongodb.removeMoney(userID, money);
            if (success) {
                console.log(`💸 [BANK] تم سحب ${money}$ من حساب ${userID}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ [BANK] خطأ في السحب:', error);
            return false;
        }
    }

    return {
        getAll,
        getData,
        setData,
        increaseMoney,
        decreaseMoney,
        createData: async (userID) => await getData(userID) // اختصار
    };
};
