module.exports = function ({ models }) {

  const Users = models.use("Users");
  const Currencies = models.use("Currencies");

  /* ===================== */
  /*  USERS CONTROLLER     */
  /* ===================== */

  async function ensureUser(userID, name = "Facebook User") {
    try {
      await Users.findOrCreate({
        where: { userID },
        defaults: { name }
      });
      return true;
    } catch (e) {
      console.error("[HEBA][USERS] ensureUser error:", e);
      return false;
    }
  }

  async function getUser(userID) {
    try {
      const data = await Users.findOne({ where: { userID } });
      return data ? data.get({ plain: true }) : null;
    } catch (e) {
      console.error("[HEBA][USERS] getUser error:", e);
      return null;
    }
  }

  /* ===================== */
  /*  CURRENCIES CONTROL   */
  /* ===================== */

  async function ensureWallet(userID) {
    try {
      await Currencies.findOrCreate({
        where: { userID },
        defaults: { money: 0 }
      });
      return true;
    } catch (e) {
      console.error("[HEBA][MONEY] ensureWallet error:", e);
      return false;
    }
  }

  async function getMoney(userID) {
    try {
      const data = await Currencies.findOne({ where: { userID } });
      return data ? data.money : 0;
    } catch (e) {
      console.error("[HEBA][MONEY] getMoney error:", e);
      return 0;
    }
  }

  async function addMoney(userID, amount) {
    if (typeof amount !== "number") return false;
    try {
      await ensureWallet(userID);
      const wallet = await Currencies.findOne({ where: { userID } });
      await wallet.update({ money: wallet.money + amount });
      return true;
    } catch (e) {
      console.error("[HEBA][MONEY] addMoney error:", e);
      return false;
    }
  }

  async function subtractMoney(userID, amount) {
    if (typeof amount !== "number") return false;
    try {
      await ensureWallet(userID);
      const wallet = await Currencies.findOne({ where: { userID } });
      if (wallet.money < amount) return false;
      await wallet.update({ money: wallet.money - amount });
      return true;
    } catch (e) {
      console.error("[HEBA][MONEY] subtractMoney error:", e);
      return false;
    }
  }

  /* ===================== */
  /*  SAFE SHUTDOWN HOOK   */
  /* ===================== */

  process.on("SIGINT", async () => {
    console.log("[HEBA] Bot shutting down safely...");
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    console.log("[HEBA] Bot terminated safely...");
    process.exit(0);
  });

  /* ===================== */
  /*  EXPORT API           */
  /* ===================== */

  return {
    ensureUser,
    getUser,

    ensureWallet,
    getMoney,
    addMoney,
    subtractMoney
  };
};
