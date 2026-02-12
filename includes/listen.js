module.exports = function({ api, models }) {
    const logger = require("../utils/log.js");
    const fs = require("fs");
    const Users = require("./controllers/users")({ models, api });
    const Threads = require("./controllers/threads")({ models, api });
    const Currencies = require("./controllers/currencies")({ models });
    
    const handleCommand = require("./handle/handleCommand")({ api, models, Users, Threads, Currencies });
    const handleCommandEvent = require("./handle/handleCommandEvent")({ api, models, Users, Threads, Currencies });
    const handleReply = require("./handle/handleReply")({ api, models, Users, Threads, Currencies });
    const handleReaction = require("./handle/handleReaction")({ api, models, Users, Threads, Currencies });
    const handleEvent = require("./handle/handleEvent")({ api, models, Users, Threads, Currencies });
    const handleRefresh = require("./handle/handleRefresh")({ api, models, Users, Threads, Currencies });
    const handleCreateDatabase = require("./handle/handleCreateDatabase")({ api, Threads, Users, Currencies, models });

    logger.loader(`====== ${global.config.PREFIX} ======`);

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
    //========= تحميل البيانات من قاعدة البيانات =========//
    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
    
    (async function() {
        try {
            logger(global.getText('listen', 'startLoadEnvironment'), '[ Database ]');
            
            let threads = await Threads.getAll(['threadID', 'data', 'threadInfo']);
            let users = await Users.getAll(['userID', 'name', 'data']);
            let currencies = await Currencies.getAll(['userID']);

            for (const thread of threads) {
                const idThread = String(thread.threadID);
                global.data.allThreadID.push(idThread);
                global.data.threadData.set(idThread, thread.data || {});
                global.data.threadInfo.set(idThread, thread.threadInfo || {});
                
                if (thread.data && thread.data.banned == 1) {
                    global.data.threadBanned.set(idThread, {
                        'reason': thread.data.reason || '',
                        'dateAdded': thread.data.dateAdded || ''
                    });
                }
                
                if (thread.data && thread.data.commandBanned && thread.data.commandBanned.length != 0) {
                    global.data['commandBanned'].set(idThread, thread.data['commandBanned']);
                }
                
                if (thread.data && thread.data.NSFW) {
                    global.data['threadAllowNSFW'].push(idThread);
                }
            }

            logger.loader(global.getText('listen', 'loadedEnvironmentThread'));

            for (const user of users) {
                const idUsers = String(user.userID);
                global.data.allUserID.push(idUsers);
                
                if (user.name && user.name.length != 0) {
                    global.data.userName.set(idUsers, user.name);
                }
                
                if (user.data && user.data.banned == 1) {
                    global.data.userBanned.set(idUsers, {
                        'reason': user.data.reason || '',
                        'dateAdded': user.data.dateAdded || ''
                    });
                }
                
                if (user.data && user.data.commandBanned && user.data.commandBanned.length != 0) {
                    global.data['commandBanned'].set(idUsers, user.data['commandBanned']);
                }
            }

            for (const currency of currencies) {
                global.data.allCurrenciesID.push(String(currency.userID));
            }

            logger.loader(global.getText('listen', 'successLoadEnvironment'));
            logger(global.getText('listen', 'finishLoadEnvironment'), '[ Database ]');
        } catch (error) {
            return logger.loader(global.getText('listen', 'failLoadEnvironment', error), 'error');
        }
    }());

    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//
    //============ معالج الأحداث الرئيسي ============//
    //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━//

    logger(`[ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? "Made by KIRA" : global.config.BOTNAME}`, "[ System Info ]");

    return async (event) => {
        // تجاهل المستخدمين والمجموعات المحظورة
        if (global.data.userBanned.has(event.senderID) || 
            global.data.threadBanned.has(event.threadID) ||
            (global.config.allowInbox == false && event.senderID == event.threadID)) {
            return;
        }

        // معالجة أنواع الأحداث المختلفة
        switch (event.type) {
            case "message":
            case "message_reply":
            case "message_unsend":
                handleCreateDatabase({ event });
                handleCommand({ event });
                handleReply({ event });
                handleCommandEvent({ event });
                break;
                
            case "event":
            case "message_reaction":
                handleEvent({ event });
                handleReaction({ event });
                break;
                
            default:
                break;
        }

        return;
    };
};
