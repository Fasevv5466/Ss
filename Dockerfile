FROM node:24-alpine

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    bash \
    curl

WORKDIR /app

# نسخ package.json أولاً
COPY package*.json ./

# تثبيت التبعيات
RUN npm install --production --no-audit --legacy-peer-deps

# نسخ باقي الملفات
COPY . .

# منح صلاحيات التشغيل للملفات
RUN chmod +x start.sh

# فتح المنفذ
EXPOSE 8000

# تشغيل البوت
CMD ["npm", "start"]
