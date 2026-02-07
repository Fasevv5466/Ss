FROM node:20-alpine

LABEL maintainer="Ayman <ayman@kira.com>"
LABEL version="11.0.0"
LABEL description="Kira Supreme Bot - Node.js 20"

# تحديث النظام وتثبيت أدوات بناء أساسية
RUN apk update && apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl \
    openssl

# إنشاء مجلد التطبيق
WORKDIR /usr/src/app

# نسخ ملفات التبعيات
COPY package*.json ./

# تثبيت التبعيات مع إنشاء package-lock.json
RUN npm install --production --legacy-peer-deps --force \
    && npm cache clean --force

# نسخ باقي الملفات
COPY . .

# إنشاء المجلدات الضرورية
RUN mkdir -p \
    systems \
    script/commands/data \
    script/commands/cache \
    backup \
    logs

# تعيين أذونات للملفات
RUN chmod 755 start.sh

# تعيين المستخدم غير الجذر
RUN addgroup -g 1001 -S nodejs && \
    adduser -S kira -u 1001 -G nodejs
USER kira

# المنفذ
EXPOSE 8000

# الصحة تشيك
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# تشغيل التطبيق
CMD [ "node", "index.js" ]
