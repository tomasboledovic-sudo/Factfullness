import { readFileSync } from 'fs';

/**
 * GET /api/sessions/:sessionId/content
 * Načítanie AI vygenerovaného učebného obsahu
 */
export async function getContent(req, res, next) {
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

        // Kontrola, či bol obsah vygenerovaný
        if (!session.generatedContent) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CONTENT_NOT_GENERATED',
                    message: 'Učebný obsah ešte nebol vygenerovaný. Dokončite najprv vstupný test.'
                }
            });
        }

        // Načítanie témy
        const topics = JSON.parse(readFileSync('./data/topics.json', 'utf8'));
        const topic = topics.find(t => t.id === session.topicId);

        res.json({
            success: true,
            data: {
                sessionId,
                topicId: session.topicId,
                topicTitle: topic?.title || 'Neznáma téma',
                preTestScore: session.preTestScore || 0,
                totalEstimatedMinutes: session.generatedContent.totalDuration,
                sections: session.generatedContent.sections,
                generatedAt: session.contentGeneratedAt
            }
        });

    } catch (error) {
        next(error);
    }
}

