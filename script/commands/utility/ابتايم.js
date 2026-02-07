module.exports = {
    config: {
        name: "ابتايم",
        version: "1.0",
        author: "KIRA",
        countDown: 2,
        role: 0,
        shortDescription: {
            en: "Uptime screenshot",
            ar: "سكرين شوت النظام"
        },
        longDescription: {
            en: "Send screenshot of uptime dashboard",
            ar: "إرسال صورة لواجهة نظام الابتايم"
        },
        category: "خدمات",
        guide: {
            en: "{pn}",
            ar: "{pn}"
        }
    },

    onStart: async function({ message }) {
        try {
            // رابط Koyeb الخاص بك
            const koyebUrl = "https://fixed-ivette-kirasimini-000fc9c7.koyeb.app";
            
            // رابط الالتقاط
            const screenshotUrl = `https://image.thum.io/get/width/800/crop/600/${koyebUrl}`;
            
            // إرسال الصورة
            await message.reply({
                body: `🎭 **نظام الابتايم على Koyeb**\n🔗 ${koyebUrl}`,
                attachment: await global.utils.getStreamFromURL(screenshotUrl)
            });
            
        } catch (error) {
            console.error("Uptime command error:", error);
            await message.reply("🎭 https://fixed-ivette-kirasimini-000fc9c7.koyeb.app");
        }
    }
};
