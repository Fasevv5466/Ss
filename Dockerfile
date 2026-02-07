FROM node:20.11.0-alpine

LABEL maintainer="Ayman <ayman@kira.com>"
LABEL version="24.11.0"
LABEL description="KIRA Supreme Bot - Node.js 20.11.0"

# تعيين متغيرات البيئة
ENV NODE_ENV=production \
    NODE_VERSION=20.11.0 \
    NPM_VERSION=10.9.0 \
    TZ=Asia/Baghdad \
    PORT=8000

# تحديث النظام وتثبيت أدوات أساسية
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache \
    python3 \
    make \
    g++ \
    git \
    curl \
    wget \
    openssl \
    ca-certificates \
    bash \
    tzdata \
    fontconfig \
    freetype \
    libpng \
    libjpeg-turbo \
    librsvg \
    imagemagick \
    && rm -rf /var/cache/apk/*

# تعيين المنطقة الزمنية
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# إنشاء مجلد التطبيق
WORKDIR /usr/src/app

# التحقق من إصدار Node.js
RUN node --version && npm --version

# نسخ ملفات التبعيات أولاً (للاستفادة من كاش Docker)
COPY package*.json ./

# تثبيت التبعيات بشكل آمن
RUN npm config set fund false && \
    npm config set audit false && \
    npm config set update-notifier false && \
    npm ci --only=production --legacy-peer-deps --no-audit --prefer-offline && \
    npm cache clean --force

# نسخ باقي الملفات
COPY . .

# إنشاء المجلدات الضرورية
RUN mkdir -p \
    systems \
    script/commands/data \
    script/commands/cache \
    backup \
    logs \
    includes/database \
    && chmod -R 755 . \
    && chmod +x start.sh

# إنشاء مستخدم غير جذر
RUN addgroup -g 1001 -S nodejs && \
    adduser -S kira -u 1001 -G nodejs && \
    chown -R kira:nodejs /usr/src/app

USER kira

# المنفذ
EXPOSE 8000

# فحص الصحة لـ Koyeb
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# متغيرات البيئة الافتراضية
ENV NODE_OPTIONS="--max-old-space-size=1024 --trace-warnings --enable-source-maps"

# تشغيل التطبيق
CMD ["sh", "-c", "echo '🚀 KIRA Supreme v24.11.0' && echo 'Node.js $(node --version)' && npm start"]
