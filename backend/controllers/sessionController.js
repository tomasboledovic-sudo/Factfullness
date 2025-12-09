import { readFileSync, writeFileSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/sessions
 * Vytvorenie novej learning session
 */
export async function createSession(req, res, next) {
    try {
        const { topicId } = req.body;

        if (!topicId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'topicId je povinný',
                    details: { field: 'topicId' }
                }
            });
        }

        // Validácia, že téma existuje
        const topics = JSON.parse(readFileSync('./data/topics.json', 'utf8'));
        const topic = topics.find(t => t.id === topicId);

        if (!topic) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'TOPIC_NOT_FOUND',
                    message: 'Téma s daným ID neexistuje'
                }
            });
        }

        // Vytvorenie novej session
        const sessionId = uuidv4();
        const newSession = {
            id: sessionId,
            topicId,
            status: 'pre_assessment',
            createdAt: new Date().toISOString(),
            preTestScore: null,
            postTestScore: null,
            preTestAnswers: null,
            postTestAnswers: null,
            generatedContent: null,
            studyTimeSeconds: 0
        };

        // Uloženie do sessions.json
        const sessions = JSON.parse(readFileSync('./data/sessions.json', 'utf8'));
        sessions[sessionId] = newSession;
        writeFileSync('./data/sessions.json', JSON.stringify(sessions, null, 2));

        console.log(`✅ Vytvorená nová session: ${sessionId} pre tému: ${topic.title}`);

        res.status(201).json({
            success: true,
            data: {
                sessionId,
                topicId,
                status: 'pre_assessment',
                createdAt: newSession.createdAt
            }
        });

    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/sessions/:sessionId
 * Detail learning session
 */
export async function getSession(req, res, next) {
    try {
        const { sessionId } = req.params;

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

        res.json({
            success: true,
            data: session
        });

    } catch (error) {
        next(error);
    }
}

