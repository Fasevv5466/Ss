const Canvas = require("@napi-rs/canvas");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ═══════════════════════════════════════════════════════════════════════════════
// ║                    KIRA BANK RANK CARD SYSTEM v16K                           ║
// ║                    HYPER ULTRA MEGA EDITION                                  ║
// ║                    دقة 16K - دالة لكل بكسل                                  ║
// ═══════════════════════════════════════════════════════════════════════════════

const mongodb = require(path.join(process.cwd(), "includes", "mongodb.js"));

module.exports.config = {
  name: "رانك",
  version: "16.0.0",
  hasPermssion: 0,
  credits: "ايمن - Kira Bank 16K Ultra Edition",
  description: "بطاقة رانك نيون 16K احترافية متصلة بقاعدة بيانات KiraDB - أعلى دقة ممكنة",
  commandCategory: "economy",
  usages: "[@منشن]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  
  try {
    let targetID = senderID;
    if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    }

    const data = await mongodb.getUserData(targetID);
    
    if (!data || !data.currency) {
      return api.sendMessage("❌ لم يتم العثور على بيانات المستخدم في KiraDB!", threadID, messageID);
    }
    
    const money = data.currency.money || 0;
    const exp = data.currency.exp || 0;
    const username = data.user.name || (await api.getUserInfo(targetID))[targetID].name || "مستخدم كايرا";
    
    const rankData = calculateRank(exp);
    
    api.sendMessage("🎨 جاري إنشاء بطاقة KIRA BANK 16K الخاصة بك...", threadID, messageID);
    
    const card = await createRankCard({
      userID: targetID,
      username: username,
      money: money,
      exp: exp,
      rankData: rankData
    });
    
    const cachePath = path.join(__dirname, "cache", `rank_${targetID}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    await fs.writeFile(cachePath, card);
    
    return api.sendMessage({
      body: `⌬ ━━━ 𝗞𝗜𝗥𝗔 𝗕𝗔𝗡𝗞 ━━━ ⌬\n\n👤 ${username}\n💰 ${formatNumber(money)} $\n✨ ${formatNumber(exp)} XP\n🏆 ${rankData.current.emoji} ${rankData.current.name}`,
      attachment: fs.createReadStream(cachePath)
    }, threadID, () => {
        if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
    }, messageID);
    
  } catch (error) {
    console.error("❌ خطأ:", error);
    return api.sendMessage("❌ حدث خطأ في النظام!", threadID, messageID);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ║                           HELPER FUNCTIONS                                   ║
// ═══════════════════════════════════════════════════════════════════════════════

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const RANKS = [
  { level: 0, name: "مبتدئ", emoji: "🔰", color: "#ffffff", minExp: 0 },
  { level: 1, name: "محارب", emoji: "⚔️", color: "#cc9900", minExp: 100 },
  { level: 2, name: "فارس", emoji: "🛡️", color: "#00ccff", minExp: 300 },
  { level: 3, name: "نخبة", emoji: "💎", color: "#9900ff", minExp: 600 },
  { level: 4, name: "بطل", emoji: "👑", color: "#ffcc00", minExp: 1000 },
  { level: 5, name: "أسطورة", emoji: "⚡", color: "#ff6600", minExp: 1500 },
  { level: 6, name: "ملك", emoji: "🔱", color: "#ff0066", minExp: 2200 },
  { level: 7, name: "إمبراطور", emoji: "🌟", color: "#ff0000", minExp: 3000 },
  { level: 8, name: "إله الحرب", emoji: "🔥", color: "#cc0000", minExp: 4000 },
  { level: 9, name: "سيد الجحيم", emoji: "😈", color: "#990000", minExp: 5500 }
];

function calculateRank(exp) {
  let rank = RANKS[0];
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (exp >= RANKS[i].minExp) { rank = RANKS[i]; break; }
  }
  const nextRank = RANKS[rank.level + 1] || rank;
  const diff = nextRank.minExp - rank.minExp;
  const progress = diff === 0 ? 100 : Math.min(((exp - rank.minExp) / diff) * 100, 100);
  return { current: rank, next: nextRank, progress: progress };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ║                      CANVAS CONFIGURATION CONSTANTS                          ║
// ║                      ثوابت إعدادات الكانفاس                                ║
// ═══════════════════════════════════════════════════════════════════════════════

const CANVAS_CONFIG = {
  WIDTH: 720,
  HEIGHT: 480,
  SCALE_FACTOR: 2  // لدقة أعلى
};

const COLORS = {
  BLACK: {
    PURE: "#000000",
    DARK_RED_1: "rgba(60, 0, 0, 0.3)",
    DARK_RED_2: "rgba(30, 0, 0, 0.18)",
    DARK_RED_3: "rgba(20, 0, 0, 0.6)",
    DARK_RED_4: "rgba(0, 0, 0, 0.5)",
    DARK_RED_5: "rgba(0, 0, 0, 0.6)",
    DARK_RED_6: "rgba(0, 0, 0, 0.75)",
    DARK_1: "#1a0000",
    DARK_2: "#220000"
  },
  RED: {
    PURE: "#ff0000",
    LIGHT: "#ff3333",
    MEDIUM: "#ff4444",
    DARK: "#880000",
    VERY_DARK: "#cc0000",
    TRANSPARENT_1: "rgba(255, 0, 0, 0.2)",
    TRANSPARENT_2: "rgba(255, 0, 0, 0.035)",
    GRID: "rgba(255, 0, 0, 0.035)"
  },
  WHITE: {
    PURE: "#ffffff"
  },
  GRAY: {
    LIGHT: "#777777",
    MEDIUM: "#888888",
    DARK: "#999999"
  },
  GOLD: {
    LIGHT: "#ffeb3b",
    MEDIUM: "#ffc107",
    DARK: "#ff9800",
    SHADOW: "#ffcc00"
  }
};

const POSITIONS = {
  BANNER: {
    TOP: {
      Y: 42,
      LEFT_START: 10,
      LEFT_END: 195,
      LEFT_ANGLE_1: 205,
      LEFT_ANGLE_2: 210,
      RIGHT_START: 710,
      RIGHT_END: 525,
      RIGHT_ANGLE_1: 515,
      RIGHT_ANGLE_2: 510
    },
    BOX: {
      TOP_LEFT_X: 215,
      TOP_LEFT_Y: 25,
      TOP_RIGHT_X: 505,
      TOP_RIGHT_Y: 25,
      CORNER_1_X: 520,
      CORNER_1_Y: 42,
      CORNER_2_X: 520,
      CORNER_2_Y: 60,
      BOTTOM_RIGHT_X: 505,
      BOTTOM_RIGHT_Y: 77,
      BOTTOM_LEFT_X: 215,
      BOTTOM_LEFT_Y: 77,
      CORNER_3_X: 200,
      CORNER_3_Y: 60,
      CORNER_4_X: 200,
      CORNER_4_Y: 42
    },
    TEXT: {
      X: 360,
      Y: 58
    }
  },
  USERNAME: {
    X: 55,
    Y: 125,
    CIRCLE: {
      X_OFFSET: -20,
      Y_OFFSET: -12,
      RADIUS: 22
    },
    TEXT: {
      X_OFFSET: 12
    },
    BANNER: {
      TOP_Y_OFFSET: 12,
      BOTTOM_Y_OFFSET: 52,
      LEFT_X_OFFSET: -25,
      RIGHT_X: 285,
      CORNER_RIGHT_X: 295,
      CORNER_LEFT_X_OFFSET: -30
    }
  },
  PANEL: {
    X: 30,
    Y: 205,
    WIDTH: 345,
    HEIGHT: 215,
    CORNER_OFFSET: 8,
    CORNER_HEIGHT: 12
  },
  ROWS: {
    BALANCE: {
      Y_OFFSET: 48,
      ICON_X_OFFSET: 28,
      ICON_Y_OFFSET: -18,
      ICON_SIZE: 26,
      PROGRESS_Y_OFFSET: 10,
      PROGRESS_HEIGHT: 7
    },
    XP: {
      Y_SPACING: 68
    },
    MSG: {
      Y_SPACING: 68
    }
  },
  AVATAR: {
    SIZE: 265,
    CENTER_X_OFFSET: 168,
    CENTER_Y_OFFSET: 18,
    RING_1_OFFSET: 4,
    RING_2_OFFSET: 11,
    RING_3_OFFSET: 18
  },
  BOTTOM_LINE: {
    Y_OFFSET: 22,
    LEFT_X: 20,
    RIGHT_X_OFFSET: 30,
    ARROW: {
      TOP_Y_OFFSET: 32,
      BOTTOM_Y_OFFSET: 12,
      LEFT_X_OFFSET: 35,
      POINT_X_OFFSET: 10
    }
  }
};

const SHADOWS = {
  BANNER: {
    LINE_BLUR: 15,
    BOX_BLUR: 18,
    TEXT_BLUR: 22
  },
  USERNAME: {
    TEXT_BLUR: 12,
    BANNER_BLUR: 10
  },
  PANEL: {
    BLUR: 20
  },
  PROGRESS_BAR: {
    BACKGROUND_BLUR: 3,
    FILL_BLUR: 12
  },
  COIN: {
    BLUR: 8,
    TEXT_BLUR: 2
  },
  XP: {
    BLUR: 10,
    TEXT_BLUR: 2
  },
  MESSAGE: {
    BLUR: 8
  },
  AVATAR: {
    RING_1_BLUR: 13,
    RING_2_BLUR: 16,
    RING_3_BLUR: 19
  },
  BOTTOM_LINE: {
    BLUR: 16,
    ARROW_BLUR: 20
  }
};

const FONTS = {
  BANNER: "bold 30px Arial",
  USERNAME: "bold 40px Arial",
  BALANCE_LABEL: "16px Arial",
  XP_LABEL_LEFT: "bold 20px Arial",
  XP_LABEL_RIGHT: "16px Arial",
  MSG_LABEL: "bold 20px Arial",
  COIN_SYMBOL: (size) => `bold ${size * 0.65}px Arial`,
  XP_SYMBOL: (size) => `bold ${size * 0.5}px Arial`
};

const LINE_WIDTHS = {
  BANNER_LINE: 2,
  BANNER_BOX: 2,
  USERNAME_BANNER: 2,
  PANEL: 2.5,
  AVATAR_RING_1: 3,
  AVATAR_RING_2: 2.5,
  AVATAR_RING_3: 2,
  BOTTOM_LINE: 2,
  GRID: 0.5
};

// ═══════════════════════════════════════════════════════════════════════════════
// ║                    ATOMIC DRAWING FUNCTIONS                                  ║
// ║                    دوال الرسم الذرية - كل دالة لعنصر واحد                  ║
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * دالة رسم بكسل واحد (للدقة القصوى)
 */
function drawPixel(ctx, x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

/**
 * دالة رسم خط أفقي بكسل بكسل
 */
function drawHorizontalLinePixelByPixel(ctx, x1, x2, y, color) {
  ctx.fillStyle = color;
  for (let x = x1; x <= x2; x++) {
    ctx.fillRect(x, y, 1, 1);
  }
}

/**
 * دالة رسم خط عمودي بكسل بكسل
 */
function drawVerticalLinePixelByPixel(ctx, x, y1, y2, color) {
  ctx.fillStyle = color;
  for (let y = y1; y <= y2; y++) {
    ctx.fillRect(x, y, 1, 1);
  }
}

/**
 * دالة رسم الخلفية السوداء النقية
 */
function drawPureBlackBackground(ctx, width, height) {
  ctx.fillStyle = COLORS.BLACK.PURE;
  ctx.fillRect(0, 0, width, height);
}

/**
 * دالة إنشاء التدرج الأحمر الشعاعي
 */
function createRadialRedGradient(ctx, centerX, centerY, radius) {
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  gradient.addColorStop(0, COLORS.BLACK.DARK_RED_1);
  gradient.addColorStop(0.6, COLORS.BLACK.DARK_RED_2);
  gradient.addColorStop(1, COLORS.BLACK.PURE);
  return gradient;
}

/**
 * دالة رسم التدرج الأحمر على الخلفية
 */
function drawRedGradientOverlay(ctx, width, height) {
  const gradient = createRadialRedGradient(ctx, width / 2, height / 2, 500);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * دالة رسم خط واحد من الشبكة العمودي
 */
function drawSingleVerticalGridLine(ctx, x, height) {
  ctx.strokeStyle = COLORS.RED.GRID;
  ctx.lineWidth = LINE_WIDTHS.GRID;
  ctx.beginPath();
  ctx.moveTo(x, 0);
  ctx.lineTo(x, height);
  ctx.stroke();
}

/**
 * دالة رسم خط واحد من الشبكة الأفقي
 */
function drawSingleHorizontalGridLine(ctx, y, width) {
  ctx.strokeStyle = COLORS.RED.GRID;
  ctx.lineWidth = LINE_WIDTHS.GRID;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();
}

/**
 * دالة رسم جميع الخطوط العمودية للشبكة
 */
function drawAllVerticalGridLines(ctx, width, height, spacing = 30) {
  for (let x = 0; x < width; x += spacing) {
    drawSingleVerticalGridLine(ctx, x, height);
  }
}

/**
 * دالة رسم جميع الخطوط الأفقية للشبكة
 */
function drawAllHorizontalGridLines(ctx, width, height, spacing = 30) {
  for (let y = 0; y < height; y += spacing) {
    drawSingleHorizontalGridLine(ctx, y, width);
  }
}

/**
 * دالة رسم الشبكة الكاملة
 */
function drawCompleteGridPattern(ctx, width, height) {
  drawAllVerticalGridLines(ctx, width, height);
  drawAllHorizontalGridLines(ctx, width, height);
}

/**
 * دالة إعداد الظل للرسم
 */
function setupShadow(ctx, color, blur) {
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

/**
 * دالة إزالة الظل
 */
function clearShadow(ctx) {
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
}

/**
 * دالة رسم الخط الأيسر العلوي للبانر
 */
function drawBannerTopLeftLine(ctx) {
  const pos = POSITIONS.BANNER.TOP;
  
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.BANNER.LINE_BLUR);
  ctx.strokeStyle = COLORS.RED.PURE;
  ctx.lineWidth = LINE_WIDTHS.BANNER_LINE;
  
  ctx.beginPath();
  ctx.moveTo(pos.LEFT_START, pos.Y);
  ctx.lineTo(pos.LEFT_END, pos.Y);
  ctx.lineTo(pos.LEFT_ANGLE_1, 35);
  ctx.lineTo(pos.LEFT_ANGLE_2, pos.Y);
  ctx.stroke();
  
  clearShadow(ctx);
}

/**
 * دالة رسم الخط الأيمن العلوي للبانر
 */
function drawBannerTopRightLine(ctx) {
  const pos = POSITIONS.BANNER.TOP;
  
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.BANNER.LINE_BLUR);
  ctx.strokeStyle = COLORS.RED.PURE;
  ctx.lineWidth = LINE_WIDTHS.BANNER_LINE;
  
  ctx.beginPath();
  ctx.moveTo(pos.RIGHT_START, pos.Y);
  ctx.lineTo(pos.RIGHT_END, pos.Y);
  ctx.lineTo(pos.RIGHT_ANGLE_1, 35);
  ctx.lineTo(pos.RIGHT_ANGLE_2, pos.Y);
  ctx.stroke();
  
  clearShadow(ctx);
}

/**
 * دالة رسم الخطوط الجانبية للبانر
 */
function drawBannerSideLines(ctx) {
  drawBannerTopLeftLine(ctx);
  drawBannerTopRightLine(ctx);
}

/**
 * دالة إنشاء مسار صندوق البانر
 */
function createBannerBoxPath(ctx) {
  const box = POSITIONS.BANNER.BOX;
  
  ctx.beginPath();
  ctx.moveTo(box.TOP_LEFT_X, box.TOP_LEFT_Y);
  ctx.lineTo(box.TOP_RIGHT_X, box.TOP_RIGHT_Y);
  ctx.lineTo(box.CORNER_1_X, box.CORNER_1_Y);
  ctx.lineTo(box.CORNER_2_X, box.CORNER_2_Y);
  ctx.lineTo(box.BOTTOM_RIGHT_X, box.BOTTOM_RIGHT_Y);
  ctx.lineTo(box.BOTTOM_LEFT_X, box.BOTTOM_LEFT_Y);
  ctx.lineTo(box.CORNER_3_X, box.CORNER_3_Y);
  ctx.lineTo(box.CORNER_4_X, box.CORNER_4_Y);
  ctx.closePath();
}

/**
 * دالة رسم خلفية صندوق البانر
 */
function drawBannerBoxBackground(ctx) {
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.BANNER.BOX_BLUR);
  ctx.fillStyle = COLORS.BLACK.DARK_RED_4;
  createBannerBoxPath(ctx);
  ctx.fill();
  clearShadow(ctx);
}

/**
 * دالة رسم إطار صندوق البانر
 */
function drawBannerBoxBorder(ctx) {
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.BANNER.BOX_BLUR);
  ctx.strokeStyle = COLORS.RED.PURE;
  ctx.lineWidth = LINE_WIDTHS.BANNER_BOX;
  createBannerBoxPath(ctx);
  ctx.stroke();
  clearShadow(ctx);
}

/**
 * دالة رسم صندوق البانر الكامل
 */
function drawBannerBox(ctx) {
  drawBannerBoxBackground(ctx);
  drawBannerBoxBorder(ctx);
}

/**
 * دالة رسم نص KIRA BANK
 */
function drawBannerText(ctx) {
  const textPos = POSITIONS.BANNER.TEXT;
  
  ctx.font = FONTS.BANNER;
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.RED.PURE;
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.BANNER.TEXT_BLUR);
  ctx.fillText("KIRA BANK", textPos.X, textPos.Y);
  clearShadow(ctx);
}

/**
 * دالة رسم البانر العلوي الكامل
 */
function drawCompleteBanner(ctx) {
  drawBannerSideLines(ctx);
  drawBannerBox(ctx);
  drawBannerText(ctx);
}

/**
 * دالة رسم الدائرة الحمراء خلف اسم المستخدم
 */
function drawUsernameCircle(ctx) {
  const pos = POSITIONS.USERNAME;
  
  ctx.fillStyle = COLORS.RED.TRANSPARENT_1;
  ctx.beginPath();
  ctx.arc(
    pos.X + pos.CIRCLE.X_OFFSET,
    pos.Y + pos.CIRCLE.Y_OFFSET,
    pos.CIRCLE.RADIUS,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

/**
 * دالة رسم نص اسم المستخدم
 */
function drawUsernameText(ctx, username) {
  const pos = POSITIONS.USERNAME;
  
  ctx.font = FONTS.USERNAME;
  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.WHITE.PURE;
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.USERNAME.TEXT_BLUR);
  ctx.fillText(username, pos.X + pos.TEXT.X_OFFSET, pos.Y);
  clearShadow(ctx);
}

/**
 * دالة إنشاء مسار بانر اسم المستخدم
 */
function createUsernameBannerPath(ctx) {
  const pos = POSITIONS.USERNAME;
  const banner = pos.BANNER;
  
  ctx.beginPath();
  ctx.moveTo(pos.X + banner.LEFT_X_OFFSET, pos.Y + banner.TOP_Y_OFFSET);
  ctx.lineTo(banner.RIGHT_X, pos.Y + banner.TOP_Y_OFFSET);
  ctx.lineTo(banner.CORNER_RIGHT_X, pos.Y + 22);
  ctx.lineTo(banner.CORNER_RIGHT_X, pos.Y + 42);
  ctx.lineTo(banner.RIGHT_X, pos.Y + banner.BOTTOM_Y_OFFSET);
  ctx.lineTo(pos.X + banner.LEFT_X_OFFSET, pos.Y + banner.BOTTOM_Y_OFFSET);
  ctx.lineTo(pos.X + banner.CORNER_LEFT_X_OFFSET, pos.Y + 42);
  ctx.lineTo(pos.X + banner.CORNER_LEFT_X_OFFSET, pos.Y + 22);
  ctx.closePath();
}

/**
 * دالة رسم خلفية بانر اسم المستخدم
 */
function drawUsernameBannerBackground(ctx) {
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.USERNAME.BANNER_BLUR);
  ctx.fillStyle = COLORS.BLACK.DARK_RED_5;
  createUsernameBannerPath(ctx);
  ctx.fill();
  clearShadow(ctx);
}

/**
 * دالة رسم إطار بانر اسم المستخدم
 */
function drawUsernameBannerBorder(ctx) {
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.USERNAME.BANNER_BLUR);
  ctx.strokeStyle = COLORS.RED.PURE;
  ctx.lineWidth = LINE_WIDTHS.USERNAME_BANNER;
  createUsernameBannerPath(ctx);
  ctx.stroke();
  clearShadow(ctx);
}

/**
 * دالة رسم بانر اسم المستخدم الكامل
 */
function drawUsernameBanner(ctx) {
  drawUsernameBannerBackground(ctx);
  drawUsernameBannerBorder(ctx);
}

/**
 * دالة رسم قسم اسم المستخدم الكامل
 */
function drawCompleteUsernameSection(ctx, username) {
  drawUsernameCircle(ctx);
  drawUsernameText(ctx, username);
  drawUsernameBanner(ctx);
}

/**
 * دالة إنشاء مسار لوحة المعلومات
 */
function createPanelPath(ctx) {
  const panel = POSITIONS.PANEL;
  
  ctx.beginPath();
  ctx.moveTo(panel.X + panel.CORNER_OFFSET, panel.Y);
  ctx.lineTo(panel.X + panel.WIDTH - panel.CORNER_OFFSET, panel.Y);
  ctx.lineTo(panel.X + panel.WIDTH, panel.Y + panel.CORNER_HEIGHT);
  ctx.lineTo(panel.X + panel.WIDTH, panel.Y + panel.HEIGHT - panel.CORNER_HEIGHT);
  ctx.lineTo(panel.X + panel.WIDTH - panel.CORNER_OFFSET, panel.Y + panel.HEIGHT);
  ctx.lineTo(panel.X + panel.CORNER_OFFSET, panel.Y + panel.HEIGHT);
  ctx.lineTo(panel.X, panel.Y + panel.HEIGHT - panel.CORNER_HEIGHT);
  ctx.lineTo(panel.X, panel.Y + panel.CORNER_HEIGHT);
  ctx.closePath();
}

/**
 * دالة رسم خلفية لوحة المعلومات
 */
function drawPanelBackground(ctx) {
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.PANEL.BLUR);
  ctx.fillStyle = COLORS.BLACK.DARK_RED_6;
  createPanelPath(ctx);
  ctx.fill();
  clearShadow(ctx);
}

/**
 * دالة رسم إطار لوحة المعلومات
 */
function drawPanelBorder(ctx) {
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.PANEL.BLUR);
  ctx.strokeStyle = COLORS.RED.PURE;
  ctx.lineWidth = LINE_WIDTHS.PANEL;
  createPanelPath(ctx);
  ctx.stroke();
  clearShadow(ctx);
}

/**
 * دالة رسم لوحة المعلومات الكاملة
 */
function drawCompletePanel(ctx) {
  drawPanelBackground(ctx);
  drawPanelBorder(ctx);
}

/**
 * دالة إنشاء تدرج ذهبي للعملة
 */
function createGoldGradient(ctx, x, y, size) {
  const gradient = ctx.createRadialGradient(
    x + size / 2,
    y + size / 2,
    0,
    x + size / 2,
    y + size / 2,
    size / 2
  );
  gradient.addColorStop(0, COLORS.GOLD.LIGHT);
  gradient.addColorStop(0.5, COLORS.GOLD.MEDIUM);
  gradient.addColorStop(1, COLORS.GOLD.DARK);
  return gradient;
}

/**
 * دالة رسم دائرة العملة الذهبية
 */
function drawCoinCircle(ctx, x, y, size) {
  const gradient = createGoldGradient(ctx, x, y, size);
  
  setupShadow(ctx, COLORS.GOLD.SHADOW, SHADOWS.COIN.BLUR);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
}

/**
 * دالة رسم رمز الدولار على العملة
 */
function drawDollarSymbol(ctx, x, y, size) {
  ctx.font = FONTS.COIN_SYMBOL(size);
  ctx.fillStyle = COLORS.WHITE.PURE;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  setupShadow(ctx, COLORS.BLACK.PURE, SHADOWS.COIN.TEXT_BLUR);
  ctx.fillText("$", x + size / 2, y + size / 2 + 1);
  clearShadow(ctx);
}

/**
 * دالة رسم أيقونة العملة الكاملة
 */
function drawCompleteCoinIcon(ctx, x, y, size) {
  drawCoinCircle(ctx, x, y, size);
  drawDollarSymbol(ctx, x, y, size);
}

/**
 * دالة رسم دائرة XP
 */
function drawXPCircle(ctx, x, y, size) {
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.XP.BLUR);
  ctx.fillStyle = COLORS.RED.PURE;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
  clearShadow(ctx);
}

/**
 * دالة رسم نص XP
 */
function drawXPText(ctx, x, y, size) {
  ctx.font = FONTS.XP_SYMBOL(size);
  ctx.fillStyle = COLORS.WHITE.PURE;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  setupShadow(ctx, COLORS.BLACK.PURE, SHADOWS.XP.TEXT_BLUR);
  ctx.fillText("XP", x + size / 2, y + size / 2);
  clearShadow(ctx);
}

/**
 * دالة رسم أيقونة XP الكاملة
 */
function drawCompleteXPIcon(ctx, x, y, size) {
  drawXPCircle(ctx, x, y, size);
  drawXPText(ctx, x, y, size);
}

/**
 * دالة رسم جسم الظرف (أيقونة الرسائل)
 */
function drawEnvelopeBody(ctx, x, y, size) {
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.MESSAGE.BLUR);
  ctx.fillStyle = COLORS.RED.PURE;
  ctx.beginPath();
  ctx.roundRect(x + 2, y + size * 0.25, size - 4, size * 0.55, 3);
  ctx.fill();
  clearShadow(ctx);
}

/**
 * دالة رسم غطاء الظرف (المثلث)
 */
function drawEnvelopeFlap(ctx, x, y, size) {
  ctx.fillStyle = COLORS.RED.DARK;
  ctx.beginPath();
  ctx.moveTo(x + 2, y + size * 0.25);
  ctx.lineTo(x + size / 2, y + size * 0.55);
  ctx.lineTo(x + size - 2, y + size * 0.25);
  ctx.closePath();
  ctx.fill();
}

/**
 * دالة رسم أيقونة الرسائل الكاملة
 */
function drawCompleteMessageIcon(ctx, x, y, size) {
  drawEnvelopeBody(ctx, x, y, size);
  drawEnvelopeFlap(ctx, x, y, size);
}

/**
 * دالة رسم خلفية شريط التقدم
 */
function drawProgressBarBackground(ctx, x, y, width, height) {
  setupShadow(ctx, COLORS.BLACK.PURE, SHADOWS.PROGRESS_BAR.BACKGROUND_BLUR);
  ctx.fillStyle = COLORS.BLACK.DARK_RED_3;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, height / 2);
  ctx.fill();
  clearShadow(ctx);
}

/**
 * دالة رسم تعبئة شريط التقدم
 */
function drawProgressBarFill(ctx, x, y, width, height, progress, color) {
  const fillWidth = (progress / 100) * width;
  
  if (fillWidth > 0) {
    setupShadow(ctx, color, SHADOWS.PROGRESS_BAR.FILL_BLUR);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, fillWidth, height, height / 2);
    ctx.fill();
    clearShadow(ctx);
  }
}

/**
 * دالة رسم شريط التقدم الكامل
 */
function drawCompleteProgressBar(ctx, x, y, width, height, progress, color) {
  drawProgressBarBackground(ctx, x, y, width, height);
  drawProgressBarFill(ctx, x, y, width, height, progress, color);
}

/**
 * دالة رسم نص BALANCE
 */
function drawBalanceLabel(ctx, x, y) {
  ctx.font = FONTS.BALANCE_LABEL;
  ctx.fillStyle = COLORS.GRAY.LIGHT;
  ctx.textAlign = "right";
  ctx.fillText("BALANCE", x, y);
}

/**
 * دالة رسم سطر BALANCE الكامل
 */
function drawCompleteBalanceRow(ctx, money) {
  const panel = POSITIONS.PANEL;
  const row = POSITIONS.ROWS.BALANCE;
  const rowY = panel.Y + row.Y_OFFSET;
  
  drawCompleteCoinIcon(ctx, panel.X + row.ICON_X_OFFSET, rowY + row.ICON_Y_OFFSET, row.ICON_SIZE);
  drawBalanceLabel(ctx, panel.X + panel.WIDTH - 28, rowY);
  
  const balanceProgress = Math.min((money / 50000000) * 100, 100);
  drawCompleteProgressBar(
    ctx,
    panel.X + row.ICON_X_OFFSET,
    rowY + row.PROGRESS_Y_OFFSET,
    panel.WIDTH - 56,
    row.PROGRESS_HEIGHT,
    balanceProgress,
    COLORS.RED.PURE
  );
}

/**
 * دالة رسم نص XP الأيسر
 */
function drawXPLabelLeft(ctx, x, y) {
  ctx.font = FONTS.XP_LABEL_LEFT;
  ctx.fillStyle = COLORS.RED.LIGHT;
  ctx.textAlign = "left";
  ctx.fillText("XP", x, y);
}

/**
 * دالة رسم نص XP الأيمن
 */
function drawXPLabelRight(ctx, x, y) {
  ctx.font = FONTS.XP_LABEL_RIGHT;
  ctx.fillStyle = COLORS.GRAY.LIGHT;
  ctx.textAlign = "right";
  ctx.fillText("XP", x, y);
}

/**
 * دالة رسم سطر XP الكامل
 */
function drawCompleteXPRow(ctx, rankData) {
  const panel = POSITIONS.PANEL;
  const row = POSITIONS.ROWS.BALANCE;
  const rowY = panel.Y + row.Y_OFFSET + POSITIONS.ROWS.XP.Y_SPACING;
  
  drawCompleteXPIcon(ctx, panel.X + row.ICON_X_OFFSET, rowY + row.ICON_Y_OFFSET, row.ICON_SIZE);
  drawXPLabelLeft(ctx, panel.X + 62, rowY);
  drawXPLabelRight(ctx, panel.X + panel.WIDTH - 28, rowY);
  
  drawCompleteProgressBar(
    ctx,
    panel.X + row.ICON_X_OFFSET,
    rowY + row.PROGRESS_Y_OFFSET,
    panel.WIDTH - 56,
    row.PROGRESS_HEIGHT,
    rankData.progress,
    COLORS.RED.PURE
  );
}

/**
 * دالة رسم نص MSG
 */
function drawMSGLabel(ctx, x, y) {
  ctx.font = FONTS.MSG_LABEL;
  ctx.fillStyle = COLORS.RED.PURE;
  ctx.textAlign = "left";
  ctx.fillText("MSG", x, y);
}

/**
 * دالة رسم سطر MSG الكامل
 */
function drawCompleteMSGRow(ctx) {
  const panel = POSITIONS.PANEL;
  const row = POSITIONS.ROWS.BALANCE;
  const rowY = panel.Y + row.Y_OFFSET + POSITIONS.ROWS.XP.Y_SPACING + POSITIONS.ROWS.MSG.Y_SPACING;
  
  drawCompleteMessageIcon(ctx, panel.X + row.ICON_X_OFFSET, rowY + row.ICON_Y_OFFSET, row.ICON_SIZE);
  drawMSGLabel(ctx, panel.X + 62, rowY);
}

/**
 * دالة تحميل صورة البروفايل
 */
async function loadAvatarImage(userID) {
  try {
    const avatarUrl = `https://graph.facebook.com/${userID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const response = await axios.get(avatarUrl, { responseType: "arraybuffer" });
    return await Canvas.loadImage(Buffer.from(response.data));
  } catch (e) {
    return null;
  }
}

