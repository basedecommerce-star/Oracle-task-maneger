# API Contract

## Authentication

### POST /api/auth/telegram
Authenticate using Telegram WebApp initData.

**Request:**
```json
{ "initData": "<telegram-webapp-init-data-string>" }
```

**Response:**
```json
{ "accessToken": "jwt-token", "user": { "id": "uuid", "telegramId": 123456, "firstName": "Name" } }
```

## User

### GET /api/me
Returns current user profile.

### PATCH /api/me/settings
Update user preferences (language, category).

**Request:**
```json
{ "languageCode": "ru", "categoryId": "uuid" }
```

## Content

### GET /api/categories
Returns all driving license categories.

### GET /api/topics
Returns all question topics.

### GET /api/tickets?categoryId=uuid
Returns ticket list for a category.

### GET /api/signs?type=WARNING
Returns road signs, optionally filtered by type.

### GET /api/rules/search?q=обгон&lang=ru
Search traffic rules by text.

## Training

### POST /api/training/start
Start a training session.

**Request:**
```json
{ "categoryId": "uuid", "topicId": "uuid", "ticketNumber": 1, "mode": "sequential" }
```

### POST /api/training/:id/answer
Submit an answer in training mode. Returns correct answer and explanation.

**Request:**
```json
{ "sessionQuestionId": "uuid", "answerIds": ["uuid"] }
```

**Response:**
```json
{ "isCorrect": true, "correctAnswerIds": ["uuid"], "explanation": "...", "ruleReference": "п. 3.14" }
```

## Exam

### POST /api/exams/start
Start an exam session. Timer begins server-side.

**Request:**
```json
{ "categoryId": "uuid" }
```

### POST /api/exams/:id/answer
Submit answer during exam. No feedback returned.

### POST /api/exams/:id/finish
Finish exam. Returns results.

**Response:**
```json
{ "isPassed": true, "correctAnswers": 23, "wrongAnswers": 1, "totalQuestions": 24, "errors": [...] }
```

## Statistics

### GET /api/stats/overview
Returns user statistics summary.

## Reports

### POST /api/questions/:id/report
Report a question issue.

**Request:**
```json
{ "complaintType": "WRONG_ANSWER", "comment": "..." }
```

## Admin Endpoints

### POST /api/admin/import/source-snapshot
Upload a source snapshot for ingestion.

### POST /api/admin/parser/run
Trigger a parser run on a snapshot.

### GET /api/admin/conflicts
List unresolved parser conflicts.

### POST /api/admin/questions/:id/approve
Approve a question after review.

### POST /api/admin/questions/:id/reject
Reject a question.

### POST /api/admin/questions/:id/publish
Publish a verified question to live.

### GET /api/admin/evidence/:id
Retrieve evidence bundle for a question.
