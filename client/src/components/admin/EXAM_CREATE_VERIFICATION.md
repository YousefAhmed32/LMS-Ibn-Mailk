# التحقق من إصلاح إنشاء الامتحانات (MCQ)

## ما تم إصلاحه

1. **IntegratedExamBuilder.jsx – `normalizeModernQuestionsForSave()`**
   - مصدر واحد لـ `option.id`: يتم توليده دائمًا بالشكل `opt_${questionId}_${cIdx}`.
   - تعيين `correctAnswer` حسب **index** الخيار الصحيح (الذي فيه `isCorrect: true`) وليس حسب `choice.id`.
   - النتيجة: `correctAnswer` يتطابق دائمًا مع أحد `options[].id`.

2. **EnhancedCreateCourseModal.jsx – `handleSubmit()`**
   - التحقق قبل الإرسال: لكل سؤال MCQ التأكد من وجود `correctAnswer` ضمن `options[].id`.
   - في حال الخطأ: إظهار toast بالعربية وعدم استدعاء الـ API.
   - تسجيل في الـ console لتتبع البيانات قبل الإرسال.

## خطوات التحقق

### 1. إنشاء دورة بامتحان MCQ واحد
- افتح "إنشاء دورة جديدة".
- أضف امتحانًا، سؤال MCQ، خيارين أو أكثر، حدد الإجابة الصحيحة.
- احفظ الامتحان ثم "إنشاء الدورة".
- **المتوقع:** إنشاء الدورة بنجاح بدون رسالة "لا يحتوي على إجابة صحيحة".

### 2. إنشاء دورة بامتحان فيه أكثر من سؤال MCQ
- امتحان بعنوان "الاختبار" مع سؤال 1 وسؤال 2 (كلاهما MCQ).
- حدد إجابة صحيحة لكل سؤال.
- احفظ ثم إنشاء الدورة.
- **المتوقع:** إنشاء الدورة بنجاح (السؤال 2 لا يعود يسبب خطأ).

### 3. التحقق من الـ Console
- قبل الإرسال يجب أن تظهر سطور مثل:
  - `PRE-SUBMIT VALIDATION:`
  - `Exam 1: "..."` و `Q1: correctAnswer="opt_..."` و `valid? true`
- في `IntegratedExamBuilder` عند الحفظ:
  - `Q1: correctAnswer = "opt_..." (choice index N)`

### 4. التحقق من الـ Backend
- في استجابة إنشاء الدورة، تحقق من `data.exams[0].questions`.
- لكل سؤال MCQ: `correctAnswer` يجب أن يكون string يساوي أحد `options[].id`.

## بيانات اختبار (بعد التطبيع)

- السؤال الأول (له `id: "q_test_1"`):  
  `correctAnswer: "opt_q_test_1_1"`،  
  `options: [{ id: "opt_q_test_1_0", ... }, { id: "opt_q_test_1_1", ... }, ...]`.

- السؤال الثاني (بدون `id`):  
  `id: "q_<timestamp>_1"`،  
  `correctAnswer: "opt_q_<timestamp>_1_1"` (نفس index الخيار الصحيح)،  
  `options` بنفس الـ `id` pattern.

## في حال استمرار الخطأ

1. تأكد أن كل سؤال MCQ له خيار واحد فقط مع `isCorrect: true` في واجهة المنشئ.
2. راجع الـ console: إن ظهر `valid? false` فالمشكلة من بيانات الامتحان قبل الإرسال.
3. راجع الـ backend: إن ظهر "Correct answer option.id ... not found in options" فتحقق من الـ payload المرسل (تبويب Network).
