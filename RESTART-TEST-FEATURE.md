# 🔄 Nová Funkcia: Zopakovať Test

## 🎯 Implementované

Po dokončení finálneho testu má používateľ možnosť **zopakovať test pre tú istú tému** bez nutnosti vracať sa na homepage.

---

## ✨ Funkcie

### 1. **Button "🔄 Zopakovať Test"**
- Zobrazuje sa na **ResultsPage** vedľa buttonu "Vybrať inú tému"
- Vytvorí novú session pre **tú istú tému**
- Vymaže staré výsledky
- Presmeruje na vstupný test

### 2. **Automatické Ukladanie Témy**
- Pri vytvorení session sa uloží `topicId` a `topicTitle` do localStorage
- Umožňuje reštart bez nutnosti návštevy homepage

### 3. **Loading State**
- Počas vytvorenia novej session sa zobrazuje "Reštartujem..."
- Button je disabled počas API volania

---

## 📂 Zmenené Súbory

### **1. HomePage.jsx**
**Pridané:**
```javascript
localStorage.setItem('currentTopicId', topicId);
localStorage.setItem('currentTopicTitle', topic?.title || '');
```

**Účel:** Uloženie informácií o aktuálnej téme pre možnosť reštartu

---

### **2. ResultsPage.jsx**

**Pridané State:**
```javascript
const [restarting, setRestarting] = useState(false);
const currentTopicId = parseInt(localStorage.getItem('currentTopicId'));
const currentTopicTitle = localStorage.getItem('currentTopicTitle') || '';
```

**Nová Funkcia:**
```javascript
const handleRestartTest = async () => {
  // 1. Vytvorí novú session pre tú istú tému
  // 2. Vymaže staré výsledky
  // 3. Presmeruje na vstupný test
}
```

**Upravený Cleanup:**
```javascript
const handleBackToTopics = () => {
  // Pridané mazanie topicId a topicTitle
  localStorage.removeItem('currentTopicId');
  localStorage.removeItem('currentTopicTitle');
}
```

**Nový Button:**
```jsx
<button 
  onClick={handleRestartTest}
  className="btn btn-secondary btn-large"
  disabled={restarting}
>
  {restarting ? 'Reštartujem...' : '🔄 Zopakovať Test'}
</button>
```

---

### **3. ResultsPage.css**

**Upravené:**
```css
.results-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
```

**Mobile Responsive:**
```css
@media (max-width: 768px) {
  .results-actions {
    flex-direction: column;
  }
  .results-actions .btn {
    width: 100%;
  }
}
```

---

## 🔄 User Flow

### **Pred Zmenou:**
```
Výsledky → [Vybrať inú tému] → Homepage → Vybrať tému → Test
```

### **Po Zmene:**
```
Výsledky → [🔄 Zopakovať Test] → Vstupný Test (rovnaká téma)
      ↓
[Vybrať inú tému] → Homepage → Vybrať tému → Test
```

---

## 🧪 Testovací Scenár

### **Scenár 1: Zopakovanie testu**

1. **Dokončite celý test flow:**
   - Vstupný test
   - Učebné materiály
   - Výstupný test
   - → **ResultsPage**

2. **Na ResultsPage:**
   - ✅ Vidíte 2 buttony vedľa seba:
     - 🔄 **Zopakovať Test** (šedý, secondary)
     - **Vybrať inú tému** (modrý, primary)

3. **Kliknite "🔄 Zopakovať Test":**
   - Button text sa zmení na "Reštartujem..."
   - Button je disabled
   - Vytvorí sa nová session pre tú istú tému
   - → Presmeruje na vstupný test

4. **Vyplňte test znova:**
   - Môžete získať iné otázky (random order)
   - AI vygeneruje nový obsah na základe nových odpovedí
   - Vidíte nové výsledky

---

### **Scenár 2: Výber inej témy**

1. **Na ResultsPage kliknite "Vybrať inú tému":**
   - Vymaže sa localStorage (vrátane topicId)
   - → Presmeruje na homepage
   - Môžete vybrať **inú tému**

---

## 💾 LocalStorage Management

### **Ukladané Dáta:**
```javascript
{
  "currentSessionId": "abc123",
  "currentTopicId": 1,
  "currentTopicTitle": "Základy Fotosyntézy",
  "preTestScore": 87.5,
  "postTestScore": 95.0,
  "improvement": 7.5,
  "sessionStartTime": 1234567890
}
```

### **Cleanup Pri Reštarte:**
```javascript
// Odstránené:
- preTestScore
- postTestScore  
- improvement

// Zachované:
- currentTopicId
- currentTopicTitle

// Nové:
- currentSessionId (nová session)
- sessionStartTime (nový timestamp)
```

### **Cleanup Pri Výbere Inej Témy:**
```javascript
// Odstránené VŠETKO:
- currentSessionId
- currentTopicId
- currentTopicTitle
- preTestScore
- postTestScore
- improvement
```

---

## 🎨 UI Design

### **Desktop:**
```
┌──────────────────────────────────┐
│         VÝSLEDKY                 │
│                                  │
│  [🔄 Zopakovať Test]  [Vybrať inú tému]  │
└──────────────────────────────────┘
```

### **Mobile:**
```
┌──────────────────┐
│    VÝSLEDKY      │
│                  │
│ ┌──────────────┐ │
│ │🔄 Zopakovať  │ │
│ │    Test      │ │
│ └──────────────┘ │
│                  │
│ ┌──────────────┐ │
│ │   Vybrať     │ │
│ │  inú tému    │ │
│ └──────────────┘ │
└──────────────────┘
```

---

## 🔐 Error Handling

### **1. Chýbajúci topicId:**
```javascript
if (!currentTopicId) {
  alert('Nepodarilo sa načítať tému');
  return;
}
```

### **2. API Error:**
```javascript
try {
  // API call
} catch (err) {
  alert('Chyba pri vytváraní novej relácie');
  console.error(err);
  setRestarting(false);
}
```

### **3. Backend Error:**
```javascript
if (!data.success) {
  alert('Nepodarilo sa vytvoriť novú reláciu');
  setRestarting(false);
}
```

---

## 📊 API Calls

### **Reštart Testu:**

**Request:**
```http
POST /api/sessions
Content-Type: application/json

{
  "topicId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "new-session-id",
    "topicId": 1,
    "status": "pre_assessment",
    "createdAt": "2025-12-09T19:30:00.000Z"
  }
}
```

---

## ✅ Výhody

1. **Rýchle Opakovanie** - Žiadne extra kliky
2. **Rovnaká Téma** - Automaticky sa vytvorí session pre tú istú tému
3. **Nové Otázky** - Možnosť získať iné otázky (ak máte viac otázok v DB)
4. **Nový AI Obsah** - AI vygeneruje nový obsah na základe nových odpovedí
5. **Lepší UX** - Intuitívne ovládanie, jasné možnosti

---

## 🚀 Použitie

1. **Otvorte** `http://localhost:5173/`
2. **Vyberte tému** a prejdite celý test flow
3. **Na ResultsPage:**
   - Kliknite **"🔄 Zopakovať Test"** pre tú istú tému
   - Alebo **"Vybrať inú tému"** pre návrat na homepage

---

## 📈 Budúce Vylepšenia

- [ ] História všetkých pokusov pre tému
- [ ] Porovnanie výsledkov medzi pokusmi
- [ ] Limit počtu opakovaní
- [ ] Štatistiky zlepšenia cez čas
- [ ] Odporúčania na základe predchádzajúcich pokusov

---

**Status:** ✅ COMPLETE
**Date:** 2025-12-09
**Version:** 1.0

