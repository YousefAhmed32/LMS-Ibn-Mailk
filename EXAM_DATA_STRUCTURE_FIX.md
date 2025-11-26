# إصلاح هيكل بيانات الامتحانات

## المشكلة

كانت هناك مشكلتان رئيسيتان في هيكل بيانات الامتحانات:

### 1. مشكلة `[object Object]` عند العرض
- **السبب**: كانت `options` في بعض الأحيان كائنات (objects) بدلاً من نصوص (strings)
- **النتيجة**: عند عرض الامتحانات في واجهة المستخدم، كان يظهر `[object Object]` بدلاً من نص الخيار

### 2. خطأ 400 عند الحفظ
- **السبب**: أسئلة `true_false` كانت تحفظ `correctAnswer` كرقم (0 أو 1) بدلاً من boolean
- **النتيجة**: السيرفر كان يرفض البيانات لأن `correctAnswer` يجب أن يكون boolean لأسئلة true/false

## الحل

تم إنشاء دالة `normalizeExamData` في `EditCourse.jsx` تقوم بـ:

1. **تنظيف `options`**: تحويل جميع الخيارات من objects إلى strings
2. **تحويل `correctAnswer`**: تحويل `correctAnswer` لأسئلة `true_false` من رقم إلى boolean
3. **توحيد الهيكل**: ضمان أن جميع البيانات متسقة قبل الإرسال

## الهيكل الصحيح للبيانات

### أسئلة الاختيار من متعدد (Multiple Choice)

```javascript
{
  id: "q_1234567890",
  questionText: "ما هي عاصمة مصر؟",
  type: "multiple_choice",
  options: ["القاهرة", "الإسكندرية", "الجيزة", "أسوان"], // Array of strings
  correctAnswer: 0, // Index of correct option (number)
  points: 5
}
```

### أسئلة صح/خطأ (True/False)

```javascript
{
  id: "q_1234567891",
  questionText: "مصر هي أكبر دولة عربية من حيث عدد السكان",
  type: "true_false",
  options: ["صحيح", "خطأ"], // Fixed array
  correctAnswer: true, // MUST be boolean (true/false), NOT number!
  points: 2
}
```

**⚠️ مهم جداً**: لأسئلة `true_false`:
- `correctAnswer` **يجب** أن يكون `boolean` (`true` أو `false`)
- **لا** تستخدم رقم (`0` أو `1`)
- `true` = صحيح (الخيار الأول)
- `false` = خطأ (الخيار الثاني)

## كيفية الاستخدام

### في EditCourse.jsx

الدالة `normalizeExamData` يتم استدعاؤها تلقائياً في `handleSaveChanges`:

```javascript
const normalizedExams = exams.map((exam, index) => {
  const normalizedExam = normalizeExamData(exam);
  // ... rest of the code
});
```

### في CreateCourse.jsx (إذا كان موجوداً)

يمكن استخدام نفس الدالة أو استيرادها من `examDataNormalizer.js`:

```javascript
import { normalizeExam, normalizeExams } from '../../utils/examDataNormalizer';

// قبل الإرسال
const normalizedExams = normalizeExams(exams);
```

## التحويلات التلقائية

الدالة تقوم بالتحويلات التالية تلقائياً:

1. **Options من Objects إلى Strings**:
   ```javascript
   // قبل
   options: [{ text: "خيار 1" }, { text: "خيار 2" }]
   
   // بعد
   options: ["خيار 1", "خيار 2"]
   ```

2. **correctAnswer لـ true_false من Number إلى Boolean**:
   ```javascript
   // قبل
   correctAnswer: 0  // أو 1
   
   // بعد
   correctAnswer: true  // أو false
   ```

3. **تنظيف النصوص**: جميع النصوص يتم trim وإزالة المسافات الزائدة

## التحقق من البيانات

قبل الإرسال، يتم التحقق من:

- ✅ `questionText` غير فارغ
- ✅ `type` صحيح (`multiple_choice`, `true_false`, `essay`)
- ✅ `options` موجودة ولها على الأقل خيارين (لـ multiple_choice)
- ✅ `correctAnswer` محدد
- ✅ `points` رقم صحيح أكبر من 0
- ✅ `correctAnswer` boolean لأسئلة `true_false`

## ملاحظات مهمة

1. **عند التحميل من السيرفر**: يتم تنظيف البيانات تلقائياً في `fetchCourseData`
2. **عند التعديل**: يتم تنظيف البيانات في `handleEditExam`
3. **قبل الحفظ**: يتم تنظيف البيانات في `handleSaveChanges`

## الاختبار

للتأكد من أن كل شيء يعمل بشكل صحيح:

1. أنشئ امتحان جديد مع أسئلة `true_false`
2. تأكد من أن `correctAnswer` يتم حفظه كـ boolean
3. احفظ وعدّل الامتحان مرة أخرى
4. تأكد من عدم ظهور `[object Object]` في العرض
5. تأكد من عدم وجود أخطاء 400 عند الحفظ

## الملفات المعدلة

- `client/src/pages/admin/EditCourse.jsx`: إضافة دالة `normalizeExamData` وتطبيقها
- `client/src/utils/examDataNormalizer.js`: ملف utility جديد للتنظيف (اختياري)

