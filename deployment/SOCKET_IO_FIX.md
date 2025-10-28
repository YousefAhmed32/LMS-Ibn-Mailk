# إصلاح مشكلة اتصال Socket.IO في الإنتاج

## المشكلة
```
🔌 Connection error: Error: server error
```

هذا الخطأ يحدث عندما لا يتمكن Socket.IO من الاتصال بالخادم بسبب مشاكل في:
1. إعدادات Nginx لـ Socket.IO
2. إعدادات CORS
3. المسارات والأذونات

## الحل

### 1. رفع إعدادات Nginx المحدثة

قم بنسخ ملف إعدادات Nginx الجديد:

```bash
sudo cp deployment/nginx-ibnmailku.cloud.conf /etc/nginx/sites-available/ibnmailku.cloud
sudo nginx -t
sudo systemctl reload nginx
```

### 2. إعادة تشغيل الـ Backend

```bash
# التحقق من حالة الـ Backend
pm2 list

# إعادة تشغيل الـ Backend لتطبيق الإعدادات الجديدة
pm2 restart lms-api

# عرض الـ Logs للتحقق من نجاح التشغيل
pm2 logs lms-api --lines 50
```

### 3. التحقق من الإعدادات

#### أ. التحقق من Nginx:
```bash
# تحقق من أن الـ Logs لا تحتوي على أخطاء
sudo tail -f /var/log/nginx/error.log

# تحقق من إعدادات Socket.IO في Nginx
sudo grep -A 20 "location /socket.io/" /etc/nginx/sites-available/ibnmailku.cloud
```

#### ب. التحقق من الـ Backend:
```bash
# تحقق من أن Socket.IO يعمل على البورت 5000
curl http://localhost:5000/socket.io/

# يجب أن ترى رد من Socket.IO
```

#### ج. التحقق من المتصفح:
1. افتح Developer Tools > Console
2. ابحث عن رسائل Socket.IO
3. يجب أن ترى: `🔌 Connected to notification server`

### 4. استكشاف الأخطاء الشائعة

#### الخطأ: "server error"
**السبب:** Nginx غير مكوّن بشكل صحيح لـ Socket.IO

**الحل:**
```bash
# تأكد من وجود هذا في nginx.conf
location /socket.io/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    ...
}
```

#### الخطأ: CORS error
**السبب:** إعدادات CORS غير صحيحة

**الحل:**
تحقق من `server/config/production.js` وأن متغيرات البيئة:
```bash
CORS_ORIGIN=https://ibnmailku.cloud
CLIENT_URL=https://ibnmailku.cloud
```

#### الخطأ: Cannot connect
**السبب:** الـ Backend غير شغال أو على بورت مختلف

**الحل:**
```bash
# تحقق من البورت
pm2 list
# يجب أن ترى: lms-api running on port 5000

# تحقق من اتصال Socket.IO
curl http://localhost:5000/socket.io/
```

### 5. اختبار الاتصال

#### اختبار من المتصفح:
```javascript
// افتح Console في المتصفح واكتب:
import io from 'socket.io-client';
const socket = io('https://ibnmailku.cloud');
socket.on('connect', () => console.log('✅ Connected!'));
```

#### اختبار من الـ Backend:
```bash
# في مجلد server
node test-socket-connection.js
```

### 6. التحقق من Logs

```bash
# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Backend logs
pm2 logs lms-api --lines 100

# للبحث عن أخطاء Socket.IO
pm2 logs lms-api | grep -i socket
```

### 7. إعدادات مهمة للتأكد منها

#### في `server/config/production.js`:
- ✅ `cors.origin` يحتوي على `https://ibnmailku.cloud`
- ✅ `transports: ['polling', 'websocket']`
- ✅ `allowRequest` يعيد `true`

#### في `deployment/nginx-ibnmailku.cloud.conf`:
- ✅ `location /socket.io/` موجود
- ✅ `proxy_set_header Upgrade $http_upgrade`
- ✅ `proxy_set_header Connection $connection_upgrade`
- ✅ `proxy_buffering off`

#### في المتغيرات البيئية:
```env
CORS_ORIGIN=https://ibnmailku.cloud
CLIENT_URL=https://ibnmailku.cloud
NODE_ENV=production
```

### 8. إعادة تشغيل كامل النظام

إذا استمرت المشكلة، قم بإعادة تشغيل جميع الخدمات:

```bash
# إعادة تشغيل Nginx
sudo systemctl restart nginx

# إعادة تشغيل الـ Backend
pm2 restart lms-api

# إعادة تشغيل MongoDB (إذا لزم الأمر)
sudo systemctl restart mongod

# مسح الكاش في المتصفح (Ctrl+Shift+Del)
```

### 9. التحقق النهائي

بعد إصلاح المشكلة، يجب أن ترى في Console المتصفح:
```
✅ Connected to notification server
👤 Joined user room: user_xxxxx
```

وفي Backend logs:
```
🔌 User connected: socket_id
👤 User xxx joined room: user_xxx
```

## الملفات المحدثة

1. ✅ `deployment/nginx-ibnmailku.cloud.conf` - إصلاح إعدادات Socket.IO
2. ✅ `server/config/production.js` - إضافة إعدادات إضافية لـ Socket.IO
3. ✅ `client/src/contexts/EnhancedNotificationContext.jsx` - تحسين اتصال Socket.IO

## النتيجة المتوقعة

- ✅ Socket.IO يتصل بنجاح
- ✅ الإشعارات تعمل في الوقت الفعلي
- ✅ لا توجد أخطاء في Console
- ✅ لا توجد أخطاء في Logs

## نصائح إضافية

1. **للتطوير المحلي:**
   - لا حاجة لـ Nginx، Socket.IO يعمل مباشرة على `http://localhost:5000`

2. **للإنتاج:**
   - تأكد من أن SSL certificates صالحة
   - استخدم `https://` وليس `http://`
   - تأكد من أن Firewall يسمح بـ WebSocket connections

3. **للأمان:**
   - استخدم CORS محدود للـ Origins المسموح بها
   - فعّل الـ authentication للـ Socket.IO إذا لزم الأمر

## المراجع

- [Socket.IO Behind a Reverse Proxy](https://socket.io/docs/v4/reverse-proxy/)
- [Nginx WebSocket Proxying](http://nginx.org/en/docs/http/websocket.html)
- [Socket.IO CORS Configuration](https://socket.io/docs/v4/handling-cors/)

