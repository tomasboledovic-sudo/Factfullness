/**
 * Gemini API Service
 * Zodpovedný za komunikáciu s Gemini API a generovanie učebného obsahu
 */


const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Konfigurácia
const config = {
    language: "slovenčina",
    maxContentChars: 2500,
    mainSectionsCount: 2,
    finalTestQuestions: 6
};

/**
 * Fallback obsah ak Gemini API zlyhá
 */
function generateFallbackContent(topicData, testResults) {
    const incorrectAnswers = testResults.detailedAnswers.filter(a => !a.wasCorrect);

    const sections = incorrectAnswers.length > 0
        ? incorrectAnswers.slice(0, 3).map((a, i) => ({
            type: 'topic',
            heading: a.questionText,
            content: `**Správna odpoveď:** ${a.correctOption}\n\n${topicData.description}`,
            order: i + 1
        }))
        : [{
            type: 'topic',
            heading: topicData.title,
            content: topicData.longDescription || topicData.description,
            order: 1
        }];

    return {
        sections,
        totalDuration: sections.length * 2,
        keyTakeaways: sections.map(s => s.heading)
    };
}

/**
 * Fallback test ak Gemini API zlyhá
 */
function generateFallbackTest(topicData, learningContent) {
    return {
        description: `Záverečný test na tému ${topicData.title}`,
        questions: [
            {
                question: `Čo je hlavný princíp témy "${topicData.title}"?`,
                options: ["Základný koncept A", "Základný koncept B", "Základný koncept C", "Základný koncept D"],
                correctOption: "Základný koncept A",
                explainsWeakness: "Overenie pochopenia základov"
            },
            {
                question: `Ktoré tvrdenie o téme "${topicData.title}" je správne?`,
                options: ["Tvrdenie 1", "Tvrdenie 2", "Tvrdenie 3", "Tvrdenie 4"],
                correctOption: "Tvrdenie 1",
                explainsWeakness: "Overenie faktických znalostí"
            }
        ]
    };
}

/**
 * 1. GENEROVANIE UČEBNÝCH MATERIÁLOV (bez testu)
 */
export async function generateLearningContent(topicData, testResults) {
    console.log('🤖 Generujem UČEBNÉ MATERIÁLY...');
    console.log(`   Téma: ${topicData.title}`);
    console.log(`   Skóre: ${testResults.score}%`);

    const prompt = buildLearningPrompt(topicData, testResults);
    
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`   Pokus ${attempt}/${maxRetries}...`);
            
            const content = await callGeminiAPI(prompt, 'learning');
            const parsed = parseLearningResponse(content);
            
            console.log(`✅ Učebné materiály vygenerované: ${parsed.sections.length} sekcií`);
            return parsed;
            
        } catch (error) {
            lastError = error;
            console.error(`❌ Pokus ${attempt} zlyhal:`, error.message);
            
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    
    console.log('🔄 Používam fallback učebné materiály...');
    return generateFallbackContent(topicData, testResults);
}

/**
 * 2. GENEROVANIE ZÁVEREČNÉHO TESTU (na základe učiva)
 */
export async function generateFinalTest(topicData, learningContent, originalTestResults) {
    console.log('🤖 Generujem ZÁVEREČNÝ TEST...');
    console.log(`   Téma: ${topicData.title}`);

    const prompt = buildTestPrompt(topicData, learningContent, originalTestResults);
    
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`   Pokus ${attempt}/${maxRetries}...`);
            
            const content = await callGeminiAPI(prompt, 'test');
            const parsed = parseTestResponse(content);
            
            console.log(`✅ Záverečný test vygenerovaný: ${parsed.questions.length} otázok`);
            return parsed;
            
        } catch (error) {
            lastError = error;
            console.error(`❌ Pokus ${attempt} zlyhal:`, error.message);
            
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    
    console.log('🔄 Používam fallback test...');
    return generateFallbackTest(topicData, learningContent);
}

/**
 * PROMPT pre učebné materiály
 */
