/**
 * Gemini API Service
 * Zodpovedný za komunikáciu s Gemini API a generovanie učebného obsahu
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Hlavná funkcia na generovanie učebného obsahu
 */
export async function generateLearningContent(topicData, testResults) {
    console.log('🤖 Spúšťam Gemini API volanie...');
    console.log(`   Téma: ${topicData.title}`);
    console.log(`   Skóre: ${testResults.score}% (${testResults.correctAnswers}/${testResults.totalQuestions})`);

    const prompt = buildPrompt(topicData, testResults);
    
    // Retry mechanizmus
    let lastError = null;
    const maxRetries = 2;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`   Pokus ${attempt}/${maxRetries}...`);
            
            const startTime = Date.now();
            const content = await callGeminiAPI(prompt);
            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            
            console.log(`✅ Gemini API odpoveď získaná za ${duration}s`);
            
            // Parsovanie JSON odpovede
            const parsedContent = parseGeminiResponse(content);
            
            console.log(`📄 Vygenerovaný obsah: ${parsedContent.sections.length} sekcií`);
            
            return parsedContent;
        } catch (error) {
            lastError = error;
            console.error(`❌ Pokus ${attempt} zlyhal:`, error.message);
            
            if (attempt < maxRetries) {
                console.log(`   Skúšam znova...`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Počkať 1s
            }
        }
    }
    
    console.error('❌ Gemini API volanie zlyhalo po všetkých pokusoch');
    throw lastError;
}

/**
 * Zostrojenie promptu pre Gemini API
 */
function buildPrompt(topicData, testResults) {
    // Identifikácia slabých miest (nesprávne odpovede)
    const weaknesses = testResults.detailedAnswers
        .filter(a => !a.wasCorrect)
        .map(a => `- ${a.questionText} (užívateľ odpovedal: "${a.userSelectedOption}", správne: "${a.correctOption}")`);

    const weaknessesText = weaknesses.length > 0 
        ? weaknesses.join('\n')
        : 'Užívateľ nemal žiadne slabé miesta.';

    const prompt = `
ÚLOHA: Vytvor personalizované učebné materiály

TÉMA: ${topicData.title}
POPIS: ${topicData.description}
ÚROVEŇ: ${topicData.difficulty}

VÝSLEDKY VSTUPNÉHO TESTU:
- Úspešnosť: ${testResults.score}%
- Správne odpovede: ${testResults.correctAnswers}/${testResults.totalQuestions}

DETAILNÁ ANALÝZA ODPOVEDÍ:
${testResults.detailedAnswers.map(a => `
  Otázka: ${a.questionText}
  Užívateľ odpovedal: ${a.userSelectedOption}
  Správna odpoveď: ${a.correctOption}
  Výsledok: ${a.wasCorrect ? '✓ Správne' : '✗ Nesprávne'}
`).join('\n')}

IDENTIFIKOVANÉ SLABÉ MIESTA (nesprávne odpovede):
${weaknessesText}

POŽIADAVKY NA OBSAH:
1. Dĺžka: MAX 2000 slov (čítanie 10 minút pri 200 slov/min)
2. Úroveň: Prispôsob úrovni ${topicData.difficulty}
3. Zameranie: Vysvetli SLABÉ MIESTA z testu podrobne
4. Štruktúra: 
   - Introduction (20% obsahu, ~400 slov)
   - Main Content (60% obsahu, rozdelený na 2-3 podkapitoly, ~1200 slov)
   - Summary (20% obsahu, ~400 slov)
5. Štýl: Jednoduchý jazyk, príklady z reálneho života
6. Formát: Markdown (nadpisy, zoznamy, zvýraznenia)

VÝSTUPNÝ JSON FORMÁT - POZOR NA VALIDITU:
{
  "introduction": {
    "content": "Markdown text uvodu",
    "estimatedMinutes": 2
  },
  "mainSections": [
    {
      "heading": "Nazov podkapitoly 1",
      "content": "Markdown text s vysvetlenim",
      "estimatedMinutes": 3,
      "addressesWeakness": "Slabe miesto"
    }
  ],
  "summary": {
    "content": "Markdown zhrutie",
    "estimatedMinutes": 2,
    "keyTakeaways": ["Bod 1", "Bod 2", "Bod 3"]
  }
}

KRITICKY DOLEZITE - JSON VALIDITA:
1. NEOBALUJ JSON do markdown kodu (ziadne triple backticks)
2. V texte pouzivaj LEN bezpecne znaky: a-z A-Z 0-9 . , ! ? ( ) - _ 
3. NEPOUŽÍVAJ tieto znaky priamo v texte: úvodzovky " (escape ako \\"), backslash \\ (escape ako \\\\)
4. Pre novy riadok pouzij \\n (nie skutocny enter)
5. Diakritiku (č š ť ž...) je OK
6. Emoji su OK (ale nie v JSON klucoch)
7. Zameraj sa na NESPRAVNE ODPOVEDE
8. Jednoduche priklady a analogie

VYTVOR VALIDNY JSON (BEZ MARKDOWN WRAPPERA):
`;

    return prompt;
}

