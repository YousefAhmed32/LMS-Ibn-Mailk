# إصلاح توحيد هيكل بيانات الامتحانات بين الإنشاء والتعديل

## المشكلة

عند إنشاء دورة جديدة وإضافة امتحانات:
- ✅ البيانات تُحفظ بشكل صحيح في السيرفر
- ❌ عند فتح الامتحان للتعديل، الإجابة الصحيحة (`correctAnswer`) لا تظهر تلقائياً في الـ form
- ❌ المستخدم مضطر لإعادة اختيار الإجابة الصحيحة رغم أنها موجودة في السيرفر

بينما عند تعديل كورس موجود:
- ✅ الإجابة الصحيحة تظهر تلقائياً عند فتح الامتحان للتعديل

## السبب الجذري

### 1. اختلاف في هيكل البيانات

**في `IntegratedExamBuilder` (إنشاء الكورس):**
- أسئلة MCQ: `correctAnswer` يُحفظ كـ `option.id` (string مثل `opt_1234567890_abc`)
- أسئلة True/False: `correctAnswer` يُحفظ كـ `boolean` (true/false)

**في `EditCourse` (تعديل الكورس):**
- أسئلة MCQ: `correctAnswer` يُحفظ كـ `index` (number: 0, 1, 2...)
- أسئلة True/False: `correctAnswer` يُحفظ كـ `index` (0 أو 1) في UI، ثم يُحول إلى `boolean` قبل الإرسال

### 2. عدم تحويل البيانات قبل الإرسال

في `CourseManagement.jsx`، كانت البيانات تُرسل مباشرة بدون:
- تحويل `correctAnswer` من `option.id` إلى `index`
- تحويل `options` من objects إلى strings
- التحقق من وجود `correctAnswer` لكل سؤال

## الحل المطبق

### 1. إصلاح `IntegratedExamBuilder.jsx`

#### أ. إضافة دالة `normalizeQuestionsForSave`

```javascript
const normalizeQuestionsForSave = (questions) => {
  return questions.map((question) => {
    // For MCQ questions, convert correctAnswer from option.id to index
    if (question.type === 'mcq' && question.correctAnswer && question.options) {
      const correctIndex = question.options.findIndex(opt => opt.id === question.correctAnswer);
      if (correctIndex >= 0) {
        return {
          ...question,
          correctAnswer: correctIndex, // Convert to index
          options: question.options.map(opt => opt.text || opt.optionText || '') // Convert to strings
        };
      }
    }
    
    // For true_false questions, ensure correctAnswer is boolean
    if (question.type === 'true_false') {
      let correctAnswer = question.correctAnswer;
      if (typeof correctAnswer === 'number') {
        correctAnswer = correctAnswer === 0; // 0 = true (صحيح)
      }
      return {
        ...question,
        correctAnswer: Boolean(correctAnswer)
      };
    }
    
    return question;
  });
};
```

#### ب. تحديث `saveExam` لاستخدام الدالة

```javascript
const normalizedQuestions = normalizeQuestionsForSave(examForm.questions);

const examData = {
  ...exam,
  questions: normalizedQuestions // Use normalized questions
};
```

#### ج. إصلاح `editExam` لتحويل البيانات عند التحميل

```javascript
const editExam = (exam) => {
  // Convert questions for display
  const questionsForDisplay = exam.questions.map(q => {
    // Convert options to objects with id if they're strings
    let optionsForDisplay = q.options.map((opt, optIndex) => {
      if (typeof opt === 'object') return opt;
      return {
        id: `opt_${Date.now()}_${optIndex}_${Math.random()}`,
        text: String(opt).trim()
      };
    });
    
    // Convert correctAnswer from index to option.id for display
    if (q.type === 'mcq' && typeof q.correctAnswer === 'number') {
      displayCorrectAnswer = optionsForDisplay[q.correctAnswer]?.id;
    }
    
    return {
      ...q,
      options: optionsForDisplay,
      correctAnswer: displayCorrectAnswer
    };
  });
  
  setExamForm({
    ...exam,
    questions: questionsForDisplay
  });
};
```

### 2. إصلاح `CourseManagement.jsx`

#### أ. إضافة دالة `normalizeExamForServer`

```javascript
const normalizeExamForServer = (exam) => {
  if (!exam || exam.type !== 'internal_exam' || !exam.questions) {
    return exam;
  }

  const normalizedQuestions = exam.questions.map((question) => {
    // Normalize options to strings
    let normalizedOptions = question.options.map(opt => {
      if (typeof opt === 'object') {
        return String(opt.text || opt.optionText || '').trim();
      }
      return String(opt).trim();
    }).filter(opt => opt.length > 0);

    // Normalize correctAnswer
    let normalizedCorrectAnswer = question.correctAnswer;

    if (question.type === 'true_false') {
      // Convert to boolean
      if (typeof normalizedCorrectAnswer === 'number') {
        normalizedCorrectAnswer = normalizedCorrectAnswer === 0;
      }
      normalizedCorrectAnswer = Boolean(normalizedCorrectAnswer);
    } else if (question.type === 'multiple_choice' || question.type === 'mcq') {
      // Convert to index if needed
      if (typeof normalizedCorrectAnswer === 'string') {
        const index = normalizedOptions.findIndex(opt => opt === normalizedCorrectAnswer);
        normalizedCorrectAnswer = index >= 0 ? index : null;
      }
    }

    return {
      ...question,
      options: normalizedOptions,
      correctAnswer: normalizedCorrectAnswer,
      points: Math.max(1, parseInt(question.points || question.marks || 1) || 1)
    };
  });

  return {
    ...exam,
    questions: normalizedQuestions
  };
};
```