function buildLearningPrompt(topicData, testResults) {
    const weaknesses = testResults.detailedAnswers
        .filter(a => !a.wasCorrect)
        .map(a => `- "${a.questionText}" (správna odpoveď: "${a.correctOption}")`);

    const weaknessesText = weaknesses.length > 0
        ? weaknesses.join('\n')
        : '- Používateľ odpovedal správne na všetky otázky — zosumarizuj kľúčové pojmy témy.';

    return `
ÚLOHA: Vytvor učebné materiály zamerané VÝHRADNE na slabé miesta používateľa.

TÉMA: ${topicData.title}
ÚROVEŇ: ${topicData.difficulty}

SLABÉ MIESTA (čo nevedel):
${weaknessesText}

POŽIADAVKY:
- Jazyk: ${config.language}
- Celková dĺžka textu: 250–450 slov (polovica až jedna A4)
- Rozdeľ obsah do 2–4 tematických sekcií podľa pojmov z chýb
- Každá sekcia = jeden konkrétny pojem alebo téma
- BEZ akéhokoľvek úvodu, pozdravu alebo privítania
- BEZ záverečného zhrnutia
- Začni PRIAMO prvou sekciou
- Používaj príklady z reálneho života
- Použi markdown: tučné písmo pre kľúčové pojmy, odrážky pre zoznamy

VÝSTUP - STRICT JSON:
{
  "sections": [
    {
      "heading": "Názov pojmu alebo témy",
      "content": "Vysvetlenie s príkladmi (60–120 slov)"
    }
  ]
}

PRAVIDLÁ:
1. 2 až 4 sections, každá o inej téme
2. Žiadny text mimo JSON
3. Validný JSON
4. Escape uvodzovky ako \\"

VYTVOR JSON:`;
}

/**
 * PROMPT pre záverečný test
 */
function buildTestPrompt(topicData, learningContent, originalTestResults) {
    // Extrahuj obsah z učebných materiálov
    const contentSummary = learningContent.sections
        .map(s => s.content)
        .join('\n\n');
    
    const keyPoints = learningContent.keyTakeaways?.join(', ') || '';
    
    // Slabé miesta z pôvodného testu
    const weaknesses = originalTestResults.detailedAnswers
        .filter(a => !a.wasCorrect)
        .map(a => a.questionText);

    return `
ÚLOHA: Vytvor záverečný test na overenie znalostí z práve preštudovaného učiva.

TÉMA: ${topicData.title}

UČIVO KTORÉ POUŽÍVATEĽ PRÁVE PREŠTUDOVAL:
${contentSummary}

KĽÚČOVÉ BODY Z UČIVA:
${keyPoints}

PÔVODNÉ SLABÉ MIESTA (otázky kde používateľ chybil):
${weaknesses.length > 0 ? weaknesses.map(w => `- ${w}`).join('\n') : 'Žiadne chyby'}

POŽIADAVKY NA TEST:
- Jazyk: ${config.language}
- Otázky MUSIA vychádzať z učiva vyššie
- Otázky testujú pochopenie, nie memorovanie
- Každá otázka má 4 možnosti (A, B, C, D)
- Práve jedna odpoveď je správna
- Otázky musia byť INÉ ako v pôvodnom vstupnom teste

VÝSTUP - STRICT JSON:
{
  "description": "Krátky popis testu",
  "questions": [
    {
      "question": "Text otázky",
      "options": ["Možnosť A", "Možnosť B", "Možnosť C", "Možnosť D"],
      "correctOption": "Možnosť A",
      "explainsWeakness": "Ktorú časť učiva otázka testuje"
    }
  ]
}

PRAVIDLÁ:
1. Presne ${config.finalTestQuestions} otázok
2. Žiadny text mimo JSON
3. Validný JSON
4. correctOption musí byť PRESNE jeden z options

VYTVOR JSON:`;
}

/**
 * Volanie Gemini API
 */
