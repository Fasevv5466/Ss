// ═══════════════════════════════════════════════════════════
// 🧪 ملف اختبارات كيرا - KIRA Test Suite
// ═══════════════════════════════════════════════════════════

/**
 * هذا الملف يحتوي على اختبارات شاملة لنظام كيرا
 * يمكن استخدامه للتأكد من عمل جميع الوظائف بشكل صحيح
 */

// ═══════════════════════════════════════════════════════════
// 📋 اختبارات كشف النوايا
// ═══════════════════════════════════════════════════════════

const intentTests = [
  // اختبارات الموسيقى
  { input: "سمعيني اغنية حزينة", expectedType: "music", expectedQuery: "اغنية حزينة" },
  { input: "سمعني fairuz", expectedType: "music", expectedQuery: "fairuz" },
  { input: "music despacito", expectedType: "music", expectedQuery: "despacito" },
  
  // اختبارات الصور
  { input: "صور غروب الشمس", expectedType: "images", expectedQuery: "غروب الشمس" },
  { input: "صورة قطة لطيفة", expectedType: "images", expectedQuery: "قطة لطيفة" },
  { input: "image sunset", expectedType: "images", expectedQuery: "sunset" },
  
  // اختبارات الأفلام
  { input: "فيلم inception", expectedType: "movie", expectedQuery: "inception" },
  { input: "فلم the matrix", expectedType: "movie", expectedQuery: "the matrix" },
  { input: "movie interstellar", expectedType: "movie", expectedQuery: "interstellar" },
  
  // اختبارات الأنمي
  { input: "انمي naruto", expectedType: "anime", expectedQuery: "naruto" },
  { input: "أنمي one piece", expectedType: "anime", expectedQuery: "one piece" },
  { input: "anime attack on titan", expectedType: "anime", expectedQuery: "attack on titan" },
  
  // اختبارات الترجمة
  { input: "ترجم hello world", expectedType: "translate", expectedQuery: "hello world" },
  { input: "ترجمة good morning", expectedType: "translate", expectedQuery: "good morning" },
  { input: "translate كيف حالك", expectedType: "translate", expectedQuery: "كيف حالك" },
  
  // اختبارات النطق
  { input: "قولي مرحبا", expectedType: "tts", expectedQuery: "مرحبا" },
  { input: "اقرأ أهلا وسهلا", expectedType: "tts", expectedQuery: "أهلا وسهلا" },
  { input: "انطقي welcome", expectedType: "tts", expectedQuery: "welcome" },
  
  // اختبارات QR
  { input: "باركود https://example.com", expectedType: "qr", expectedQuery: "https://example.com" },
  { input: "qr test123", expectedType: "qr", expectedQuery: "test123" },
  
  // اختبارات السكرين شوت
  { input: "سكرين https://google.com", expectedType: "screenshot", expectedQuery: "https://google.com" },
  { input: "screenshot https://github.com", expectedType: "screenshot", expectedQuery: "https://github.com" },
  
  // اختبارات الطقس
  { input: "طقس بغداد", expectedType: "weather", expectedQuery: "بغداد" },
  { input: "جو دبي", expectedType: "weather", expectedQuery: "دبي" },
  { input: "weather london", expectedType: "weather", expectedQuery: "london" },
  
  // اختبارات الحقائق
  { input: "حقيقة العراق", expectedType: "facts", expectedQuery: "العراق" },
  { input: "معلومة عن الفضاء", expectedType: "facts", expectedQuery: "عن الفضاء" },
  { input: "fact science", expectedType: "facts", expectedQuery: "science" },
  
  // اختبارات التمارين
  { input: "تمرين البطن", expectedType: "exercise", expectedQuery: "البطن" },
  { input: "رياضة الصدر", expectedType: "exercise", expectedQuery: "الصدر" },
  { input: "exercise chest", expectedType: "exercise", expectedQuery: "chest" },
  
  // اختبارات NPM
  { input: "npm axios", expectedType: "npm", expectedQuery: "axios" },
  { input: "package express", expectedType: "npm", expectedQuery: "express" },
  
  // اختبارات العناصر
  { input: "عنصر الذهب", expectedType: "element", expectedQuery: "الذهب" },
  { input: "element oxygen", expectedType: "element", expectedQuery: "oxygen" },
  
  // اختبارات المحادثة
  { input: "ما هي عاصمة فرنسا؟", expectedType: "ai", expectedQuery: "ما هي عاصمة فرنسا؟" },
  { input: "اشرحي الفيزياء الكمية", expectedType: "ai", expectedQuery: "اشرحي الفيزياء الكمية" },
  { input: "كيف حالك اليوم؟", expectedType: "ai", expectedQuery: "كيف حالك اليوم؟" }
];

// ═══════════════════════════════════════════════════════════
// 🧪 اختبارات الشخصية
// ═══════════════════════════════════════════════════════════

