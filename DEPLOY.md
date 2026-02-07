# 🚀 دليل النشر - Kira Bot

## نشر البوت على Render

### الخطوات:

#### 1️⃣ رفع المشروع على GitHub

```bash
# في مجلد البوت
git init
git add .
git commit -m "🚀 Kira Bot - Ready to Deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/kira-bot.git
git push -u origin main
```

#### 2️⃣ إنشاء Web Service في Render

1. اذهب إلى: https://render.com/
2. سجل دخول أو أنشئ حساب جديد
3. اضغط "New +" → "Web Service"
4. اربط حساب GitHub الخاص بك
5. اختر مستودع `kira-bot`

#### 3️⃣ إعدادات Service

```
Name: kira-bot
Environment: Node
Region: اختر الأقرب لموقعك
Branch: main
Build Command: npm install
Start Command: node index.js
Plan: Free (للبداية)
```

#### 4️⃣ Environment Variables

أضف هذه المتغيرات:

```
APPSTATE = [محتوى ملف appstate.json كامل]
```

⚠️ **مهم**: انسخ **كامل** محتوى appstate.json والصقه هنا

#### 5️⃣ Deploy

1. اضغط "Create Web Service"
2. انتظر حتى ينتهي البناء (3-5 دقائق)
3. البوت الآن يعمل 24/7! 🎉

---

## نصائح مهمة:

### ✅ افعل:
- استخدم حساب فيسبوك وهمي
- راقب الـ Logs بانتظام
- حدّث appstate كل فترة
- اجعل المستودع Private

### ❌ لا تفعل:
- ترفع appstate.json على GitHub
- تشارك بيانات البوت
- تستخدم حسابك الشخصي
- تنسى تحديث الأكواد

---

## 🐛 حل المشاكل

### البوت لا يعمل؟
- راجع Logs في Render
- تحقق من appstate
- جرب إعادة deploy

### البوت يتوقف؟
- Render Free يتوقف بعد 15 دقيقة خمول
- استخدم Uptime Robot لإبقائه نشطاً
- أو ترقية للخطة المدفوعة

---

**حظاً موفقاً! 🚀**
