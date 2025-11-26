# إصلاح ربط بيانات الإجابة الصحيحة في نموذج تعديل الامتحان

## المشكلة

عند فتح صفحة تعديل الامتحان، كانت البيانات تُحمّل بشكل صحيح من السيرفر، لكن القيم السابقة مثل:
- الإجابة الصحيحة المحددة مسبقاً
- الخيار الذي كان محدد في أسئلة الاختيار من متعدد
- الإجابة الصحيحة في أسئلة صح/خطأ

**لم تكن تظهر في الـ form**، مما يجبر المستخدم على إعادة اختيارها رغم أن البيانات موجودة في السيرفر.

## السبب الجذري

المشكلة كانت في **عدم تحويل `correctAnswer` من صيغة السيرفر إلى صيغة العرض في الـ UI**:

1. **لأسئلة True/False**: السيرفر يحفظ `correctAnswer` كـ `boolean` (`true`/`false`)، لكن الـ UI يحتاج `index` (`0` أو `1`)
2. **لأسئلة Multiple Choice**: السيرفر قد يحفظ `correctAnswer` كـ `string` (نص الخيار) أو `number` (index)، والـ UI يحتاج `index` دائماً

## الحل

تم إنشاء دالة `convertCorrectAnswerForDisplay` تقوم بتحويل `correctAnswer` من صيغة السيرفر إلى صيغة العرض:

### 1. لأسئلة True/False

```javascript
// من السيرفر: boolean (true/false)
// للعرض: index (0/1)
// true (صحيح) = 0
// false (خطأ) = 1
```

### 2. لأسئلة Multiple Choice

```javascript
// من السيرفر: string (نص الخيار) أو number (index)
// للعرض: index (number)
// إذا كان string، يتم البحث عن الخيار المطابق وإرجاع index
```

## التطبيق

### 1. عند التحميل من السيرفر (`fetchCourseData`)

```javascript
const displayCorrectAnswer = convertCorrectAnswerForDisplay({
  ...q,
  options: normalizedOptions
});

return {
  ...q,
  options: normalizedOptions,
  correctAnswer: displayCorrectAnswer // Store as index for UI display
};
```

### 2. عند فتح الامتحان للتعديل (`handleEditExam`)

```javascript
const displayCorrectAnswer = convertCorrectAnswerForDisplay({
  ...q,
  options: normalizedOptions
});

setNewExam({
  ...exam,
  questions: exam.questions.map(q => ({
    ...q,
    correctAnswer: displayCorrectAnswer // Store as index for UI display
  }))
});
```

## مثال عملي

### قبل الإصلاح

```javascript
// البيانات من السيرفر
{
  type: "true_false",
  correctAnswer: true  // boolean
}

// في الـ UI: لا يظهر أي خيار محدد ❌
```

### بعد الإصلاح

```javascript
// البيانات من السيرفر
{
  type: "true_false",
  correctAnswer: true  // boolean
}

// بعد التحويل للعرض
{
  type: "true_false",
  correctAnswer: 0  // index (0 = صحيح)
}

// في الـ UI: يظهر الخيار الأول (صحيح) محدد ✅
```

## الكود الكامل للدالة

```javascript
const convertCorrectAnswerForDisplay = (question) => {
  if (!question || question.correctAnswer === null || question.correctAnswer === undefined) {
    return null;
  }

  if (question.type === 'true_false') {
    // Convert boolean to index: true (صحيح) = 0, false (خطأ) = 1
    if (typeof question.correctAnswer === 'boolean') {
      return question.correctAnswer ? 0 : 1;
    }
    // If it's already a number, return it
    if (typeof question.correctAnswer === 'number') {
      return question.correctAnswer;
    }
    // If it's a string, try to convert
    if (typeof question.correctAnswer === 'string') {
      return question.correctAnswer === 'true' || question.correctAnswer === 'صحيح' ? 0 : 1;
    }
    return null;
  } else if (question.type === 'multiple_choice' || question.type === 'mcq') {
    // If it's already a number (index), return it
    if (typeof question.correctAnswer === 'number') {
      return question.correctAnswer;
    }
    // If it's a string, find the matching option index
    if (typeof question.correctAnswer === 'string' && question.options) {
      const correctAnswerText = question.correctAnswer.trim();
      const index = question.options.findIndex(opt => {
        const optText = typeof opt === 'string' ? opt : (opt.text || opt.optionText || '');
        return String(optText).trim() === correctAnswerText;
      });
      return index >= 0 ? index : null;
    }
    return null;
  }

  return question.correctAnswer;
};
```

## التحسينات الإضافية

### 1. معالجة الحالات المختلفة

الدالة تعالج جميع الحالات الممكنة:
- ✅ `boolean` → `index` (لـ true_false)
- ✅ `number` → `number` (إذا كان بالفعل index)
- ✅ `string` → `index` (البحث عن الخيار المطابق)
- ✅ `null`/`undefined` → `null`

### 2. دعم صيغ مختلفة للخيارات

الدالة تدعم:
- خيارات كـ `strings`
- خيارات كـ `objects` مع `text` أو `optionText`

### 3. التحويل العكسي عند الحفظ

عند الحفظ، يتم استخدام `normalizeExamData` لتحويل `correctAnswer` من `index` إلى `boolean` (لـ true_false) قبل الإرسال للسيرفر.

## النتيجة

✅ عند فتح الامتحان للتعديل، تظهر الإجابة الصحيحة المحددة مسبقاً
✅ تجربة مستخدم أفضل - لا حاجة لإعادة اختيار الإجابات
✅ البيانات تُعرض بشكل صحيح في جميع الحالات

## الملفات المعدلة

- `client/src/pages/admin/EditCourse.jsx`:
  - إضافة دالة `convertCorrectAnswerForDisplay`
  - تحديث `fetchCourseData` لاستخدام الدالة
  - تحديث `handleEditExam` لاستخدام الدالة

## الاختبار

للتأكد من أن كل شيء يعمل:

1. أنشئ امتحان جديد مع أسئلة `true_false` و `multiple_choice`
2. حدد الإجابات الصحيحة
3. احفظ الامتحان
4. افتح الامتحان للتعديل
5. ✅ تأكد من أن الإجابات الصحيحة تظهر محددّة تلقائياً