async function callGeminiAPI(prompt, type = 'learning') {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY nie je nastavený');
    }

    const url = `${GEMINI_API_URL}?key=${apiKey}`;
    
    // Rôzne schémy pre rôzne typy
    const schema = type === 'test' ? getTestSchema() : getLearningSchema();
    
    const requestBody = {
        contents: [{
            parts: [{ text: prompt }]
        }],
        generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
            responseSchema: schema,
            thinkingConfig: { thinkingBudget: 0 }
        }
    };

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout po 25 sekundách')), 25000)
    );

    const fetchPromise = fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();

    const candidate = data.candidates?.[0];
    if (!candidate) {
        throw new Error('Gemini API: žiadne candidates v odpovedi');
    }
    if (candidate.finishReason === 'MAX_TOKENS') {
        throw new Error('Gemini API: prekročený limit tokenov (MAX_TOKENS)');
    }
    const text = candidate.content?.parts?.[0]?.text;
    if (!text) {
        throw new Error(`Gemini API: prázdna odpoveď (finishReason: ${candidate.finishReason})`);
    }

    return text;
}

/**
 * JSON Schema pre učebné materiály
 */
function getLearningSchema() {
    return {
        type: "object",
        properties: {
            sections: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        heading: { type: "string" },
                        content: { type: "string" }
                    },
                    required: ["heading", "content"]
                }
            }
        },
        required: ["sections"]
    };
}

/**
 * JSON Schema pre test
 */
function getTestSchema() {
    return {
        type: "object",
        properties: {
            description: { type: "string" },
            questions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        question: { type: "string" },
                        options: {
                            type: "array",
                            items: { type: "string" }
                        },
                        correctOption: { type: "string" },
                        explainsWeakness: { type: "string" }
                    },
                    required: ["question", "options", "correctOption"]
                }
            }
        },
        required: ["description", "questions"]
    };
}

/**
 * Parsovanie odpovede - učebné materiály
 */
function parseLearningResponse(responseText) {
    const cleanedText = sanitizeJSON(responseText);
    const parsed = JSON.parse(cleanedText);

    if (!parsed.sections || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
        throw new Error('Neplatná štruktúra učebných materiálov');
    }

    const sections = parsed.sections.map((section, index) => ({
        type: 'topic',
        heading: section.heading,
        content: section.content,
        order: index + 1
    }));

    return {
        sections,
        totalDuration: sections.length * 2,
        keyTakeaways: sections.map(s => s.heading)
    };
}

/**
 * Parsovanie odpovede - test
 */
function parseTestResponse(responseText) {
    const cleanedText = sanitizeJSON(responseText);
    const parsed = JSON.parse(cleanedText);
    
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Neplatná štruktúra testu');
    }
    
    return {
        description: parsed.description || 'Záverečný test',
        questions: parsed.questions.map((q, i) => ({
            id: i + 1,
            question: q.question,
            options: q.options,
            correctOption: q.correctOption,
            explainsWeakness: q.explainsWeakness || ''
        }))
    };
}

/**
 * Sanitizácia JSON
 */
function sanitizeJSON(jsonString) {
    let sanitized = jsonString.replace(/^\uFEFF/, '').trim();
    
    // Odstránenie markdown wrapperu
    const jsonStartMatch = sanitized.match(/```(?:json)?\s*\n/);
    const jsonEndMatch = sanitized.match(/\n```\s*$/);
    
    if (jsonStartMatch) {
        sanitized = sanitized.substring(jsonStartMatch.index + jsonStartMatch[0].length);
    }
    if (jsonEndMatch) {
        sanitized = sanitized.substring(0, jsonEndMatch.index);
    }
    
    sanitized = sanitized.trim();
    
    // Fix trailing commas
    sanitized = sanitized.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix neukončené zátvorky
    const openBraces = (sanitized.match(/\{/g) || []).length;
    const closeBraces = (sanitized.match(/\}/g) || []).length;
    const openBrackets = (sanitized.match(/\[/g) || []).length;
    const closeBrackets = (sanitized.match(/\]/g) || []).length;
    
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
        sanitized += ']';
    }
    for (let i = 0; i < openBraces - closeBraces; i++) {
        sanitized += '}';
    }
    
    return sanitized;
}
