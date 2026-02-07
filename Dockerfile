FROM node:20-alpine

LABEL maintainer="Ayman <ayman@kira.com>"
LABEL version="11.0.0"
LABEL description="Kira Supreme Bot - Node.js 24"

# إنشاء مجلد التطبيق
WORKDIR /usr/src/app

# نسخ ملفات التبعيات أولاً
COPY package*.json ./

# تثبيت التبعيات
RUN npm ci --only=production \
    && npm cache clean --force

# نسخ ملفات التطبيق
COPY . .

# إنشاء المجلدات الضرورية
RUN mkdir -p systems script/commands/data script/commands/cache backup

# تعيين أذونات
RUN chmod +x start.sh

# المنفذ
EXPOSE 8000

# الصحة تشيك
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8000/health', (r) => {if(r.statusCode!==200)throw new Error('Unhealthy')})"

# تشغيل التطبيق
CMD [ "node", "index.js" ]
