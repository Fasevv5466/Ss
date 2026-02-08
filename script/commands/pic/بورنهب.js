module.exports.config = {
    name: "بورنهب",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "تعليق في موقع بورنهب",
    commandCategory: "pic",
    usages: "بورنهب [نص]",
    cooldowns: 100
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
        return api.sendMessage("Nhập nội dung comment phub", threadID, messageID);
      let getPorn = (
        await axios.get(`https://i.imgur.com/XrgnIyK.png`, {
          responseType: "arraybuffer",
        })
      ).data;
      fs.writeFileSync(pathImg, Buffer.from(getPorn, "utf-8"));
      let baseImage = await loadImage(pathImg);
      let baseAva = await loadImage(pathAva);
      let canvas = createCanvas(baseImage.width, baseImage.height);
      let ctx = canvas.getContext("2d");
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.font = "700 23px Arial";
      ctx.fillStyle = "#FF9900";
      ctx.textAlign = "start";
      let fontSize = 23;
      ctx.drawImage(baseAva, 30, 310, 70, 70);
      ctx.fillText(namee, 115, 350);
      ctx.font = "400 23px Arial";
      ctx.fillStyle = "#ffff";
      ctx.textAlign = "start";
      fontSize = 23;
    
      while (ctx.measureText(text).width > 2600) {
        fontSize--;
        ctx.font = `400 ${fontSize}px Arial, sans-serif`;
      }
      const lines = await this.wrapText(ctx, text, 1160);
      ctx.fillText(lines.join("\n"), 30, 443); //comment
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
