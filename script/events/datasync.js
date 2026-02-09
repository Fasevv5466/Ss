const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports.config = {
  name: "dataSync",
  eventType: ["log:ready"],
  version: "1.0.0",
  credits: "ايمن",
  description: "استعادة البيانات تلقائياً من الجروب المربوط"
};

module.exports.onLoad = async function ({ api }) {
  const DB_THREAD_ID = "1438595104475963"; // نعم، تم الربط هنا يا أيمن
  const dbPath = path.join(process.cwd(), "includes", "database");

  console.log("⌬ ━━ 𝗞𝗜𝗥𝗔 ━━ ⌬ جاري فحص السحابة (الجروب المربوط) لاستعادة البيانات...");

  try {
    const history = await api.getThreadHistory(DB_THREAD_ID, 15);
    const lastBackup = history.find(m => m.attachments && m.attachments.some(a => a.filename && a.filename.endsWith('.json')));

    if (!lastBackup) {
      console.log("⚠️ تم الربط، لكن الجروب لا يحتوي على ملفات JSON بعد.");
      return;
    }

    for (let att of lastBackup.attachments) {
      if (att.filename && att.filename.endsWith('.json')) {
        const res = await axios.get(att.url, { responseType: "arraybuffer" });
        const filePath = path.join(dbPath, att.filename);
        
        fs.ensureDirSync(path.dirname(filePath));
        fs.writeFileSync(filePath, Buffer.from(res.data));
        console.log(`✅ تم سحب واستعادة: ${att.filename}`);
      }
    }
  } catch (e) {
    console.log("❌ فشل الاتصال بالجروب: " + e.message);
  }
};
