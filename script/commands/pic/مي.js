module.exports.config = {
    name: "مي",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "تعليق في منشور لك ",
    commandCategory: "pic",
    usages: "اني [نص]",
    cooldowns: 10
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args, Users }) {
      let { senderID, threadID, messageID } = event;
      const { loadImage, createCanvas } = require("canvas");
      const fs = global.nodemodule["fs-extra"];
      const axios = global.nodemodule["axios"];
      let pathImg = __dirname + "/cache/phub.png";
      var text = args.join(" ");
      var namee = (await Users.getData(senderID)).name
      let pathAva = __dirname + "/cache/avt.png";
      let Avatar = (
        await axios.get(
          `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
          { responseType: "arraybuffer" }
        )
      ).data;
      fs.writeFileSync(pathAva, Buffer.from(Avatar, "utf-8"));
      if (!text)
        return api.sendMessage("اكتب شي حتى اضيفه للصورة", threadID, messageID);
      let getPorn = (
        await axios.get(`https://i.postimg.cc/9FX3QVXf/Picsart-22-07-31-17-43-49-198.jpg`, {
          responseType: "arraybuffer",
        })
      ).data;
      fs.writeFileSync(pathImg, Buffer.from(getPorn, "utf-8"));
      let baseImage = await loadImage(pathImg);
      let baseAva = await loadImage(pathAva);
      let canvas = createCanvas(baseImage.width, baseImage.height);
      let ctx = canvas.getContext("2d");
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.font = "1000 40px Arial";
      ctx.fillStyle = "#FF9900";
      ctx.textAlign = "start";
      let fontSize = 3000;
      ctx.drawImage(baseAva, 40, 50, 122, 122);
      ctx.fillText(namee, 170, 97);
      ctx.font = "700 75px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "right";
      fontSize = 3000;
    
      while (ctx.measureText(text).width > 2600) {
        fontSize--;
        ctx.font = `400 ${fontSize}px Arial, sans-serif`;
      }
      const lines = await this.wrapText(ctx, text, 1160);
      ctx.fillText(lines.join("\n"), 1250, 263); //comment
      ctx.beginPath();
      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);
      fs.removeSync(pathAva);
      return api.sendMessage(
        { attachment: fs.createReadStream(pathImg) },
        threadID,
        () => fs.unlinkSync(pathImg),
        messageID
      );
};
