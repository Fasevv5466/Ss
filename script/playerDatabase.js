const axios = require('axios');

const BIN_ID = '69827eccd0ea881f409e93e0';
const MASTER_KEY = '$2a$10$2sGAA3hCyqFVr6qbdDDtxOic/4tf91oe11Fk4FFMCaruc5Z6uDOM6';
const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

class CloudDatabase {
    constructor() {
        // إعداد أكسيوس ليكون صبوراً مع ريندر
        this.client = axios.create({
            timeout: 15000, // الانتظار 15 ثانية قبل الاستسلام
            headers: { 'X-Master-Key': MASTER_KEY }
        });
    }

    async readAllData() {
        try {
            const res = await this.client.get(API_URL);
            const data = res.data.record;
            if (Array.isArray(data) && data[0] && data[0].info === "start") return [];
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error('❌ السحابة مشغولة أو ريندر بطيء:', error.message);
            throw error; // نرسل الخطأ لكي يراه الأمر
        }
    }

    async writeAllData(data) {
        try {
            await this.client.put(API_URL, data);
            return true;
        } catch (error) {
            console.error('❌ فشل الحفظ السحابي:', error.message);
            return false;
        }
    }

    async getData(targetId, name = "لاعب جديد") {
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
