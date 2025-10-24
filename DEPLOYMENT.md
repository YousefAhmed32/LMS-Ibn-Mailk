# دليل النشر والاستضافة

## إعدادات WebSocket للإنتاج

### 1. متغيرات البيئة المطلوبة

#### للعميل (Client):
```env
VITE_API_URL=https://your-domain.com
VITE_SERVER_URL=https://your-domain.com
VITE_CLIENT_URL=https://your-domain.com
```

#### للخادم (Server):
```env
CLIENT_URL=https://your-domain.com
MONGODB_URI=your-mongodb-connection-string
PORT=5000
HOST=0.0.0.0
```

### 2. إعدادات الاستضافة

#### Heroku:
```bash
# إضافة متغيرات البيئة
heroku config:set CLIENT_URL=https://your-app.herokuapp.com
heroku config:set MONGODB_URI=your-mongodb-uri
```

#### Vercel:
```json
{
  "env": {
    "VITE_API_URL": "https://your-api.vercel.app",
    "VITE_SERVER_URL": "https://your-api.vercel.app"
  }
}
```

#### Netlify:
```env
VITE_API_URL=https://your-api.netlify.app
VITE_SERVER_URL=https://your-api.netlify.app
```

### 3. إعدادات Nginx (إذا كنت تستخدم VPS)

**ملف nginx.conf محدث لحل مشكلة 413:**

```nginx
server {
    listen 80;
    server_name ibnmailku.cloud;  # استبدل بالدومين الخاص بك
    
    # إعدادات مهمة لحل مشكلة 413 Request Entity Too Large
    client_max_body_size 20M;  # زيادة الحد الأقصى لحجم الملفات
    client_body_timeout 60s;   # زيادة timeout للرفع
    client_header_timeout 60s; # زيادة timeout للـ headers
    
    # إعدادات إضافية لرفع الملفات
    client_body_buffer_size 128k;
    client_max_body_size 20M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    # إعدادات proxy للخادم
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # إعدادات خاصة برفع الملفات
        proxy_request_buffering off;
        proxy_buffering off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
    
    # إعدادات خاصة لـ API upload
    location /api/upload/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # إعدادات خاصة برفع الملفات
        client_max_body_size 20M;
        proxy_request_buffering off;
        proxy_buffering off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # إعدادات timeout للـ WebSocket
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

**للتطبيق:**
```bash
# نسخ الملف إلى nginx
sudo cp server/nginx.conf /etc/nginx/sites-available/lms-app

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/lms-app /etc/nginx/sites-enabled/

# اختبار الإعدادات
sudo nginx -t

# إعادة تشغيل nginx
sudo systemctl reload nginx
```

### 4. حل مشكلة 413 Request Entity Too Large

#### المشكلة: خطأ 413 عند رفع الصور الكبيرة
**الأسباب:**
1. إعدادات nginx ترفض الملفات الكبيرة
2. حدود Express.js صغيرة
3. عدم ضغط الصور في العميل

**الحلول المطبقة:**

1. **تحديث إعدادات الخادم:**
   - زيادة حدود Express.js إلى 20MB
   - زيادة حدود multer إلى 10MB
   - إضافة timeout أطول للرفع

2. **إضافة ضغط الصور:**
   - ضغط تلقائي للصور أكبر من 1MB
   - تقليل الأبعاد إلى 1920px كحد أقصى
   - ضغط الجودة إلى 80%

3. **إعدادات nginx محدثة:**
   ```bash
   # تطبيق الإعدادات
   sudo cp server/nginx.conf /etc/nginx/sites-available/lms-app
   sudo ln -s /etc/nginx/sites-available/lms-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. **إعادة تشغيل الخدمات:**
   ```bash
   # إعادة تشغيل Node.js
   pm2 restart lms-server
   
   # أو إذا كنت تستخدم npm
   npm restart
   ```

5. **اختبار الحل:**
   ```bash
   # مراقبة logs
   sudo tail -f /var/log/nginx/error.log
   pm2 logs lms-server
   ```

### 5. حل مشاكل WebSocket

#### المشكلة: WebSocket connection error
**الحل:**
1. تأكد من أن الاستضافة تدعم WebSocket
2. استخدم HTTPS في الإنتاج
3. تأكد من إعدادات CORS
4. استخدم polling كبديل

#### المشكلة: Connection timeout
**الحل:**
1. زيادة timeout في الإعدادات
2. إضافة reconnection logic
3. استخدام fallback mechanisms

### 5. اختبار الاتصال

```javascript
// في console المتصفح
const socket = io('https://your-domain.com', {
  transports: ['polling', 'websocket']
});

socket.on('connect', () => {
  console.log('✅ Connected successfully');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error);
});
```

### 6. مراقبة الأداء

```javascript
// إضافة monitoring للاتصال
socket.on('reconnect', (attemptNumber) => {
  console.log('🔄 Reconnected after', attemptNumber, 'attempts');
});

socket.on('reconnect_failed', () => {
  console.error('❌ Reconnection failed');
});
```

## نصائح مهمة:

1. **استخدم HTTPS دائماً** في الإنتاج
2. **اختبر الاتصال** قبل النشر
3. **راقب الـ logs** للكشف عن المشاكل
4. **استخدم fallback mechanisms** للاتصال
5. **تأكد من إعدادات CORS** الصحيحة
