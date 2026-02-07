# Exam System - Postman / API Testing

## Base URL
- Local: `http://localhost:5000/api`
- Admin courses: `PUT/POST /api/admin/courses` (check your admin routes for exact path)

## 1. Create course with exam (correct format)

**POST** `/api/admin/courses`  
Headers: `Content-Type: application/json`, `Authorization: Bearer <admin_token>`

Body (raw JSON):

```json
{
  "title": "رياضيات - الصف العاشر",
  "subject": "رياضيات",
  "grade": "10",
  "price": 100,
  "duration": 30,
  "level": "intermediate",
  "description": "دورة تجريبية",
  "videos": [],
  "exams": [
    {
      "id": "exam_test_1",
      "title": "امتحان تجريبي",
      "type": "internal_exam",
      "duration": 30,
      "passingScore": 60,
      "questions": [
        {
          "id": "q_test_1",
          "questionText": "ما هي عاصمة مصر؟",
          "type": "mcq",
          "points": 2,
          "options": [
            { "id": "opt_q_test_1_0", "text": "الإسكندرية" },
            { "id": "opt_q_test_1_1", "text": "القاهرة" },
            { "id": "opt_q_test_1_2", "text": "الجيزة" }
          ],
          "correctAnswer": "opt_q_test_1_1"
        }
      ]
    }
  ]
}
```

- Save returned `data._id` as `courseId`.
- Get exam id from `data.exams[0].id` (e.g. `exam_test_1`).

## 2. Get exam for taking (student)

**GET** `/api/internal-exams/:courseId/:examId`  
Headers: `Authorization: Bearer <student_token>`

- Response must include `questions[].options[].id` — student will send these ids as answers.

## 3. Submit exam (student)

**POST** `/api/internal-exams/:courseId/:examId/submit`  
Headers: `Content-Type: application/json`, `Authorization: Bearer <student_token>`

Body:

```json
{
  "answers": [
    { "questionId": "q_test_1", "answer": "opt_q_test_1_1" }
  ],
  "timeSpent": 300
}
```

- `answer` for MCQ must be **exactly** the `option.id` from the exam (string).
- For true_false use `true` or `false` (boolean).

## 4. Alternative exam API (exam-controller)

- Get exam: **GET** `/api/exams/:courseId/:examId`
- Submit: **POST** `/api/exams/:courseId/:examId/submit`
- Results: **GET** `/api/exams/results/:courseId`

Same body format for submit: `{ "answers": [ { "questionId": "...", "answer": "opt_..." } ], "timeSpent": 0 }`.

## Validation checks

1. **Create/Update course**: `correctAnswer` must be a string that equals one of `options[].id` for MCQ.
2. **Submit**: Each `answers[].answer` for MCQ must be the same string as the correct `option.id` to be marked correct.
3. **Debug**: Server logs `MCQ Grading:` with `correctAnswer`, `userAnswer`, `isCorrect` — verify both are strings and match when correct.