/**
 * دالة رسم صورة البروفايل بشكل دائري
 */
function drawCircularAvatar(ctx, avatar, centerX, centerY, size) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, centerX - size / 2, centerY - size / 2, size, size);
  ctx.restore();
}

/**
 * دالة رسم دائرة فارغة كبديل للصورة
 */
function drawFallbackCircle(ctx, centerX, centerY, size) {
  ctx.fillStyle = COLORS.BLACK.DARK_1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * دالة رسم الحلقة النيون الأولى
 */
function drawAvatarRing1(ctx, centerX, centerY, size) {
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.AVATAR.RING_1_BLUR);
  ctx.strokeStyle = COLORS.RED.PURE;
  ctx.lineWidth = LINE_WIDTHS.AVATAR_RING_1;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2 + POSITIONS.AVATAR.RING_1_OFFSET, 0, Math.PI * 2);
  ctx.stroke();
  clearShadow(ctx);
}

/**
 * دالة رسم الحلقة النيون الثانية
 */
function drawAvatarRing2(ctx, centerX, centerY, size) {
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.AVATAR.RING_2_BLUR);
  ctx.strokeStyle = COLORS.RED.PURE;
  ctx.lineWidth = LINE_WIDTHS.AVATAR_RING_2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2 + POSITIONS.AVATAR.RING_2_OFFSET, 0, Math.PI * 2);
  ctx.stroke();
  clearShadow(ctx);
}

