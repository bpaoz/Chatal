# 🚀 شات بوت موبليس - دليل النشر على Vercel

## 📖 نظرة عامة

هذا دليل شامل لنشر شات بوت موبليس على منصة Vercel مع تكامل Facebook Messenger ودعم متعدد اللغات (عربي/فرنسي).

## 🛠️ الميزات

✅ **واجهة ويب تفاعلية** - React + TypeScript + shadcn/ui  
✅ **تكامل Facebook Messenger** - Webhook كامل  
✅ **متعدد اللغات** - عربي وفرنسي مع RTL  
✅ **لوحة إدارة** - تحكم في ردود البوت  
✅ **Vercel Serverless Functions** - API محسن للأداء  
✅ **تصميم Mobilis** - ألوان وهوية الشركة  

## 🚀 خطوات النشر

### 1️⃣ تحضير الملفات

```bash
# استخراج ملفات المشروع
unzip mobilis-chatbot-vercel.zip
cd mobilis-chatbot-vercel
```

### 2️⃣ رفع على GitHub

1. أنشئ مستودع جديد على GitHub
2. ارفع جميع الملفات:

```bash
git init
git add .
git commit -m "Initial commit: Mobilis Chatbot for Vercel"
git branch -M main
git remote add origin https://github.com/username/mobilis-chatbot.git
git push -u origin main
```

### 3️⃣ النشر على Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. انقر **"New Project"**
3. اختر **"Import Git Repository"**
4. حدد مستودع GitHub الخاص بك
5. Vercel سيكتشف التكوين تلقائياً من `vercel.json`

### 4️⃣ إعداد متغيرات البيئة

في لوحة تحكم Vercel:

**Settings** → **Environment Variables**

```
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token_here
FACEBOOK_VERIFY_TOKEN=mobilis_verify_token_2024
```

### 5️⃣ إعداد Facebook Webhook

1. اذهب إلى [Facebook Developers](https://developers.facebook.com)
2. اختر تطبيقك → **Messenger** → **Settings**
3. **Webhooks** → **Edit Callback URL**:
   ```
   https://your-app.vercel.app/api/messenger
   ```
4. **Verify Token**: `mobilis_verify_token_2024`
5. **Subscription Fields**: `messages`, `messaging_postbacks`

## 📁 هيكل المشروع

```
📦 mobilis-chatbot-vercel/
├── 📁 api/                    # Vercel Serverless Functions
│   ├── messenger.js           # Facebook Webhook
│   ├── bot-responses.js       # إدارة ردود البوت
│   ├── conversations.js       # محادثات المستخدمين
│   ├── facebook-settings.js   # إعدادات Facebook
│   └── stats.js              # إحصائيات المحادثات
├── 📁 client/                 # React Frontend
│   ├── src/components/        # مكونات UI
│   ├── src/pages/            # صفحات التطبيق
│   └── src/lib/              # مكتبات مساعدة
├── 📁 shared/                 # كود مشترك
│   ├── schema.ts             # نماذج البيانات
│   └── storage.js            # تخزين في الذاكرة
├── vercel.json               # تكوين Vercel
├── package.json              # dependencies
└── vite.config.ts            # تكوين Vite
```

## 🔧 التكوينات المتقدمة

### Vercel Functions Settings

```json
{
  "functions": {
    "api/messenger.js": {
      "maxDuration": 30
    }
  }
}
```

### Domain & SSL

- Vercel يوفر HTTPS تلقائياً
- يمكن ربط نطاق مخصص من **Settings** → **Domains**

## 🧪 اختبار التطبيق

### اختبار محلي:
```bash
npm install
npm run dev
```

### اختبار Facebook Webhook:
1. استخدم **Facebook Webhook Tester**
2. أرسل رسالة اختبار
3. تحقق من logs في Vercel

## 📊 مراقبة الأداء

### Vercel Analytics
- **Functions** → عرض استخدام الوظائف
- **Analytics** → زيارات الموقع
- **Speed Insights** → أداء التحميل

### Logs مباشرة
```bash
vercel logs
```

## 🔍 استكشاف الأخطاء

### مشاكل شائعة:

1. **Webhook لا يعمل**:
   - تحقق من متغيرات البيئة
   - تأكد من رابط HTTPS صحيح

2. **رسائل لا تصل**:
   - تحقق من Page Access Token
   - راجع permissions في Facebook App

3. **Build يفشل**:
   - تحقق من dependencies في package.json
   - راجع logs في Vercel Dashboard

## 📱 استخدام التطبيق

### للمستخدمين:
- زيارة الرابط المنشور
- بدء محادثة مباشرة
- أو استخدام Facebook Messenger

### للإداريين:
- لوحة الإدارة في `/admin`
- تعديل ردود البوت
- عرض الإحصائيات

## 🎯 الخطوات التالية

1. **تخصيص الردود** - أضف ردود خاصة بخدمات موبليس
2. **Analytics متقدم** - ربط Google Analytics
3. **AI Enhancement** - إضافة ChatGPT للردود الذكية
4. **Multi-Platform** - دعم WhatsApp و Telegram

## 📞 الدعم

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Facebook Messenger**: [developers.facebook.com/docs/messenger-platform](https://developers.facebook.com/docs/messenger-platform)
- **React Query**: [tanstack.com/query](https://tanstack.com/query)

---

🎉 **مبروك! شات بوت موبليس جاهز على Vercel!**