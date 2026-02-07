# تحليل نظام الامتحانات - Phase 1

## 1.1 مشاكل Course Model (Pre-save middleware)

### Pre-save middleware (lines 414-510)

#### المشاكل في الـ normalization:

1. **تحويل index → option.id**: الكود بيحول `correctAnswer` لو كان رقم (index) إلى `option.id`. المشكلة: لو الفرونت بيبعت `correctAnswer` كـ option.id من البداية، والـ pre-save بيولد option.id جديد (`opt_${qId}_${optIndex}`)، فـ الـ ID اللي اتحفظ ممكن يختلف عن اللي الطالب شافه في واجهة الامتحان (لأن الـ ID بيتولد في أوقات مختلفة).

2. **تحويل text → id**: الكود بيدور على option بنفس النص ويحول correctAnswer لنص الـ option.id. المشكلة: لو الفرونت بعت `correctAnswer: "القاهرة"` (نص الإجابة) بدل `correctAnswer: "opt_xyz_1"`، الـ pre-save بيحوله لـ id. لكن لو في تكرار في نصوص الخيارات أو اختلاف بسيط (مسافات، تشكيل)، المطابقة تفشل أو تختار خيار غلط.

3. **إيه المفروض يحصل بالظبط؟**
   - الفرونت **لازم** يبعت `correctAnswer` = `option.id` (string) للـ MCQ.
   - الـ Backend **ما يعملش** أي تحويل على correctAnswer — يتحفظ كما هو.
   - الـ pre-save **فقط**: يولد `question.id` و `option.id` لو مش موجودين؛ يحسب `totalPoints` و `totalQuestions`. بدون أي تحويل من index أو text إلى id.

### correctAnswer handling

- **الـ format الصحيح:**
  - **MCQ**: `correctAnswer` = string (option.id)، مثال: `"opt_q1_1"`.
  - **True/False**: `correctAnswer` = boolean، `true` أو `false`.

- **إيه اللي بيتحفظ فعلياً في MongoDB؟**
  - بعد الـ pre-save الحالي: ممكن يتحفظ option.id مُولَّد من الـ pre-save (مثلاً `opt_q_0_1`) حتى لو الفرونت بعت id مختلف، لأن الـ pre-save كان بيستبدل/يطابق حسب index أو text. فـ اللي بيتحفظ مش بالضرورة نفس اللي الفرونت بعته.

- **تضارب بين types؟**
  - في الـ schema: `correctAnswer` نوعه `Mixed` (يقبل string أو boolean). التضارب بيحصل من الـ pre-save اللي بيحوّل من number أو من نص الإجابة إلى id، فـ نوع القيمة المخزنة بيختلف حسب مصدر البيانات (فرونت قديم vs جديد).

---

## 1.2 Request/Response Flow

### Frontend → Backend → MongoDB

1. **الفورم بيبعت إيه؟**  
   - المفروض: `correctAnswer` = `option.id` (string) للـ MCQ، و boolean للـ True/False. كل option فيه `id` و `text` (أو `optionText`).

2. **Backend بيستقبل إيه؟**  
   - نفس الـ body (بعد parse الـ JSON لو مرسل كـ string). الـ createCourse/updateCourse بيعملوا validation ويتركوا البيانات كما هي (بدون تحويل correctAnswer). الـ pre-save في Course كان هو اللي بيعمل التحويلات.

3. **Pre-save بيعمل إيه؟**  
   - حالياً: يحسب totalPoints، يولد option.id لو ناقص، ويحوّل correctAnswer من index أو text إلى option.id.  
   - المطلوب: فقط توليد ids ناقصة + حساب totalPoints/totalQuestions، بدون أي تحويل لـ correctAnswer.

4. **MongoDB بيحفظ إيه في الآخر؟**  
   - نفس الـ object اللي اتعدل فيه فقط: إضافة ids ناقصة وقيم totalPoints/totalQuestions. باقي الحقول (ومنها correctAnswer) تتحفظ كما أتت من الـ controller.

### مثال واقعي

```javascript
// ما يبعته الفرونت (المفروض)
const frontendSends = {
  title: 'امتحان تجريبي',
  type: 'internal_exam',
  questions: [
    {
      id: 'q_test_1',
      questionText: 'ما هي عاصمة مصر؟',
      type: 'mcq',
      points: 2,
      options: [
        { id: 'opt_q_test_1_0', text: 'الإسكندرية' },
        { id: 'opt_q_test_1_1', text: 'القاهرة' },
        { id: 'opt_q_test_1_2', text: 'الجيزة' }
      ],
      correctAnswer: 'opt_q_test_1_1'
    }
  ]
};

// ما يستقبله الـ controller (نفس الهيكل، بعد parse لو كان string)
const backendReceives = {
  ...frontendSends,
  // لا تغيير على correctAnswer أو options
};

// ما يُحفظ في MongoDB بعد pre-save النظيف (فقط إضافة/حساب)
const mongoDBStores = {
  ...backendReceives,
  totalPoints: 2,
  totalQuestions: 1,
  // correctAnswer يبقى 'opt_q_test_1_1'
  // لا تحويل من index أو text
};
```

---

## 2. الحل المختصر

- **Course Model**: pre-save يقتصر على: توليد `question.id` / `option.id` إذا غير موجودين، وحساب `totalPoints` و `totalQuestions` و `totalMarks`. إزالة كل تحويل لـ correctAnswer (من index أو من text).
- **createCourse / updateCourse**: الإبقاء على الـ validation الحالي (التأكد أن correctAnswer = option.id للـ MCQ)، وعدم تغيير قيمة correctAnswer أو تحويلها.
- **submitExam**: مقارنة مباشرة `question.correctAnswer === userAnswer.answer` (كلاهما string للـ MCQ)، مع تسجيل debug واضح.
- **Frontend**: التأكد أن إنشاء الامتحان يضع `correctAnswer = option.id`، وأن واجهة الحل ترسل `answer: option.id` في الـ answers.

بعد تطبيق هذا الحل، الـ Expected vs Actual في الاختبارات يجب أن يتطابقا (بدون تحويلات خفية في الـ backend).
