module.exports = function ({ api }) {
    const moment = require("moment");
    const botID = api.getCurrentUserID();
    
    // نظام الإشعارات المتقدم
    const ADVANCED_NOTIFICATION_SYSTEM = {
        notificationHistory: [],
        importantNotifications: new Map(),
        
        async fetchNotifications() {
            const form = {
                av: botID,
                fb_api_req_friendly_name: "CometNotificationsDropdownQuery",
                fb_api_caller_class: "RelayModern",
                doc_id: "5025284284225032",
                variables: JSON.stringify({
                    "count": 10,
                    "environment": "MAIN_SURFACE",
                    "menuUseEntryPoint": true,
                    "scale": 1
                })
            };
            
            try {
                return new Promise((resolve, reject) => {
                    api.httpPost("https://www.facebook.com/api/graphql/", form, (e, i) => {
                        if (e) return reject(e);
                        
                        try {
                            const data = JSON.parse(i);
                            resolve(this.processNotifications(data));
                        } catch (parseError) {
                            reject(parseError);
                        }
                    });
                });
            } catch (error) {
                throw error;
            }
        },
        
        processNotifications(data) {
            const processed = [];
            const viewer = data.data?.viewer;
            
            if (!viewer) return processed;
            
            // معالجة الإشعارات
            for (const edge of viewer.notifications_page?.edges || []) {
                if (edge.node.row_type !== 'NOTIFICATION') continue;
                
                const notification = edge.node.notif;
                const notifID = notification.id;
                const timestamp = notification.creation_time?.timestamp;
                
                const processedNotif = {
                    id: notifID,
                    body: notification.body?.text || "بدون نص",
                    link: notification.url || "#",
                    timestamp: timestamp * 1000,
                    time: moment.tz("Asia/Baghdad").format("HH:mm:ss DD/MM/YYYY"),
                    priority: this.calculatePriority(notification),
                    category: this.categorizeNotification(notification),
                    read: false
                };
                
                // التحقق من التكرار
                if (!this.isDuplicate(processedNotif)) {
                    processed.push(processedNotif);
                    this.notificationHistory.push(processedNotif);
                    
                    // الاحتفاظ بآخر 50 إشعار فقط
                    if (this.notificationHistory.length > 50) {
                        this.notificationHistory.shift();
                    }
                }
            }
            
            return processed;
        },
        
        calculatePriority(notification) {
            const body = notification.body?.text?.toLowerCase() || "";
            let priority = 1;
            
            // كلمات عالية الأولوية
            const highPriorityWords = [
                "أضافك", "طلب", "صداقة", "مجموعة", "مهم", "عاجل",
                "added you", "friend request", "group", "important"
            ];
            
            // كلمات متوسطة الأولوية
            const mediumPriorityWords = [
                "تفاعل", "علق", "أعجب", "رد", "like", "comment", "react"
            ];
            
            if (highPriorityWords.some(word => body.includes(word))) priority = 3;
            else if (mediumPriorityWords.some(word => body.includes(word))) priority = 2;
            
            return priority;
        },
        
        categorizeNotification(notification) {
            const body = notification.body?.text?.toLowerCase() || "";
            
            if (body.includes("أضافك") || body.includes("added you")) return "FRIEND_REQUEST";
            if (body.includes("مجموعة") || body.includes("group")) return "GROUP_INVITE";
            if (body.includes("تفاعل") || body.includes("تفاعل")) return "REACTION";
            if (body.includes("علق") || body.includes("comment")) return "COMMENT";
            
            return "OTHER";
        },
        
        isDuplicate(newNotification) {
            const recentTime = Date.now() - (60 * 60 * 1000); // ساعة واحدة
            return this.notificationHistory.some(notif => 
                notif.body === newNotification.body && 
                (Date.now() - notif.timestamp) < recentTime
            );
        },
        
        async sendToAdmin(notifications) {
            if (!global.config.ADMINBOT?.[0]) return;
            
            // فلترة الإشعارات المهمة فقط
            const importantNotifications = notifications.filter(n => n.priority >= 2);
            
            if (importantNotifications.length === 0) return;
            
            // تجميع الإشعارات
            let notificationMessage = "📢 الإشعارات المهمة\n\n";
            
            importantNotifications.forEach((notif, index) => {
                notificationMessage += `━━━━━━━━━━━━━━\n`;
                notificationMessage += `📌 ${index + 1}. ${notif.body}\n`;
                notificationMessage += `⏰ ${notif.time}\n`;
                notificationMessage += `🔗 ${notif.link}\n`;
                
                if (notif.priority === 3) {
                    notificationMessage += `🚨 أولوية عالية\n`;
                }
            });
            
            notificationMessage += `\n📊 المجموع: ${importantNotifications.length} إشعار`;
            
            // إرسال للمطور
            try {
                await api.sendMessage(notificationMessage, global.config.ADMINBOT[0]);
                
                // تسجيل الإرسال
                importantNotifications.forEach(notif => {
                    this.importantNotifications.set(notif.id, {
                        ...notif,
                        sentAt: Date.now(),
                        read: true
                    });
                });
                
            } catch (error) {
                console.error("فشل إرسال الإشعارات:", error);
            }
        },
        
        getNotificationStats() {
            const total = this.notificationHistory.length;
            const unread = this.notificationHistory.filter(n => !n.read).length;
            const highPriority = this.notificationHistory.filter(n => n.priority === 3).length;
            
            return {
                total,
                unread,
                highPriority,
                categories: this.getCategoryStats()
            };
        },
        
        getCategoryStats() {
            const categories = {};
            this.notificationHistory.forEach(notif => {
                categories[notif.category] = (categories[notif.category] || 0) + 1;
            });
            return categories;
        }
    };

    // تشغيل نظام الإشعارات
    setInterval(async () => {
        try {
            const notifications = await ADVANCED_NOTIFICATION_SYSTEM.fetchNotifications();
            
            if (notifications.length > 0) {
                await ADVANCED_NOTIFICATION_SYSTEM.sendToAdmin(notifications);
            }
            
            // تسجيل إحصائيات دورية
            const stats = ADVANCED_NOTIFICATION_SYSTEM.getNotificationStats();
            if (stats.total % 20 === 0) {
                console.log(`📊 إحصائيات الإشعارات: ${stats.total} إجمالي، ${stats.highPriority} عالية الأولوية`);
            }
            
        } catch (error) {
            console.log(`❌ خطأ في جلب الإشعارات: ${error.message}`);
        }
    }, 60000); // كل دقيقة

    // إرجاع النظام للاستخدام الخارجي
    return {
        notificationSystem: ADVANCED_NOTIFICATION_SYSTEM,
        getStats: () => ADVANCED_NOTIFICATION_SYSTEM.getNotificationStats()
    };
};
