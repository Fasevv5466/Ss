const axios = require('axios');

// بياناتك الخاصة التي استخرجناها
const BIN_ID = '69827eccd0ea881f409e93e0';
const MASTER_KEY = '$2a$10$2sGAA3hCyqFVr6qbdDDtxOic/4tf91oe11Fk4FFMCaruc5Z6uDOM6';
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

class CloudDatabase {
    async readAllData() {
        try {
            const res = await axios.get(API_URL, {
                headers: { 'X-Master-Key': MASTER_KEY }
            });
            const data = res.data.record;
            // تنظيف البيانات من "start" الوهمية أول مرة
            if (Array.isArray(data) && data[0] && data[0].info === "start") return [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('❌ خطأ سحابي:', error.message);
            return [];
        }
    }

    async writeAllData(data) {
        try {
            await axios.put(API_URL, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': MASTER_KEY
                }
            });
            return true;
        } catch (error) {
            console.error('❌ خطأ في الحفظ:', error.message);
            return false;
        }
    }

    async getData(targetId, name = "مستخدم جديد") {
        let allPlayers = await this.readAllData();
        let player = allPlayers.find(p => p.playerID === targetId);

        if (!player) {
            player = {
                playerID: targetId,
                username: name,
                level: 1,
                coins: 500,
                lastActive: new Date().toISOString()
            };
            allPlayers.push(player);
            await this.writeAllData(allPlayers);
        }
        return player;
    }
}

module.exports = new CloudDatabase();
