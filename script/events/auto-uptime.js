const axios = require("axios");

module.exports.config = {
  name: "autoPing",
  eventType: ["ready"],
  version: "1.1.0",
  credits: "Ayman",
  description: "Ping تلقائي كل 10 دقائق لمنع إيقاف البوت"
};

const URL = "https://ayman-1-hcp1.onrender.com";
const INTERVAL = 10 * 60 * 1000; // 10 دقائق

module.exports.run = async function () {
  console.log("🔁 AutoPing يعمل (كل 10 دقائق)");

  // أول Ping فور التشغيل
  try {
    await axios.get(URL, { timeout: 10000 });
    console.log("✅ Ping أولي ناجح");
  } catch (e) {
    console.log("❌ Ping أولي فشل:", e.message);
  }

  // Ping دوري
  setInterval(async () => {
    try {
      await axios.get(URL, { timeout: 10000 });
      console.log("✅ Ping ناجح:", new Date().toLocaleTimeString());
    } catch (err) {
      console.log("❌ Ping فشل:", err.message);
    }
  }, INTERVAL);
};