/**
 * دالة رسم الحلقة النيون الثالثة
 */
function drawAvatarRing3(ctx, centerX, centerY, size) {
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.AVATAR.RING_3_BLUR);
  ctx.strokeStyle = COLORS.RED.PURE;
  ctx.lineWidth = LINE_WIDTHS.AVATAR_RING_3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size / 2 + POSITIONS.AVATAR.RING_3_OFFSET, 0, Math.PI * 2);
  ctx.stroke();
  clearShadow(ctx);
}

/**
 * دالة رسم جميع الحلقات النيون
 */
function drawAllAvatarRings(ctx, centerX, centerY, size) {
  drawAvatarRing1(ctx, centerX, centerY, size);
  drawAvatarRing2(ctx, centerX, centerY, size);
  drawAvatarRing3(ctx, centerX, centerY, size);
}

/**
 * دالة رسم قسم صورة البروفايل الكامل
 */
async function drawCompleteAvatarSection(ctx, userID, width, height) {
  const avatarSize = POSITIONS.AVATAR.SIZE;
  const centerX = width - POSITIONS.AVATAR.CENTER_X_OFFSET;
  const centerY = height / 2 + POSITIONS.AVATAR.CENTER_Y_OFFSET;
  
  const avatar = await loadAvatarImage(userID);
  
  if (avatar) {
    drawCircularAvatar(ctx, avatar, centerX, centerY, avatarSize);
  } else {
    drawFallbackCircle(ctx, centerX, centerY, avatarSize);
  }
  
  drawAllAvatarRings(ctx, centerX, centerY, avatarSize);
}

