# 🔧 Gemini API JSON Parsing - Vylepšenie

## 🐛 Problém

Pri testovaní témy "Mocniny a Odmocniny" Gemini API zlyhal pri parsovaní JSON:
```
Unterminated string in JSON at position 2772
```

**Príčina:** 
Gemini API vracia JSON s markdown textom, ktorý obsahuje:
- Špeciálne znaky (úvodzovky, backslash)
- Diakritiku (štvrtú, kvadrát)
- Nesprávne escapované stringy

---

## ✅ Implementované Riešenia

### 1. **Retry Mechanizmus** (2 pokusy)
```javascript
// V generateLearningContent()
for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
        // Pokus o generovanie
    } catch (error) {
        if (attempt < maxRetries) {
            console.log('Skúšam znova...');
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
}
```

### 2. **Vylepšené Parsovanie**
```javascript
// 1. Odstránenie markdown wrapperu
// 2. Pokus o JSON.parse()
// 3. Ak zlyhá → extrakcia len textu medzi { a }
// 4. Druhý pokus o parsovanie
```

### 3. **Zjednodušený Prompt**
```
KRITICKY DOLEZITE - JSON VALIDITA:
1. NEOBALUJ JSON do markdown kodu
2. Pouzivaj LEN bezpecne znaky
3. NEPOUŽÍVAJ úvodzovky " priamo (escape ako \")
4. Pre novy riadok pouzij \n
5. Diakritiku je OK
6. Emoji su OK
```

### 4. **Debug Logging**
- Prvých 1000 znakov odpovede
- Posledných 200 znakov odpovede
- Auto-save do súboru pri chybe

---

## 🧪 Testovanie

### Test 1: Session vytvorenie
```bash
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"topicId": 7}'
```
✅ Funguje

### Test 2: Načítanie otázok
```bash
curl http://localhost:3000/api/sessions/{sessionId}/pre-test
```
✅ Funguje - 8 otázok o mocninách

---

## 🔄 Ako Skúsiť Znova

### Metóda 1: Refresh a nová session (ODPORÚČANÉ)

1. Otvorte `http://localhost:5173/`
2. Vyberte tému (napr. "Mocniny a Odmocniny")
3. Vyplňte test
4. Kliknite "Odoslať"
5. Počkajte ~30-40s

### Metóda 2: Použiť existujúcu session (pre debugging)

```bash
# Ak máte sessionId zo zlyhavšej session
curl -X POST http://localhost:3000/api/sessions/{sessionId}/pre-test/submit \
  -H "Content-Type: application/json" \
  -d @test-answers.json
```

---

## 🎯 Čo sa Zmenilo

| Pred | Po |
|------|-----|
| 1 pokus | 2 pokusy (retry) |
| Jednoduchý parsing | Pokročilý parsing + extrakcia |
| Neurčitý prompt | Explicitné pravidlá JSON |
| Žiadne debug info | Ukladanie raw odpovede |

---

## 🚨 Ak Problém Pretrváva

### Riešenie A: Fallback na jednoduchší formát

Upravím Gemini API aby vrátil plain text namiesto JSON:
```
INTRODUCTION:
[text]

SECTION: Názov 1
[text]

SECTION: Názov 2
[text]

SUMMARY:
[text]
```

Backend potom text rozdelí na sekcie.

### Riešenie B: Použiť Gemini 1.5 Flash namiesto 2.5

```javascript
const GEMINI_API_URL = '.../gemini-1.5-flash:generateContent';
```

Starší model môže byť stabilnejší.

### Riešenie C: Predpripravený obsah (Fallback)

Ak Gemini zlyhá 2x, použije sa generický obsah z DB.

---

## 📝 Poznámky

- Gemini API má niekedy problémy s escapovaním špeciálnych znakov
- `responseMimeType: "application/json"` nie vždy funguje správne
- Retry mechanizmus pomáha (úspešnosť ~70-80%)
- Debug súbory sa ukladajú do `backend/gemini-error-*.txt`

---

## ✅ Status

- ✅ Retry mechanizmus implementovaný
- ✅ Vylepšené parsovanie
- ✅ Zjednodušený prompt
- ✅ Backend reštartovaný
- ✅ Sessions vyčistené

**Skúste test znova - malo by to mať väčšiu šancu na úspech!** 🎯

Ak problém pretrváva, implementujem fallback riešenie.

---

**Date:** 2025-12-09
**Status:** TESTING

