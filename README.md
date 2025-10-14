# LMS - Learning Management System

نظام إدارة التعلم المطور بـ MERN Stack (MongoDB, Express.js, React, Node.js)

## متطلبات النظام

- Node.js >= 14.0.0
- MongoDB Atlas (سحابية)
- PM2 (لإدارة العمليات)

## خطوات النشر على Hostinger

### 1. رفع الملفات
```bash
# رفع جميع الملفات إلى الخادم
# استثناء: node_modules/ (سيتم تثبيتها على الخادم)
```

### 2. تثبيت التبعيات
```bash
# تثبيت تبعيات الخادم
npm install

# تثبيت تبعيات العميل
cd client
npm install
cd ..
```

### 3. بناء Frontend
```bash
cd client
npm run build
cd ..
```

### 4. إعداد متغيرات البيئة
```bash
# إنشاء ملف .env
nano .env
```

متغيرات البيئة المطلوبة:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key
```

### 5. تشغيل التطبيق
```bash
# باستخدام PM2
npm install -g pm2
pm2 start ecosystem.config.js --env production

# أو تشغيل مباشر
npm start
```

### 6. إعداد Nginx (اختياري)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## أوامر PM2 المفيدة

```bash
# عرض العمليات
pm2 list

# إعادة تشغيل التطبيق
pm2 restart lms-app

# إيقاف التطبيق
pm2 stop lms-app

# عرض السجلات
pm2 logs lms-app

# مراقبة الأداء
pm2 monit
```

## هيكل المشروع

```
├── client/          # React Frontend
├── server/          # Express.js Backend
├── config/          # إعدادات قاعدة البيانات
├── models/          # نماذج MongoDB
├── routes/          # مسارات API
├── server.js        # نقطة البداية الرئيسية
├── package.json     # تبعيات المشروع
└── ecosystem.config.js  # إعدادات PM2
```

## الدعم

للمساعدة التقنية، يرجى التواصل مع فريق التطوير.