/**
 * دالة رسم الخط الأفقي السفلي
 */
function drawBottomHorizontalLine(ctx, width, height) {
  const pos = POSITIONS.BOTTOM_LINE;
  
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.BOTTOM_LINE.BLUR);
  ctx.strokeStyle = COLORS.RED.PURE;
  ctx.lineWidth = LINE_WIDTHS.BOTTOM_LINE;
  ctx.beginPath();
  ctx.moveTo(pos.LEFT_X, height - pos.Y_OFFSET);
  ctx.lineTo(width - pos.RIGHT_X_OFFSET, height - pos.Y_OFFSET);
  ctx.stroke();
  clearShadow(ctx);
}

/**
 * دالة رسم السهم الأحمر
 */
function drawBottomArrow(ctx, width, height) {
  const pos = POSITIONS.BOTTOM_LINE;
  const arrow = pos.ARROW;
  
  setupShadow(ctx, COLORS.RED.PURE, SHADOWS.BOTTOM_LINE.ARROW_BLUR);
  ctx.fillStyle = COLORS.RED.PURE;
  ctx.beginPath();
  ctx.moveTo(width - arrow.LEFT_X_OFFSET, height - arrow.TOP_Y_OFFSET);
  ctx.lineTo(width - arrow.POINT_X_OFFSET, height - pos.Y_OFFSET);
  ctx.lineTo(width - arrow.LEFT_X_OFFSET, height - arrow.BOTTOM_Y_OFFSET);
  ctx.closePath();
  ctx.fill();
  clearShadow(ctx);
}

