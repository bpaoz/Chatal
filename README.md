# موبليس شات بوت - دليل الرفع على Netlify

## نظرة عامة
هذا تطبيق شات بوت لخدمات موبليس مع دعم فيسبوك مسنجر، جاهز للرفع على Netlify.

## الملفات المطلوبة للرفع

### 1. ملفات التطبيق الأساسية
```
├── client/                    # ملفات الواجهة الأمامية
├── netlify/functions/         # دوال Netlify Serverless
├── shared/                    # الملفات المشتركة
├── server/storage.ts          # نظام التخزين
├── netlify.toml              # تكوين Netlify
├── package-netlify.json      # dependencies للإنتاج
├── vite.config.ts           # تكوين Vite
├── tailwind.config.ts       # تكوين Tailwind
├── postcss.config.js        # تكوين PostCSS
└── tsconfig.json            # تكوين TypeScript
```

### 2. خطوات الرفع على Netlify

#### الطريقة الأولى: من خلال Git
1. **إنشاء مستودع Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Mobilis ChatBot"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **ربط مع Netlify:**
   - اذهب إلى [netlify.com](https://netlify.com)
   - اضغط "New site from Git"
   - اختر مستودع GitHub الخاص بك
   - استخدم الإعدادات التالية:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist/public`
     - **Functions directory:** `netlify/functions`

#### الطريقة الثانية: الرفع المباشر
1. **بناء التطبيق محلياً:**
   ```bash
   # انسخ package-netlify.json إلى package.json
   cp package-netlify.json package.json
   
   # تثبيت التبعيات
   npm install
   
   # بناء التطبيق
   npm run build
   ```

2. **رفع الملفات:**
   - اضغط وإسحب مجلد `dist/public` إلى Netlify Dashboard
   - ارفع مجلد `netlify/functions` يدوياً من خلال Netlify Functions

### 3. متغيرات البيئة المطلوبة

في Netlify Dashboard > Site Settings > Environment Variables، أضف:

```
# Facebook Integration (اختياري)
FACEBOOK_PAGE_ACCESS_TOKEN=your_facebook_page_access_token
FACEBOOK_VERIFY_TOKEN=your_verify_token

# Netlify Environment
NODE_ENV=production
```

### 4. إعداد Facebook Messenger Webhook

بعد الرفع، استخدم URL التالي للـ webhook:
```
https://your-site-name.netlify.app/.netlify/functions/messenger
```

#### خطوات ربط فيسبوك:
1. اذهب إلى [Facebook Developers](https://developers.facebook.com)
2. إنشاء تطبيق جديد أو استخدام موجود
3. إضافة منتج "Messenger"
4. في إعدادات Webhooks:
   - **Callback URL:** `https://your-site-name.netlify.app/.netlify/functions/messenger`
   - **Verify Token:** `mobilis_verify_token_2025`
   - **Subscription Fields:** اختر `messages`, `messaging_postbacks`

### 5. اختبار التطبيق

#### اختبار الواجهة الأمامية:
- زر موقعك على `https://your-site-name.netlify.app`
- جرب إرسال رسائل بالعربية والفرنسية
- اختبر الخدمات السريعة (الرصيد، الشحن، الباقات)

#### اختبار فيسبوك مسنجر:
- أرسل رسالة لصفحة فيسبوك الخاصة بموبليس
- تأكد من رد البوت بالرسائل المناسبة

### 6. الميزات المتاحة

✅ **واجهة شات تفاعلية** مع دعم العربية والفرنسية
✅ **تحليل النوايا الذكي** للرسائل
✅ **ردود تلقائية** حسب نوع الاستفسار
✅ **لوحة إدارة** لتعديل الردود وإعدادات فيسبوك
✅ **إحصائيات يومية** للمحادثات
✅ **webhook فيسبوك مسنجر** جاهز للاستخدام
✅ **خدمات سريعة** للرصيد والشحن والباقات

### 7. استكشاف الأخطاء

#### مشكلة في البناء:
- تأكد من وجود جميع التبعيات في `package-netlify.json`
- تحقق من أن `netlify.toml` في المجلد الجذر

#### مشكلة في Functions:
- تأكد من أن مجلد `netlify/functions` موجود
- تحقق من صحة imports في ملفات الـ functions

#### مشكلة فيسبوك:
- تأكد من صحة Page Access Token
- تحقق من أن Verify Token يطابق الإعدادات في فيسبوك

### 8. الدعم الفني

للمساعدة أو الاستفسارات، يمكن مراجعة:
- ملف `replit.md` للتفاصيل التقنية
- ملفات الـ components لفهم الكود
- ملفات Netlify Functions للـ backend logic

---

**ملاحظة:** هذا التطبيق جاهز للاستخدام فوراً بعد الرفع على Netlify مع ميزات شات بوت كاملة ودعم فيسبوك مسنجر.