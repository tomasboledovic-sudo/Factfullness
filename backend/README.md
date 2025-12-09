# Factfullness Backend

Backend pre vzdelávaciu aplikáciu s Gemini API integráciou.

## 🚀 Inštalácia

```bash
npm install
```

## ⚙️ Konfigurácia

Vytvorte `.env` súbor:
```
PORT=3000
GEMINI_API_KEY=your_api_key_here
```

## 🏃 Spustenie

```bash
# Production
npm start

# Development (s auto-reload)
npm run dev
```

## 📍 API Endpoints

### Topics
- `GET /api/topics` - Zoznam všetkých tém
- `GET /api/topics/:topicId` - Detail témy

### Sessions
- `POST /api/sessions` - Vytvorenie novej session
- `GET /api/sessions/:sessionId` - Detail session

### Assessment
- `GET /api/sessions/:sessionId/pre-test` - Načítanie vstupných otázok
- `POST /api/sessions/:sessionId/pre-test/submit` - Odoslanie odpovedí + **Gemini API volanie**

## 🤖 Gemini API

Jediné volanie Gemini API sa uskutoční v:
```
POST /api/sessions/:sessionId/pre-test/submit
```

Tento endpoint:
1. Vyhodnotí odpovede vstupného testu
2. Zavolá Gemini API s personalizovaným promptom
3. Vygeneruje učebný materiál (max 10 min čítania)
4. Uloží obsah do session

## 📦 Štruktúra Projektu

```
backend/
├── controllers/
│   ├── topicController.js
│   ├── sessionController.js
│   └── assessmentController.js
├── services/
│   └── geminiService.js
├── routes/
│   ├── topicRoutes.js
│   ├── sessionRoutes.js
│   └── assessmentRoutes.js
├── data/
│   ├── topics.json
│   ├── preTestQuestions.json
│   └── sessions.json
└── server.js
```

## 🧪 Testovanie API

### 1. Vytvoriť session
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"topicId": 1}'
```

### 2. Načítať vstupný test
```bash
curl http://localhost:3000/api/sessions/{sessionId}/pre-test
```

### 3. Odoslať odpovede (spustí Gemini API)
```bash
curl -X POST http://localhost:3000/api/sessions/{sessionId}/pre-test/submit \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"questionId": "q1-pre-topic1", "selectedOptionIndex": 1, "answeredAt": "2025-12-09T10:00:00Z"},
      {"questionId": "q2-pre-topic1", "selectedOptionIndex": 0, "answeredAt": "2025-12-09T10:00:30Z"}
    ],
    "timeSpentSeconds": 120
  }'
```

