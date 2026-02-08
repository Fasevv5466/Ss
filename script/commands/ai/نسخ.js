module.exports.config = {
    name: "backupdata",
    version: "2.0.0",
    hasPermssion: 2,
    credits: "ايمن",
    description: "نسخ بيانات البوت احتياطياً",
    commandCategory: "ai",
    usages: "backupdata",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args, Users, Threads, Currencies }) {
    	const { threadID, messageID } = event;
    	
    	try {
    		const threadsData = await Threads.getAll();
    		const usersData = await Users.getAll();
    		
    		const backupDir = __dirname + "/tmp";
    		if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    		
    		const threadsPath = `${backupDir}/threadsData.json`;
    		const usersPath = `${backupDir}/usersData.json`;
    		
    		fs.writeFileSync(threadsPath, JSON.stringify(threadsData, null, 2));
    		fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
    		
    		await api.sendMessage({
    			body: "✅ | تم نسخ البيانات بنجاح",
    			attachment: [
    				fs.createReadStream(threadsPath),
    				fs.createReadStream(usersPath)
    			]
    		}, threadID, messageID);
    		
    		fs.unlinkSync(threadsPath);
    		fs.unlinkSync(usersPath);
    	} catch (error) {
    		api.sendMessage("❌ | فشل النسخ: " + error.message, threadID, messageID);
    	}
};
