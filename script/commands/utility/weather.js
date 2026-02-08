// ═══════════════════════════════════════════════════════════
// 👑 KIRA - طقس
// المطور: Ayman ♛
// الوصف: لعرض معلومات الطقس حسب المنطقة
// ═══════════════════════════════════════════════════════════

module.exports.config = {
	name: "طقس",
  aliases: [],
	version: "1.0.1",
	hasPermssion: 0,
	credits: "Ayman ♛",
	description: "لعرض معلومات الطقس حسب المنطقة",
	commandCategory: "utility",
	usages: "[موقعك]",
	cooldowns: 5,
	dependencies: {
		"moment-timezone": "",
		"request": ""
	},
	envConfig: {
		"OPEN_WEATHER": "c4ef85b93982d6627681b056e24bd438"
	}
};

module.exports.languages = {
	"vi": {
		"locationNotExist": "Địa điểm %1 không tồn tại!",
		"returnResult": "🌡 Nhiệt độ: %1°C\n🌡 Nhiệt độ cơ thể cảm nhận được: %2°C\n☁️ Cảnh quan hiện tại: %3\n💦 Độ ẩm: %4%\n💨 Tốc độ gió: %5km/h\n🌅 Mặt trời mọc vào lúc: %6\n🌄 Mặt trời lặn vào lúc: %7\n"
	},
	"en": {
		"locationNotExist": "لم اتمكن من ايجاد : %1.",
		"returnResult": "🌡 درجة الحرارة : %1℃\n🌡  يبدو وكأنها : %2℃\n☁️ السماء: %3\n💦 الرطوبة : %4%\n💨 سرعة الرياح : %5km/h\n🌅 شروق الشمس : %6\n🌄 غروب الشمس : %7"
	}
}

module.exports.run = async ({ api, event, args, getText }) => {
	const request = global.nodemodule["request"];
	const moment = global.nodemodule["moment-timezone"];
	const { throwError } = global.utils;
	const { threadID, messageID } = event;
	
	var city = args.join(" ");
	if (city.length == 0) return throwError(this.config.name, threadID, messageID);
	return request(encodeURI("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + global.configModule[this.config.name].OPEN_WEATHER + "&units=metric&lang=" + global.config.language), (err, response, body) => {
		if (err) throw err;
		var weatherData = JSON.parse(body);
		if (weatherData.cod !== 200) return api.sendMessage(getText("locationNotExist", city), threadID, messageID);
		var sunrise_date = moment.unix(weatherData.sys.sunrise).tz("Asia/Baghdad");
		var sunset_date = moment.unix(weatherData.sys.sunset).tz("Asia/Baghdad");
		api.sendMessage({
			body: getText("returnResult", weatherData.main.temp, weatherData.main.feels_like, weatherData.weather[0].description, weatherData.main.humidity, weatherData.wind.speed, sunrise_date.format('HH:mm:ss'), sunset_date.format('HH:mm:ss')),
			location: {
				latitude: weatherData.coord.lat,
				longitude: weatherData.coord.lon,
				current: true
			},
		}, threadID, messageID);
	});
}