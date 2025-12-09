import { readFileSync } from 'fs';

/**
 * GET /api/topics
 * Zoznam všetkých tém
 */
export async function getAllTopics(req, res, next) {
    try {
        const topics = JSON.parse(readFileSync('./data/topics.json', 'utf8'));
        
        res.json({
            success: true,
            data: topics
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/topics/:topicId
 * Detail jednej témy
 */
export async function getTopicById(req, res, next) {
    try {
        const { topicId } = req.params;
        const topics = JSON.parse(readFileSync('./data/topics.json', 'utf8'));
        const topic = topics.find(t => t.id === parseInt(topicId));

        if (!topic) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'TOPIC_NOT_FOUND',
                    message: 'Téma s daným ID neexistuje'
                }
            });
        }

        res.json({
            success: true,
            data: topic
        });
    } catch (error) {
        next(error);
    }
}

