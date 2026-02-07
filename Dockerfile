# ============================================
# KIRA BOT - DOCKERFILE v24 FINAL
# ============================================
FROM node:24-alpine

# المكتبات المطلوبة
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    udev \
    ttf-freefont \
    fontconfig \
    bash \
    curl

# العمل في مجلد /app
WORKDIR /app

# نسخ package.json أولاً
COPY package.json .

# تثبيت التبعيات
RUN npm install --production --no-audit --legacy-peer-deps

# نسخ باقي الملفات
COPY . .

# الصحة (مهم لـ Koyeb)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# فتح المنفذ
EXPOSE 8000

# تشغيل البوت
CMD ["node", "index.js"]
