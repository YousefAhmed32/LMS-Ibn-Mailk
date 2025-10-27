# 🔧 دليل تشغيل السيرفر

## 📋 الحالة الحالية
- ✅ السيرفر يعمل الآن على المنفذ `5000`
- ✅ المسار `/api/upload/image` يعمل بشكل صحيح
- ✅ المصادقة مفعلة على مسار رفع الصور

## 🚀 كيفية تشغيل السيرفر

### 1. التحقق من حالة السيرفر
```powershell
netstat -ano | findstr :5000
```

إذا رأيت `LISTENING` فالسيرفر يعمل.

### 2. إيقاف السيرفر القديم (إذا كان موجوداً)
```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### 3. تشغيل السيرفر
```powershell
node server/server.js
```

أو للتشغيل في الخلفية:
```powershell
Start-Process -NoNewWindow node -ArgumentList "server/server.js"
```

## ✅ التحقق من عمل السيرفر

### استخدام PowerShell
```powershell
curl http://localhost:5000/health
```

يجب أن ترى:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "...",
  "uptime": ...,
  "environment": "development"
}
```

### استخدام المتصفح
افتح في المتصفح:
```
http://localhost:5000/health
```

## 🔍 حل المشاكل

### المشكلة: ERR_CONNECTION_REFUSED
**السبب:** السيرفر غير شغال

**الحل:**
1. شغل السيرفر باستخدام: `node server/server.js`
2. تأكد من أن MongoDB يعمل
3. تحقق من أن المنفذ `5000` متاح

### المشكلة: Port 5000 is already in use
**الحل:**
```powershell
# إيجاد العملية التي تستخدم المنفذ
netstat -ano | findstr :5000

# إيقاف العملية (استبدل PID برقم العملية)
taskkill /PID <PID> /F
```

### المشكلة: MongoDB connection error
**الحل:**
1. تأكد من أن MongoDB يعمل
2. تحقق من `MONGO_URL` في ملف `.env`
3. شغل MongoDB إذا لم يكن شغالاً

## 📝 ملاحظات مهمة

1. **حافظ على السيرفر شغالاً** أثناء العمل على المشروع
2. **اترك نافذة Terminal مفتوحة** لرؤية logs السيرفر
3. **راجع الـ logs** إذا واجهت أي مشاكل
4. **أعد تشغيل السيرفر** بعد تعديل ملفات السيرفر

## 🎯 المسارات المهمة

- Health Check: `http://localhost:5000/health`
- Upload Image: `POST http://localhost:5000/api/upload/image`
- Get Image: `GET http://localhost:5000/api/uploads/:id`
