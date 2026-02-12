module.exports.config = {
  name: "انمي",
  version: "4.5.5",
  hasPermssion: 0,
  credits: "Ayman",
  description: "بحث عن أنمي أو اقتراحات حسب الفئة ✨",
  commandCategory: "media",
  usages: ".انمي [الاسم] أو [الفئة]",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
  const axios = require('axios');
  const fs = require("fs-extra");
  const request = require("request");
  const { threadID, messageID } = event;
  const header = `⌬ ━━━━━━━━━━━━ ⌬\n      🎬 أنـظـمـة الأنـمـي\n⌬ ━━━━━━━━━━━━ ⌬`;

  const categories = {
    "دراما": ["Clannad: After Story", "Your Lie in April", "Violet Evergarden", "A Silent Voice", "Anohana", "March Comes in Like a Lion", "Grave of the Fireflies", "Orange", "Erased", "To Your Eternity", "Fruits Basket", "Nana", "Plastic Memories", "I Want to Eat Your Pancreas", "The Garden of Words", "Wolf Children", "Great Teacher Onizuka", "Welcome to the N.H.K.", "Blue Period", "Wonder Egg Priority", "Josee, the Tiger and the Fish", "ReLIFE", "The Wind Rises", "Rainbow", "Maquia"],
    "اكشن": ["Attack on Titan", "One Piece", "Naruto Shippuden", "Hunter x Hunter", "Jujutsu Kaisen", "Demon Slayer", "Bleach", "Fullmetal Alchemist: Brotherhood", "One Punch Man", "My Hero Academia", "Vinland Saga", "Chainsaw Man", "Solo Leveling", "Fate/Zero", "Black Clover", "Dragon Ball Super", "Tokyo Ghoul", "Hellsing Ultimate", "Akame ga Kill!", "Kill la Kill", "Sword Art Online", "Bungou Stray Dogs", "Mob Psycho 100", "Fire Force", "Seven Deadly Sins"],
    "رعب": ["Death Note", "Monster", "Berserk", "Another", "Parasyte: The Maxim", "When They Cry", "Hellsing", "The Promised Neverland", "Devilman Crybaby", "Shiki", "Elfen Lied", "Corpse Party", "Perfect Blue", "Ajin", "Highschool of the Dead", "Gantz", "Hell Girl", "Blood+", "Boogiepop Phantom", "Terror in Resonance", "Danganronpa", "Angels of Death", "Serial Experiments Lain", "Ghost Hunt"],
    "رومانسي": ["Kaguya-sama: Love is War", "Toradora!", "Horimiya", "My Dress-Up Darling", "Your Name", "Maid Sama!", "Kamisama Kiss", "Golden Time", "Blue Spring Ride", "My Little Monster", "Snow White with the Red Hair", "Wotakoi", "Love, Chunibyo & Other Delusions", "Say I Love You", "Weathering with You", "5 Centimeters per Second", "The Pet Girl of Sakurasou", "Lovely Complex", "Rascal Does Not Dream of Bunny Girl Senpai", "Tomo-chan Is a Girl!"],
    "كوميديا": ["Gintama", "Konosuba", "Grand Blue", "The Disastrous Life of Saiki K.", "Sakamoto Desu ga?", "Nichijou", "Asobi Asobase", "Spy x Family", "Hinamatsuri", "Daily Lives of High School Boys", "Sket Dance", "Prison School", "Devil is a Part-Timer", "Barakamon", "Ouran High School Host Club"],
    "خيال": ["Steins;Gate", "No Game No Life", "Sword Art Online", "Re:Zero", "That Time I Got Reincarnated as a Slime", "Overlord", "Mushoku Tensei", "The Rising of the Shield Hero", "Made in Abyss", "Psycho-Pass", "Log Horizon", "Code Geass", "Neon Genesis Evangelion", "Cyberpunk: Edgerunners", "Dr. Stone"]
  };

  let query = args.join(" ");

  if (!query) {
    return api.sendMessage(
      `${header}\n\n` +
      `يـرجـى تـحـديـد الـفـئـة سـيـدي:\n` +
      `⪼ انـمـي اكـشـن\n` +
      `⪼ انـمـي درامـا\n` +
      `⪼ انـمـي رعب\n` +
      `⪼ انـمـي رومانسي\n` +
      `⪼ انـمـي كـومـيـديـا\n` +
      `⪼ انـمـي خـيـال\n\n` +
      `💡 أو ابـحـث مـبـاشـرة: .انمي [الاسم]\n` +
      `⌬ ━━━━━━━━━━━━ ⌬`, 
      threadID, messageID
    );
  }

  let targetAnime = query;
  if (categories[query]) {
    targetAnime = categories[query][Math.floor(Math.random() * categories[query].length)];
    const reacts = { "دراما": "😢", "اكشن": "🔥", "رعب": "👻", "رومانسي": "❤️", "كوميديا": "😂", "خيال": "🚀" };
    api.setMessageReaction(reacts[query], messageID, () => {}, true);
  } else {
    api.setMessageReaction("🔍", messageID, () => {}, true);
  }

  try {
    const res = await axios.get(`https://api.popcat.xyz/imdb?q=${encodeURIComponent(targetAnime)}`);
    const data = res.data;

    if (data.error) return api.sendMessage(`❌ لم أجد نتائج لـ "${targetAnime}".`, threadID, messageID);

    const translate = async (text) => {
      if (!text) return "غير متوفر";
      const tRes = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=${encodeURIComponent(text)}`);
      return tRes.data[0].map(x => x[0]).join("");
    };

    const [plotAr, genresAr] = await Promise.all([translate(data.plot), translate(data.genres)]);

    const path = __dirname + `/cache/anime_${Date.now()}.png`;
    const callback = () => {
      api.sendMessage({
        body: `${header}\n\n` +
              `⪼ الاسـم: ${data.title}\n` +
              `⪼ الـسـنـة: ${data.year}\n` +
              `⪼ الـتـقـيـيـم: ${data.rating}/10\n` +
              `⪼ الـتـصـنـيـف: ${genresAr}\n\n` +
              `📖 الـقـصـة بـالـعـربـيـة:\n${plotAr}\n\n` +
              `⌬ ━━━━━━━━━━━━ ⌬`,
        attachment: fs.createReadStream(path)
      }, threadID, () => { if (fs.existsSync(path)) fs.unlinkSync(path); }, messageID);
    };

    return request(encodeURI(data.poster)).pipe(fs.createWriteStream(path)).on("close", callback);

  } catch (err) {
    return api.sendMessage("❌ حدث خطأ، حاول مجدداً.", threadID, messageID);
  }
};
