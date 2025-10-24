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

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
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
    }
}
```

### 4. حل مشاكل WebSocket

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