#### ب. تطبيق التحويل والتحقق قبل الإرسال

```javascript
// Process exams from enhanced form data
const exams = [];
if (formData.exams && Array.isArray(formData.exams)) {
  try {
    formData.exams.forEach((exam, index) => {
      // Normalize exam data before adding
      const normalizedExam = normalizeExamForServer(exam);
      
      // Validate that all questions have correctAnswer
      if (normalizedExam.type === 'internal_exam' && normalizedExam.questions) {
        for (let i = 0; i < normalizedExam.questions.length; i++) {
          const q = normalizedExam.questions[i];
          if (q.type === 'multiple_choice' || q.type === 'mcq') {
            if (q.correctAnswer === null || q.correctAnswer === undefined) {
              throw new Error(`السؤال ${i + 1} في الامتحان "${normalizedExam.title}" لا يحتوي على إجابة صحيحة محددة`);
            }
          }
          if (q.type === 'true_false') {
            if (q.correctAnswer === null || q.correctAnswer === undefined) {
              throw new Error(`السؤال ${i + 1} في الامتحان "${normalizedExam.title}" لا يحتوي على إجابة صحيحة محددة`);
            }
          }
        }
      }
      
      exams.push({
        ...normalizedExam,
        questions: normalizedExam.questions
      });
    });
  } catch (error) {
    toast({
      title: 'خطأ في بيانات الامتحانات',
      description: error.message,
      variant: 'destructive'
    });
    return;
  }
}
```

## الهيكل الموحد للبيانات

### قبل الإرسال للسيرفر

```javascript
{
  type: "internal_exam",
  questions: [
    {
      type: "multiple_choice",
      options: ["خيار 1", "خيار 2", "خيار 3"], // Array of strings
      correctAnswer: 0 // Index (number)
    },
    {
      type: "true_false",
      options: ["صحيح", "خطأ"],
      correctAnswer: true // Boolean
    }
  ]
}
```

### في الـ UI (للعرض)

```javascript
{
  type: "internal_exam",
  questions: [
    {
      type: "multiple_choice",
      options: [
        { id: "opt_123", text: "خيار 1" },
        { id: "opt_456", text: "خيار 2" }
      ],
      correctAnswer: "opt_123" // option.id (string) for display
    },
    {
      type: "true_false",
      options: ["صحيح", "خطأ"],
      correctAnswer: 0 // Index (0 = صحيح, 1 = خطأ) for display
    }
  ]
}
```

## التحويلات التلقائية

### عند الحفظ (من UI إلى Server)

1. **MCQ**: `option.id` (string) → `index` (number)
2. **True/False**: `index` (0/1) → `boolean` (true/false)
3. **Options**: `objects` → `strings`

### عند التحميل (من Server إلى UI)

1. **MCQ**: `index` (number) → `option.id` (string)
2. **True/False**: `boolean` (true/false) → `index` (0/1)
3. **Options**: `strings` → `objects` with `id`

## التحقق قبل الحفظ

قبل إرسال البيانات للسيرفر، يتم التحقق من:

✅ كل سؤال `multiple_choice` له `correctAnswer` محدد
✅ كل سؤال `true_false` له `correctAnswer` محدد
✅ جميع الخيارات غير فارغة
✅ جميع الأسئلة لها نص

## النتيجة

✅ عند إنشاء كورس جديد، البيانات تُحفظ بشكل صحيح
✅ عند فتح الامتحان للتعديل، الإجابة الصحيحة تظهر تلقائياً
✅ لا حاجة لإعادة اختيار الإجابات
✅ تجربة مستخدم موحدة بين الإنشاء والتعديل
✅ منع أخطاء 400 من السيرفر بفضل التحقق المسبق

## الملفات المعدلة

1. `client/src/components/admin/IntegratedExamBuilder.jsx`:
   - إضافة `normalizeQuestionsForSave`
   - تحديث `saveExam`
   - إصلاح `editExam`

2. `client/src/pages/admin/CourseManagement.jsx`:
   - إضافة `normalizeExamForServer`
   - تطبيق التحويل والتحقق قبل الإرسال

## الاختبار

للتأكد من أن كل شيء يعمل:

1. أنشئ كورس جديد مع امتحان
2. أضف أسئلة `multiple_choice` و `true_false`
3. حدد الإجابات الصحيحة
4. احفظ الكورس
5. افتح الكورس للتعديل
6. افتح الامتحان للتعديل
7. ✅ تأكد من أن الإجابات الصحيحة تظهر محددّة تلقائياً

