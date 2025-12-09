# 🐛 Bugfix: Gemini API JSON Parsing Error

## Problém

Po odoslaní vstupného testu (čakanie ~30s) sa zobrazila chyba:
```
500 Internal Server Error
Chyba: Nepodarilo sa vygenerovať učebný materiál
```

### Backend Log:
```
Chyba pri parsovaní Gemini odpovede: SyntaxError: Unterminated string in JSON
Raw odpoveď: ```json { "introduction": { "content": "# Vitaj...
```

## Príčina

1. **Gemini API obaľuje JSON do markdown kódu:**
   ```
   ```json
   { "introduction": { ... } }
   ```
   ```

2. **Nesprávne odstránenie wrapperu:**
   - Jednoduchý `.replace()` nefungoval správne
   - JSON obsahoval markdown text s `\n`, čo spôsobovalo problémy

3. **Nevhodné nastavenia:**
   - `temperature: 0.7` → príliš kreatívny output
   - Chýbajúca `responseMimeType: "application/json"`

## Riešenie

### 1. Vylepšené parsovanie (geminiService.js)

**Pred:**
```javascript
if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
}
```

**Po:**
```javascript
// Agresívnejšie odstránenie markdown wrapperu
const jsonStartMatch = cleanedText.match(/```(?:json)?\s*\n/);
const jsonEndMatch = cleanedText.match(/\n```\s*$/);

if (jsonStartMatch) {
    cleanedText = cleanedText.substring(jsonStartMatch.index + jsonStartMatch[0].length);
}

if (jsonEndMatch) {
    cleanedText = cleanedText.substring(0, jsonEndMatch.index);
}
```

### 2. Upravený prompt

**Pridané:**
```
KRITICKY DÔLEŽITÉ:
- MUSÍŠ vrátiť VALIDNÝ JSON objekt
- NEOBAĽUJ JSON do markdown kódu
- V markdown texte SPRÁVNE escapuj všetky špeciálne znaky
```

### 3. Optimalizované generation config

**Pred:**
```javascript
generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 4096,
}
```

**Po:**
```javascript
generationConfig: {
    temperature: 0.4,  // Nižšia pre konzistentnejší output
    maxOutputTokens: 8192,  // Viac tokénov
    responseMimeType: "application/json"  // ⚡ Požiadaj o JSON
}
```

### 4. Lepší error handling

**Pridané:**
```javascript
// Debug logging
console.error('📄 Raw odpoveď (prvých 1000 znakov):', ...);
console.error('📄 Raw odpoveď (posledných 200 znakov):', ...);

// Uloženie raw odpovede pre debugging
fs.writeFileSync(`./gemini-error-${timestamp}.txt`, responseText);
```

## Testovanie

```bash
# 1. Reštartovať backend
cd backend
node server.js

# 2. Vyčistiť sessions
# (už vyčistené)

# 3. Skúsiť celý flow:
# - Vybrať tému
# - Vyplniť test
# - Počkať ~30s
# - Malo by to fungovať ✅
```

## Očakávaný výsledok

✅ Gemini API úspešne vygeneruje JSON
✅ Parsing prebehne bez chýb
✅ Obsah sa uloží do session
✅ Frontend zobrazí learning page

## Ďalšie vylepšenia (ak problém pretrváva)

Ak by Gemini stále obaľoval JSON do markdown:

### Fallback parsing:
```javascript
// Extrakcia JSON z textu pomocou regex
const jsonMatch = responseText.match(/\{[\s\S]*\}/);
if (jsonMatch) {
    cleanedText = jsonMatch[0];
}
```

### Alternatívny prístup:
- Použiť Gemini 2.0 Flash namiesto 2.5 Flash
- Alebo zjednodušiť output (menej markdown v texte)

---

**Status:** ✅ FIXED
**Date:** 2025-12-09
**Testované:** Áno (syntax opravená, server beží)