/**
 * Volanie Gemini API
 */
async function callGeminiAPI(prompt) {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY nie je nastavený v .env súbore');
    }

    const url = `${GEMINI_API_URL}?key=${apiKey}`;
    
    const requestBody = {
        contents: [{
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            temperature: 0.4,  // Nižšia pre konzistentnejší output
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,  // Viac tokénov pre dlhší obsah
            responseMimeType: "application/json"  // Požiadaj o JSON
        }
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Neplatná odpoveď z Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
}

/**
 * Parsovanie odpovede z Gemini API
 */
function parseGeminiResponse(responseText) {
    try {
        // Odstránenie markdown kódu (```json ... ```)
        let cleanedText = responseText.trim();
        
        // Agresívnejšie odstránenie markdown wrapperu
        const jsonStartMatch = cleanedText.match(/```(?:json)?\s*\n/);
        const jsonEndMatch = cleanedText.match(/\n```\s*$/);
        
        if (jsonStartMatch) {
            cleanedText = cleanedText.substring(jsonStartMatch.index + jsonStartMatch[0].length);
        }
        
        if (jsonEndMatch) {
            cleanedText = cleanedText.substring(0, jsonEndMatch.index);
        }
        
        cleanedText = cleanedText.trim();
        
        // Pokus o parsovanie
        let parsed;
        try {
            parsed = JSON.parse(cleanedText);
        } catch (firstError) {
            console.log('⚠️ Prvý pokus o parsovanie zlyhal, pokúšam sa extrahovať JSON...');
            
            // Posledný pokus - extrahovanie len textu medzi prvým { a posledným }
            const firstBrace = cleanedText.indexOf('{');
            const lastBrace = cleanedText.lastIndexOf('}');
            
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                const extracted = cleanedText.substring(firstBrace, lastBrace + 1);
                try {
                    parsed = JSON.parse(extracted);
                    console.log('✅ Parsovanie úspešné po extrakcii');
                } catch (secondError) {
                    console.error('❌ Ani extrakcia nepomohla');
                    throw firstError; // Hádž pôvodnú chybu
                }
            } else {
                throw firstError;
            }
        }
        
        // Validácia štruktúry
        if (!parsed.introduction || !parsed.mainSections || !parsed.summary) {
            throw new Error('Neplatná štruktúra JSON odpovede');
        }
        
        // Transformácia na štandardný formát pre DB
        const sections = [
            {
                type: 'introduction',
                heading: null,
                content: parsed.introduction.content,
                estimatedMinutes: parsed.introduction.estimatedMinutes || 2,
                order: 1
            },
            ...parsed.mainSections.map((section, index) => ({
                type: 'main',
                heading: section.heading,
                content: section.content,
                estimatedMinutes: section.estimatedMinutes || 3,
                order: index + 2
            })),
            {
                type: 'summary',
                heading: null,
                content: parsed.summary.content,
                estimatedMinutes: parsed.summary.estimatedMinutes || 2,
                order: parsed.mainSections.length + 2
            }
        ];
        
        const totalDuration = sections.reduce((sum, s) => sum + s.estimatedMinutes, 0);
        
        return {
            sections,
            totalDuration,
            keyTakeaways: parsed.summary.keyTakeaways || []
        };
        
    } catch (error) {
        console.error('❌ Chyba pri parsovaní Gemini odpovede:', error.message);
        console.error('📄 Raw odpoveď (prvých 1000 znakov):', responseText.substring(0, 1000));
        console.error('📄 Raw odpoveď (posledných 200 znakov):', responseText.substring(Math.max(0, responseText.length - 200)));
        
        // Pokus o uloženie raw odpovede pre debugging
        try {
            const fs = require('fs');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            fs.writeFileSync(`./gemini-error-${timestamp}.txt`, responseText);
            console.error('💾 Raw odpoveď uložená do gemini-error-' + timestamp + '.txt');
        } catch (fsError) {
            // Ignoruj chyby pri ukladaní
        }
        
        throw new Error('Nepodarilo sa parsovať odpoveď z Gemini API: ' + error.message);
    }
}

