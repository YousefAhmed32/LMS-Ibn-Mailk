# إعداد متغيرات البيئة للإنتاج (Production Environment Setup)

## المشكلة
عند رفع الموقع على الاستضافة، تحدث أخطاء في اتصال الـ API بسبب إعدادات المسارات.

## الحل

### 1. إعداد متغيرات البيئة للفرونت-إند

أنشئ ملف `.env.production` في مجلد `client/`:

```env
# Production Environment Variables
# Base URL WITHOUT /api suffix
VITE_API_BASE_URL=https://ibnmailku.cloud
VITE_API_URL=https://ibnmailku.cloud
VITE_SERVER_URL=https://ibnmailku.cloud
```

**مهم جداً**: 
- ✅ يجب أن يكون الرابط بدون `/api` في النهاية
- ✅ استخدم `https://` (ليس `http://`)
- ✅ لا تضع `/api/` في نهاية الرابط

### 2. بناء المشروع للإنتاج

```bash
cd client
npm run build
```

هذا سينشئ مجلد `dist/` يحتوي على ملفات جاهزة للإنتاج.

### 3. رفع الملفات للاستضافة

```bash
# ارفع محتويات مجلد dist إلى /var/www/LMS-Ibn-Mailk/client/dist
rsync -avz client/dist/ root@ibnmailku.cloud:/var/www/LMS-Ibn-Mailk/client/dist/
```

### 4. التحقق من الإعداد

بعد الرفع، تحقق من:

1. **ملفات الـ Frontend موجودة:**
   ```bash
   ls -la /var/www/LMS-Ibn-Mailk/client/dist/
   ```

2. **الـ Backend شغال:**
   ```bash
   pm2 list
   curl http://localhost:5000/health
   ```

3. **Nginx يعمل بشكل صحيح:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

## الفروقات بين البيئة المحلية والإنتاج

### في التطوير (Local):
```javascript
baseURL: "http://localhost:5000"
// الطلبات: http://localhost:5000/api/notifications
```

### في الإنتاج (Production):
```javascript
baseURL: "https://ibnmailku.cloud"
// الطلبات: https://ibnmailku.cloud/api/notifications
```

## ملفات تم تعديلها

1. ✅ `client/src/api/axiosInstance.js` - إصلاح baseURL
2. ✅ `client/src/contexts/EnhancedNotificationContext.jsx` - إصلاح Socket.IO URL
3. ✅ `deployment/nginx-ibnmailku.cloud.conf` - إصلاح إعدادات Nginx

## كيفية اختبار الإصلاح

1. **قم ببناء الفرونت-إند:**
   ```bash
   cd client
   npm run build
   ```

2. **افحص ملفات البناء:**
   ```bash
   grep -r "localhost:5000" dist/
   # يجب ألا تجد أي إشارة لـ localhost
   ```

3. **ارفع الملفات:**
   ```bash
   rsync -avz --delete client/dist/ root@server:/var/www/LMS-Ibn-Mailk/client/dist/
   ```

4. **أعد تشغيل Nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

5. **اختبر الموقع:**
   - افتح https://ibnmailku.cloud
   - افتح Developer Tools > Network
   - سجل دخول واختبر الإشعارات
   - يجب ألا ترى أخطاء redirect

## استكشاف الأخطاء

### خطأ: ERR_TOO_MANY_REDIRECTS
**السبب:** مسارات خاطئة في إعدادات Nginx أو axios

**الحل:**
1. تحقق من ملف `.env.production` - يجب أن لا يحتوي على `/api`
2. تأكد من إعادة بناء المشروع بعد تعديل `.env.production`
3. تأكد من إعادة تحميل Nginx: `sudo systemctl reload nginx`

### خطأ: Cannot connect to server
**السبب:** الـ Backend غير شغال

**الحل:**
```bash
pm2 restart lms-api
pm2 logs lms-api
```

### خطأ: CORS
**السبب:** إعدادات CORS في الـ Backend

**الحل:** تحقق من `server/server.js` - متغير `CORS_ORIGIN` يجب أن يكون:
```javascript
process.env.CORS_ORIGIN = 'https://ibnmailku.cloud'
```

## نصائح مهمة

1. **قبل الرفع:**
   - تأكد من بناء الفرونت-إند: `npm run build`
   - اختبر على البورتال المحلي أولاً
   - تأكد من عدم وجود أخطاء في Console

2. **بعد الرفع:**
   - امسح الكاش في المتصفح (Ctrl+Shift+Del)
   - اختبر في Incognito/Private Mode
   - تحقق من Logs في Nginx والـ Backend

3. **للإنتاج:**
   - استخدم دائماً `https://`
   - لا تستخدم `localhost` في أي مكان
   - تأكد من أن SSL certificates سارية

## الأوامر السريعة

```bash
# بناء الفرونت-إند للإنتاج
cd client && npm run build

# رفع الملفات
rsync -avz --delete client/dist/ root@ibnmailku.cloud:/var/www/LMS-Ibn-Mailk/client/dist/

# التحقق من حالة الخدمات
sudo systemctl status nginx
pm2 list
pm2 logs lms-api

# إعادة تشغيل الخدمات
sudo systemctl reload nginx
pm2 restart lms-api

# مشاهدة Logs
sudo tail -f /var/log/nginx/error.log
pm2 logs lms-api --lines 50
```

