FROM node:24-alpine

WORKDIR /app

# تثبيت بايثون ومتطلبات البناء للوحدات الأصلية
RUN apk add --no-cache --virtual .build-deps \
    python3 \
    make \
    g++ \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

COPY package*.json ./

RUN npm ci --only=production

# إزالة متطلبات البناء للحفاظ على صورة صغيرة
RUN apk del .build-deps

COPY . .

EXPOSE 8000

CMD [ "node", "index.js" ]
