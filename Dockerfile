FROM node:18

WORKDIR /usr/src/app

# نسخ ملفات الحزم أولاً
COPY package*.json ./
RUN npm install
RUN chmod -R a-w node_modules/@dongdev/fca-unofficial

# نسخ بقية الملفات
COPY . .

# تشغيل البوت (تأكد أن الملف الرئيسي اسمه index.js)
CMD ["node", "index.js"]
