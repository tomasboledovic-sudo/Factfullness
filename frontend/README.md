# Factfullness Frontend

React frontend pre vzdelávaciu aplikáciu s Gemini API.

## 🚀 Inštalácia a Spustenie

```bash
npm install
npm run dev
```

Frontend beží na: `http://localhost:5173/`

## 📂 Štruktúra Projektu

```
src/
├── components/
│   ├── Navigation.jsx          # Header navigácia
│   ├── TopicCard.jsx          # Karta témy
│   ├── QuestionCard.jsx       # Otázka s možnosťami
│   └── ContentSection.jsx     # Sekcia učebného obsahu
├── pages/
│   ├── HomePage.jsx           # 1️⃣ Výber témy
│   ├── PreAssessmentPage.jsx  # 2️⃣ Vstupný test
│   ├── LearningPage.jsx       # 3️⃣ Štúdium materiálu
│   ├── PostAssessmentPage.jsx # 4️⃣ Výstupný test
│   └── ResultsPage.jsx        # 5️⃣ Výsledky a pokrok
├── config.js                  # API konfigurácia
├── App.jsx                    # Router
└── main.jsx                   # Entry point
```

## 🎯 User Flow

```
1. HomePage
   ↓ Vyber tému
2. PreAssessmentPage  
   ↓ Vyplň vstupný test (8 otázok)
   ↓ Odošli → Backend volá Gemini API
3. LearningPage
   ↓ Študuj personalizovaný obsah (10 min)
4. PostAssessmentPage
   ↓ Vyplň výstupný test (8 otázok)
5. ResultsPage
   ✓ Zobrazenie výsledkov a zlepšenia
```

## 🔌 Backend API Integration

### Endpoints použité:
- `GET /api/topics` - Načítanie tém
- `POST /api/sessions` - Vytvorenie relácie
- `GET /api/sessions/:id/pre-test` - Vstupné otázky
- `POST /api/sessions/:id/pre-test/submit` - Odoslanie + **Gemini API**
- `GET /api/sessions/:id/content` - Učebný obsah

### API Base URL:
Konfigurácia v `src/config.js`:
```javascript
export const API_BASE_URL = 'http://localhost:3000/api';
```

## 🎨 Komponenty

### 1. HomePage
- Grid s témami (TopicCard)
- Vytvorenie session po kliknutí
- Navigácia na vstupný test

### 2. PreAssessmentPage
- Zobrazenie otázok jedna po jednej
- Progress bar
- Navigácia Späť/Ďalej
- Odoslanie → Loading state počas Gemini API volania

### 3. LearningPage
- Markdown rendering obsahu (react-markdown)
- Časovač štúdia
- Scroll progress tracker
- Tlačidlo "Pokračovať" (aktivné po 1 min)

### 4. PostAssessmentPage
- Rovnaká štruktúra ako PreAssessment
- Odoslanie → Simulácia vylepšenia

### 5. ResultsPage
- Score cards (pred/po/zlepšenie)
- Bar chart porovnania
- Analýza pokroku
- Tlačidlo na výber ďalšej témy

## 💾 LocalStorage

```javascript
// Uložené dáta:
- currentSessionId: UUID relácie
- sessionStartTime: Timestamp začiatku
- preTestScore: Skóre vstupného testu (%)
- postTestScore: Skóre výstupného testu (%)
- improvement: Zlepšenie v percentuálnych bodoch
```

## 🎨 Dizajn

- **Framework**: React 18 + Vite
- **Styling**: Čisté CSS (bez frameworku)
- **Farby**: Inšpirované Factfullness audit
  - Primárna: `hsl(217, 91%, 60%)` - Modrá
  - Akcent: `hsl(142, 76%, 45%)` - Zelená
- **Font**: Inter (Google Fonts)
- **Responzívny**: Mobile-first prístup

## 🔧 Technológie

- React 18
- React Router v6
- React Markdown
- Vite
- Native Fetch API

## 📱 Responzívnosť

- Desktop: Optimalizované pre 1400px+
- Tablet: Grid adjustments
- Mobile: Single column layout

## ✅ Features

- ✅ SPA s React Router
- ✅ Komponentový prístup
- ✅ API integrácia
- ✅ LocalStorage persistence
- ✅ Loading states
- ✅ Error handling
- ✅ Smooth transitions
- ✅ Progress tracking
- ✅ Markdown rendering
- ✅ Responsive design

## 🧪 Testovanie

1. Otvorte `http://localhost:5173/`
2. Backend musí bežať na `http://localhost:3000/`
3. Vyberte tému "Základy Fotosyntézy"
4. Vyplňte vstupný test
5. Počkajte na generovanie obsahu (~10s)
6. Štúdujte materiál
7. Vyplňte výstupný test
8. Pozrite si výsledky

## 🎯 Next Steps

- Implementovať skutočný post-test endpoint
- Pridať user authentication
- Pridať viac tém
- Implementovať dashboard s históriou
- Pridať export výsledkov
