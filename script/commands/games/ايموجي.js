module.exports.config = {
    name: "ايموجي",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "ايمن",
    description: "لعبة ايموجي  ",
    commandCategory: "games",
    usages: "ايموجي",
    cooldowns: 0
};

module.exports.run = async function({ api, event, args, Users, Threads, Currencies, models }) {
    api, event, args }) {
        const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
        const correctAnswer = randomQuestion.answer;
        const question = randomQuestion.question;
    
        const message = `اسرع شخص يرسل ايموجي: ${question}`;
    
        api.sendMessage({ body: message }, event.threadID, (error, info) => {
            if (!error) {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    correctAnswer: correctAnswer
                });
            }
        });
};