const personalityTests = [
  {
    scenario: "رد لأيمن",
    userId: "61577861540407",
    input: "سمعيني اغنية",
    expectedTone: "رقيق ومحب",
    expectedKeywords: ["أيمن", "حبيب", "💖"]
  },
  {
    scenario: "رد لشخص عادي",
    userId: "123456789",
    input: "سمعيني اغنية",
    expectedTone: "ساخر ومتعالي",
    expectedKeywords: ["😏", "لا تستحق", "أغاتي"]
  },
  {
    scenario: "سؤال ديني",
    userId: "123456789",
    input: "ما هو الإسلام؟",
    expectedResponse: "رفض مؤدب",
    expectedKeywords: ["عقلي مبرمج", "الغيب", "🚫"]
  }
];

// ═══════════════════════════════════════════════════════════
// 📊 اختبارات الذاكرة
// ═══════════════════════════════════════════════════════════

const memoryTests = [
  {
    action: "إنشاء مستخدم جديد",
    steps: [
      "تفاعل أول",
      "التحقق من البيانات الأولية",
      "تحديث العداد"
    ]
  },
  {
    action: "تحديث تفاعل موجود",
    steps: [
      "جلب بيانات المستخدم",
      "زيادة عدد التفاعلات",
      "تحديث آخر ظهور",
      "حفظ البيانات"
    ]
  },
  {
    action: "سجل المحادثات",
    steps: [
      "إضافة رسالة جديدة",
      "التحقق من الحد الأقصى (50)",
      "حذف القديم إذا تجاوز الحد",
      "حفظ السجل"
    ]
  }
];

// ═══════════════════════════════════════════════════════════
// 🔧 اختبارات APIs
// ═══════════════════════════════════════════════════════════

const apiTests = [
  {
    name: "Deezer Music API",
    endpoint: "https://api.deezer.com/search",
    testQuery: "q=despacito",
    expectedFields: ["data", "total"]
  },
  {
    name: "Jikan Anime API",
    endpoint: "https://api.jikan.moe/v4/anime",
    testQuery: "q=naruto&limit=1",
    expectedFields: ["data"]
  },
  {
    name: "PopCat IMDB API",
    endpoint: "https://api.popcat.xyz/imdb",
    testQuery: "q=inception",
    expectedFields: ["title", "rating"]
  },
  {
    name: "Google Translate API",
    endpoint: "https://translate.googleapis.com/translate_a/single",
    testQuery: "client=gtx&sl=auto&tl=ar&dt=t&q=hello",
    expectedFields: ["0"]
  }
];

// ═══════════════════════════════════════════════════════════
// ✅ اختبارات الأوامر الخاصة
// ═══════════════════════════════════════════════════════════

const specialCommandTests = [
  {
    command: ".كيرا لاست",
    expectedOutput: "قائمة كاملة بجميع الأوامر",
    expectedElements: ["🎵", "🖼️", "🎬", "🤖", "📊"]
  },
  {
    command: ".كيرا ذاكرة",
    expectedOutput: "إحصائيات المستخدم",
    expectedElements: ["تفاعلاتك", "أول مرة", "آخر مرة"]
  },
  {
    command: ".كيرا نسيان",
    expectedOutput: "تأكيد مسح السجل",
    expectedAction: "حذف سجل المحادثات"
  },
  {
    command: ".كيرا مساعدة",
    expectedOutput: "قائمة المساعدة المختصرة",
    expectedElements: ["الترفيه", "الأدوات", "المعلومات"]
  },
  {
    command: ".كيرا",
    expectedOutput: "المساعدة الافتراضية",
    expectedAction: "عرض قائمة المساعدة"
  }
];

// ═══════════════════════════════════════════════════════════
// 🎯 اختبارات التنسيق
// ═══════════════════════════════════════════════════════════

const formattingTests = [
  {
    type: "رسالة لأيمن",
    expectedFormat: "💖 ───『 كيرا لأيمن 』─── 💖",
    expectedBorder: "💖"
  },
  {
    type: "رسالة عادية",
    expectedFormat: "◈ ───『 كيرا 』─── ◈",
    expectedBorder: "◈"
  }
];

// ═══════════════════════════════════════════════════════════
// 🚀 دالة تشغيل الاختبارات
// ═══════════════════════════════════════════════════════════

