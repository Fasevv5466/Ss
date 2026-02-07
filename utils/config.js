/**
 * ◈ ───『 ⚙️ إعدادات كيرا 』─── ◈
 * المطور: 𝐚𝐲𝐦𝐚𝐧
 * الوصف: دوال مساعدة للوصول للإعدادات
 */

module.exports = {
    /**
     * 👑 الحصول على أيدي المطور
     * @returns {Array} مصفوفة أيديات المطورين
     */
    getAdmins: function() {
        return global.config.ADMINBOT || [];
    },

    /**
     * 👤 الحصول على أيدي المطور الأول
     * @returns {String} أيدي المطور الأول
     */
    getFirstAdmin: function() {
        const admins = this.getAdmins();
        return admins[0] || '';
    },

    /**
     * ✅ التحقق من كون المستخدم مطور
     * @param {String} userID - أيدي المستخدم
     * @returns {Boolean} true إذا كان مطور
     */
    isAdmin: function(userID) {
        return this.getAdmins().includes(userID);
    },

    /**
     * 🔤 الحصول على البادئة
     * @returns {String} البادئة المستخدمة
     */
    getPrefix: function() {
        return global.config.PREFIX || '.';
    },

    /**
     * 🤖 الحصول على اسم البوت
     * @returns {String} اسم البوت
     */
    getBotName: function() {
        return global.config.BOTNAME || '𝐤𝐢𝐫𝐚';
    },

    /**
     * 👨‍💻 الحصول على اسم المطور
     * @returns {String} اسم المطور
     */
    getAdminName: function() {
        return global.config.ADMIN_NAME || '𝐚𝐲𝐦𝐚𝐧';
    },

    /**
     * 🔗 الحصول على رابط المطور
     * @returns {String} رابط فيسبوك المطور
     */
    getAdminLink: function() {
        return global.config.FACEBOOK_ADMIN || `https://facebook.com/profile.php?id=${this.getFirstAdmin()}`;
    },

    /**
     * 🌐 الحصول على اللغة
     * @returns {String} رمز اللغة
     */
    getLanguage: function() {
        return global.config.language || 'ar';
    }
};
