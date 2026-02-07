# تنظيف أي بناء سابق
docker system prune -f

# البناء مع وضع verbose لرؤية التفاصيل
docker build --no-cache --progress=plain -t kira-bot .

# التشغيل
docker run -d \
  --name kira \
  -p 8000:8000 \
  -v $(pwd)/config.json:/app/config.json \
  -v $(pwd)/appstate.json:/app/appstate.json \
  kira-bot

# مشاهدة السجلات
docker logs -f kira
