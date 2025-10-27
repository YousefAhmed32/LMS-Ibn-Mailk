# ✅ تم إصلاح مشكلة رفع صورة المجموعة

## 🔍 المشكلة
كانت هناك مشكلة في رفع صورة المجموعة في صفحة `/admin/groups` حيث كانت تظهر رسالة خطأ `ERR_CONNECTION_REFUSED`.

## 🔧 الحلول المنفذة

### 1. تشغيل السيرفر ✅
- تم تشغيل السيرفر على المنفذ `5000` بنجاح
- التحقق من أن السيرفر يعمل عبر: `http://localhost:5000/health`

### 2. تصحيح مسار رفع الصورة ✅
- تم تغيير المسار من `/api/uploads/image` إلى `/api/upload/image`
- الملف المعدل: `client/src/utils/imageUtils.js`

```javascript
// قبل التعديل
const response = await axiosInstance.post('/api/uploads/image', formData, {

// بعد التعديل
const response = await axiosInstance.post('/api/upload/image', formData, {
```

### 3. إضافة المصادقة ✅
- تم إضافة middleware `authenticateToken` إلى مسار رفع الصورة
- الملف المعدل: `server/routers/unified-upload-routes.js`

```javascript
// إضافة المصادقة
router.post("/image", authenticateToken, (req, res) => {
```

## 📋 المسارات المتاحة

### رفع الصورة
- **POST** `/api/upload/image` - رفع صورة واحدة
- **POST** `/api/upload/images` - رفع صور متعددة
- **GET** `/api/uploads/:id` - استرجاع الصورة بواسطة ID

### المسارات في السيرفر
```javascript
app.use("/api/upload", unifiedUploadRoutes);  // للرفع
app.use("/api/uploads", unifiedUploadRoutes); // للاسترجاع
```

## ✅ النتيجة
الآن يمكن للمستخدمين:
1. رفع صورة المجموعة بنجاح
2. عرض الصورة المرفوعة مباشرة
3. عدم ظهور أخطاء `ERR_CONNECTION_REFUSED`

## 🧪 الاختبار
1. افتح `http://localhost:5173/admin/groups`
2. اضغط على "إنشاء مجموعة جديدة"
3. اختر صورة
4. تأكد من رفع الصورة بنجاح
5. تأكد من ظهور الصورة في قائمة المجموعات

## 📝 ملاحظات
- السيرفر يجب أن يعمل على المنفذ `5000`
- الصور يتم تخزينها في GridFS
- حجم الصورة الأقصى: 5MB
- أنواع الصور المدعومة: JPG, JPEG, PNG, WEBP