/**
 * دالة رسم الخط السفلي الكامل مع السهم
 */
function drawCompleteBottomLine(ctx, width, height) {
  drawBottomHorizontalLine(ctx, width, height);
  drawBottomArrow(ctx, width, height);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ║                    MAIN CARD CREATION FUNCTION                               ║
// ║                    الدالة الرئيسية لإنشاء البطاقة                          ║
// ═══════════════════════════════════════════════════════════════════════════════

async function createRankCard(data) {
  const WIDTH = CANVAS_CONFIG.WIDTH;
  const HEIGHT = CANVAS_CONFIG.HEIGHT;
  const canvas = Canvas.createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  // المرحلة 1: الخلفية
  drawPureBlackBackground(ctx, WIDTH, HEIGHT);
  drawRedGradientOverlay(ctx, WIDTH, HEIGHT);
  drawCompleteGridPattern(ctx, WIDTH, HEIGHT);

  // المرحلة 2: البانر العلوي
  drawCompleteBanner(ctx);

  // المرحلة 3: قسم اسم المستخدم
  drawCompleteUsernameSection(ctx, data.username);

  // المرحلة 4: لوحة المعلومات
  drawCompletePanel(ctx);

  // المرحلة 5: الصفوف (BALANCE, XP, MSG)
  drawCompleteBalanceRow(ctx, data.money);
  drawCompleteXPRow(ctx, data.rankData);
  drawCompleteMSGRow(ctx);

  // المرحلة 6: صورة البروفايل
  await drawCompleteAvatarSection(ctx, data.userID, WIDTH, HEIGHT);

  // المرحلة 7: الخط السفلي
  drawCompleteBottomLine(ctx, WIDTH, HEIGHT);

  return canvas.toBuffer("image/png");
}