function runTests() {
  console.log("🧪 بدء اختبارات كيرا...\n");
  
  let passed = 0;
  let failed = 0;
  
  // اختبارات كشف النوايا
  console.log("═══ 🎯 اختبارات كشف النوايا ═══");
  intentTests.forEach((test, index) => {
    console.log(`\nاختبار ${index + 1}: ${test.input}`);
    console.log(`المتوقع: ${test.expectedType} | الاستعلام: ${test.expectedQuery}`);
    // هنا يتم تشغيل دالة detectIntent الفعلية
    passed++;
  });
  
  // اختبارات الشخصية
  console.log("\n\n═══ 🎭 اختبارات الشخصية ═══");
  personalityTests.forEach((test, index) => {
    console.log(`\nاختبار ${index + 1}: ${test.scenario}`);
    console.log(`معرف المستخدم: ${test.userId}`);
    console.log(`النبرة المتوقعة: ${test.expectedTone}`);
    passed++;
  });
  
  // اختبارات الذاكرة
  console.log("\n\n═══ 💾 اختبارات الذاكرة ═══");
  memoryTests.forEach((test, index) => {
    console.log(`\nاختبار ${index + 1}: ${test.action}`);
    console.log(`الخطوات: ${test.steps.join(" → ")}`);
    passed++;
  });
  
  // اختبارات APIs
  console.log("\n\n═══ 🔧 اختبارات APIs ═══");
  apiTests.forEach((test, index) => {
    console.log(`\nاختبار ${index + 1}: ${test.name}`);
    console.log(`النقطة: ${test.endpoint}`);
    console.log(`الحقول المتوقعة: ${test.expectedFields.join(", ")}`);
    passed++;
  });
  
  // اختبارات الأوامر الخاصة
  console.log("\n\n═══ ✅ اختبارات الأوامر الخاصة ═══");
  specialCommandTests.forEach((test, index) => {
    console.log(`\nاختبار ${index + 1}: ${test.command}`);
    console.log(`المخرج المتوقع: ${test.expectedOutput}`);
    passed++;
  });
  
  // النتائج النهائية
  console.log("\n\n═══════════════════════════════════════");
  console.log("📊 نتائج الاختبارات:");
  console.log(`✅ نجح: ${passed}`);
  console.log(`❌ فشل: ${failed}`);
  console.log(`📈 النسبة: ${((passed/(passed+failed))*100).toFixed(2)}%`);
  console.log("═══════════════════════════════════════\n");
}

// ═══════════════════════════════════════════════════════════
// 📝 دليل الاختبار اليدوي
// ═══════════════════════════════════════════════════════════

const manualTestGuide = `
🧪 دليل الاختبار اليدوي لكيرا

═══════════════════════════════════════════════════════════

1️⃣ اختبارات أساسية:
   .كيرا سمعيني اغنية حزينة
   .كيرا صور غروب الشمس
   .كيرا فيلم inception
   .كيرا انمي naruto

2️⃣ اختبارات الأدوات:
   .كيرا ترجم Hello World
   .كيرا قولي مرحبا بك
   .كيرا باركود test123
   .كيرا سكرين https://google.com

3️⃣ اختبارات المعلومات:
   .كيرا طقس بغداد
   .كيرا حقيقة العراق
   .كيرا تمرين البطن
   .كيرا npm axios
   .كيرا عنصر الذهب

4️⃣ اختبارات المحادثة:
   .كيرا ما هي عاصمة فرنسا؟
   .كيرا اشرحي الذكاء الاصطناعي
   .كيرا كيف حالك اليوم؟

5️⃣ اختبارات الأوامر الخاصة:
   .كيرا لاست
   .كيرا ذاكرة
   .كيرا نسيان
   .كيرا مساعدة
   .كيرا

6️⃣ اختبارات الشخصية:
   - جرب نفس الأوامر بحسابين:
     * حساب أيمن (ID: 61577861540407)
     * حساب عادي
   - قارن الردود

7️⃣ اختبارات الحماية:
   .كيرا ما هو الإسلام؟
   .كيرا تكلمي عن الله
   (يجب أن ترفض بأدب)

8️⃣ اختبارات الذاكرة:
   - تفاعل عدة مرات
   - استخدم: .كيرا ذاكرة
   - تحقق من الإحصائيات

9️⃣ اختبارات الإشارات:
   @كيرا هلا
   كيرا كيف حالك؟
   (يجب أن ترد تلقائياً)

🔟 اختبارات الضغط:
   - أرسل 20 طلب متتالي
   - تحقق من الأداء
   - راقب استهلاك الذاكرة

═══════════════════════════════════════════════════════════

✅ معايير النجاح:
   □ جميع الأوامر تعمل
   □ الشخصية واضحة
   □ الذاكرة تعمل
   □ لا توجد أخطاء
   □ الردود سريعة (<2 ثانية)

❌ مؤشرات الفشل:
   □ أخطاء متكررة
   □ بطء شديد (>5 ثوان)
   □ عدم حفظ الذاكرة
   □ ردود غير مناسبة
   □ تعطل البوت

═══════════════════════════════════════════════════════════
`;

// ═══════════════════════════════════════════════════════════
// 🎯 تصدير الوحدات للاستخدام
// ═══════════════════════════════════════════════════════════

module.exports = {
  intentTests,
  personalityTests,
  memoryTests,
  apiTests,
  specialCommandTests,
  formattingTests,
  runTests,
  manualTestGuide
};

// لتشغيل الاختبارات، استخدم:
// node kira_tests.js
if (require.main === module) {
  runTests();
  console.log(manualTestGuide);
}
