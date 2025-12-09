import { readFileSync, writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { generateLearningContent } from '../services/geminiService.js';

/**
 * POST /api/sessions/:sessionId/pre-test/submit
 * Odoslanie odpovedí vstupného testu + generovanie obsahu cez Gemini API
 */
export async function submitPreTest(req, res, next) {
    try {
        const { sessionId } = req.params;
        const { answers, timeSpentSeconds } = req.body;

        console.log(`📝 Spracovávam vstupný test pre session: ${sessionId}`);
        console.log(`   Počet odpovedí: ${answers.length}`);
        console.log(`   Čas: ${timeSpentSeconds}s`);

        // 1. Validácia vstupu
        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'Odpovede musia byť neprázdne pole',
                    details: { field: 'answers' }
                }
            });
        }

        // 2. Načítanie session
        const sessions = JSON.parse(readFileSync('./data/sessions.json', 'utf8'));
        const session = sessions[sessionId];

        if (!session) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'SESSION_NOT_FOUND',
                    message: 'Session s daným ID neexistuje'
                }
            });
        }

        // 3. Kontrola statusu
        if (session.status !== 'pre_assessment') {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'INVALID_SESSION_STATUS',
                    message: 'Session nie je v správnom stave',
                    details: {
                        currentStatus: session.status,
                        expectedStatus: 'pre_assessment'
                    }
                }
            });
        }

        // 4. Načítanie otázok a správnych odpovedí
        const allQuestions = JSON.parse(readFileSync('./data/preTestQuestions.json', 'utf8'));
        const questions = allQuestions[session.topicId.toString()];

        if (!questions) {
            throw new Error('Otázky pre túto tému neboli nájdené');
        }

        // 5. Vyhodnotenie odpovedí
        const evaluatedAnswers = answers.map(answer => {
            const question = questions.find(q => q.id === answer.questionId);
            
            if (!question) {
                throw new Error(`Otázka ${answer.questionId} neexistuje`);
            }

            const isCorrect = answer.selectedOptionIndex === question.correctAnswer;

            return {
                questionId: answer.questionId,
                questionText: question.questionText,
                userSelectedOption: question.options[answer.selectedOptionIndex],
                correctOption: question.options[question.correctAnswer],
                selectedOptionIndex: answer.selectedOptionIndex,
                correctAnswerIndex: question.correctAnswer,
                wasCorrect: isCorrect,
                answeredAt: answer.answeredAt
            };
        });

        // 6. Výpočet skóre
        const correctCount = evaluatedAnswers.filter(a => a.wasCorrect).length;
        const totalCount = evaluatedAnswers.length;
        const percentage = Math.round((correctCount / totalCount) * 100 * 10) / 10;

        const preTestScore = {
            percentage,
            correctAnswers: correctCount,
            totalQuestions: totalCount,
            incorrectAnswers: totalCount - correctCount
        };

        console.log(`✅ Skóre: ${percentage}% (${correctCount}/${totalCount})`);

        // 7. Uloženie odpovedí do session
        session.preTestAnswers = evaluatedAnswers;
        session.preTestScore = percentage;
        session.status = 'generating_content';
        session.preTestCompletedAt = new Date().toISOString();
        session.preTestTimeSeconds = timeSpentSeconds;

        // Uloženie session (pred Gemini volaním)
        sessions[sessionId] = session;
        writeFileSync('./data/sessions.json', JSON.stringify(sessions, null, 2));

        // 8. Príprava dát pre Gemini API
        const topics = JSON.parse(readFileSync('./data/topics.json', 'utf8'));
        const topic = topics.find(t => t.id === session.topicId);

        if (!topic) {
            throw new Error('Téma nebola nájdená');
        }

        const testResults = {
            score: percentage,
            totalQuestions: totalCount,
            correctAnswers: correctCount,
            detailedAnswers: evaluatedAnswers
        };

        // 9. 🤖 VOLANIE GEMINI API (jediné volanie!)
        console.log('🤖 Volám Gemini API na generovanie obsahu...');
        
        let generatedContent;
        try {
            generatedContent = await generateLearningContent(topic, testResults);
        } catch (geminiError) {
            console.error('❌ Gemini API zlyhalo:', geminiError);
            
            // Rollback session status
            session.status = 'pre_assessment';
            sessions[sessionId] = session;
            writeFileSync('./data/sessions.json', JSON.stringify(sessions, null, 2));

            return res.status(500).json({
                success: false,
                error: {
                    code: 'CONTENT_GENERATION_FAILED',
                    message: 'Nepodarilo sa vygenerovať učebný materiál. Skúste to neskôr.',
                    details: geminiError.message
                }
            });
        }

        // 10. Uloženie vygenerovaného obsahu do session
        session.generatedContent = generatedContent;
        session.status = 'learning';
        session.contentGeneratedAt = new Date().toISOString();

        // Uloženie finálneho stavu
        sessions[sessionId] = session;
        writeFileSync('./data/sessions.json', JSON.stringify(sessions, null, 2));

        console.log('✅ Obsah úspešne vygenerovaný a uložený');

        // 11. Response
        res.json({
            success: true,
            data: {
                sessionId,
                preTestScore,
                detailedResults: evaluatedAnswers,
                contentGenerated: true,
                status: 'learning',
                message: 'Učebný materiál bol úspešne vygenerovaný'
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/sessions/:sessionId/pre-test
 * Načítanie otázok vstupného testu
 */
export async function getPreTest(req, res, next) {
    try {
        const { sessionId } = req.params;

        // Načítanie session
        const sessions = JSON.parse(readFileSync('./data/sessions.json', 'utf8'));
        const session = sessions[sessionId];

        if (!session) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'SESSION_NOT_FOUND',
                    message: 'Session s daným ID neexistuje'
                }
            });
        }

        // Načítanie otázok (BEZ správnych odpovedí!)
        const allQuestions = JSON.parse(readFileSync('./data/preTestQuestions.json', 'utf8'));
        const questions = allQuestions[session.topicId.toString()];

        if (!questions) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'QUESTIONS_NOT_FOUND',
                    message: 'Otázky pre túto tému neboli nájdené'
                }
            });
        }

        // Načítanie témy
        const topics = JSON.parse(readFileSync('./data/topics.json', 'utf8'));
        const topic = topics.find(t => t.id === session.topicId);

        // Odstránenie správnych odpovedí (bezpečnosť)
        const questionsWithoutAnswers = questions.map(q => ({
            id: q.id,
            questionNumber: q.order,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options
            // correctAnswer NIE JE ZAHRNUTÉ!
        }));

        res.json({
            success: true,
            data: {
                sessionId,
                topicId: session.topicId,
                topicTitle: topic?.title || 'Neznáma téma',
                totalQuestions: questions.length,
                questions: questionsWithoutAnswers
            }
        });

    } catch (error) {
        next(error);
    }
}

