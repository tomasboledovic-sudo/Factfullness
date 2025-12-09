# 📚 Factfullness - Learn Simply

Personalizovaná vzdelávacia platforma využívajúca AI na prispôsobenie učebného obsahu na základe vašich znalostí.

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Funkcie

- 🎯 **Personalizované Učenie** - AI generuje obsah prispôsobený vašim potrebám
- 📊 **Vstupné a Výstupné Testy** - Meranie pokroku
- 🔄 **Opakovanie Testov** - Možnosť zlepšiť sa
- 📈 **Detailné Výsledky** - Vidíte každú správnu/nesprávnu odpoveď
- 🎨 **Moderný Dizajn** - Geometrické tvary, soft colors
- 📱 **Responzívne** - Funguje na mobile aj desktope

---

## 🚀 Rýchly Štart

### Požiadavky

- Node.js 18+
- npm alebo yarn
- Gemini API kľúč

### Inštalácia

1. **Klonujte repozitár:**
```bash
git clone https://github.com/your-username/factfullness.git
cd factfullness
```

2. **Backend Setup:**
```bash
cd backend
npm install
```

3. **Vytvorte `.env` súbor:**
```bash
echo "GEMINI_API_KEY=your_api_key_here" > .env
```

4. **Frontend Setup:**
```bash
cd ../frontend
npm install
```

### Spustenie

1. **Backend (Terminal 1):**
```bash
cd backend
node server.js
```
Server beží na `http://localhost:3000`

2. **Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
Aplikácia beží na `http://localhost:5173`

---

## 📐 Architektúra

```
fact/
├── backend/           # Node.js + Express API
│   ├── controllers/   # Request handlers
│   ├── routes/        # API endpoints
│   ├── services/      # Business logic (Gemini API)
│   └── data/          # JSON databázy (topics, questions, sessions)
├── frontend/          # React + Vite
│   ├── src/
│   │   ├── pages/     # Hlavné stránky
│   │   ├── components/# Znovupoužiteľné komponenty
│   │   └── config.js  # Konfigurácia
└── docs/              # Dokumentácia
```

---

## 🎨 Dizajn

### Farebná Paleta

| Farba | Hex | Použitie |
|-------|-----|----------|
| Navy Blue | `#1a3a52` | Primary |
| Teal Light | `#7ec5c1` | Accent |
| Teal Dark | `#157b8b` | Accent Dark |
| Pink | `#d87f8f` | Error/Highlight |

### Logo

Geometrické tvary: Ružový polkruh + Tyrkysový kruh + Tyrkysová kapsula

---

## 🔄 User Flow

```
Homepage → Výber Témy
    ↓
Vstupný Test (8 otázok)
    ↓
Zobrazenie Výsledkov
    ↓
AI Generovanie Obsahu (~30s)
    ↓
Učebné Materiály (~10 min)
    ↓
Výstupný Test (8 otázok)
    ↓
Zobrazenie Výsledkov
    ↓
Porovnanie Pokroku
    ↓
[Zopakovať Test] alebo [Vybrať inú tému]
```

---

## 📚 Témy

Aplikácia obsahuje 10 rôznorodých tém:

1. 🌱 **Základy Fotosyntézy** (Biológia)
2. 📐 **Pytagorova Veta** (Matematika)
3. 🐛 **Protostómy** (Biológia)
4. 🍳 **Varenie na Woku** (Varenie)
5. 🔢 **Výpočet Kalórií** (Výživa)
6. ➡️ **Vektory** (Matematika)
7. 📈 **Mocniny a Odmocniny** (Matematika)
8. 🧘 **Stretching Svalov** (Fitness)
9. 🎨 **Farebná Harmónia** (Dizajn)
10. 💻 **List vs Set vs Map** (Programovanie)

---

## 🤖 Gemini API

Aplikácia využíva Google Gemini 2.5 Flash pre generovanie personalizovaného učebného obsahu.

### Features:
- **1 API volanie** na session
- Personalizácia na základe výsledkov vstupného testu
- Retry mechanizmus (2 pokusy)
- Automatic JSON parsing

---

## 📊 API Endpointy

### Topics
- `GET /api/topics` - Zoznam všetkých tém
- `GET /api/topics/:topicId` - Detail témy

### Sessions
- `POST /api/sessions` - Vytvorenie novej session
- `GET /api/sessions/:sessionId/pre-test` - Načítanie otázok
- `POST /api/sessions/:sessionId/pre-test/submit` - Odoslanie testu

### Content
- `GET /api/sessions/:sessionId/content` - Učebný materiál

---

## 🛠️ Technológie

### Backend
- Node.js
- Express.js
- Google Gemini API
- JSON File Storage

### Frontend
- React 18
- Vite
- React Router
- React Markdown
- CSS (Custom Variables)

---

## 📝 Dokumentácia

Podrobná dokumentácia v `/docs`:
- `ARCHITECTURE.md` - Systémová architektúra
- `API.md` - API špecifikácia
- `NEW_DESIGN.md` - Design guide
- `TEST-RESULTS-FEATURE.md` - Feature dokumentácia

---

## 🤝 Prispievanie

1. Fork repozitár
2. Vytvorte feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit zmeny (`git commit -m 'Add AmazingFeature'`)
4. Push do branch (`git push origin feature/AmazingFeature`)
5. Otvorte Pull Request

---

## 📄 Licencia

MIT License - viď [LICENSE](LICENSE) súbor

---

## 👥 Autori

**Tomáš Boledovič & Juraj Uhlík**

---

## 🙏 Poďakovanie

- Google Gemini AI za API
- Dizajn inšpirovaný modernými prezentáciami
- Open source komunita

---

## 📧 Kontakt

Pre otázky alebo feedback nás kontaktujte cez GitHub Issues.

---

**Made with ❤️ using React & Gemini AI**
