const fs = require("fs-extra");
const path = require("path");

const dirPath = path.join(__dirname, "../../Heba_DB");
const filePath = path.join(dirPath, "global_stats.json");

function ensureExists() {
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}, null, 4));
}

module.exports = {
    getData: (uid) => {
        ensureExists();
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (!data[uid]) {
            data[uid] = {
                level: 1,
                xp: 0,
                points: 100, // رصيد هدية عند أول ظهور
                rank: "مبتدئ ✨",
                inventory: [],
                lastDaily: 0
            };
            fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
        }
        return data[uid];
    },
    saveData: (uid, userStats) => {
        ensureExists();
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        data[uid] = userStats;
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    },
    getAll: () => {
        ensureExists();
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
};
