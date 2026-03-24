import supabase from '../services/supabaseClient.js';

export async function getAllTopics(req, res, next) {
    try {
        const { data, error } = await supabase
            .from('topics')
            .select('*')
            .order('id');
        if (error) throw error;

        const topics = data.map(t => ({
            id: t.id, title: t.title, category: t.category,
            difficulty: t.difficulty, description: t.description,
            longDescription: t.long_description,
            estimatedDuration: t.estimated_duration,
            coverImage: t.cover_image
        }));

        res.json({ success: true, data: topics });
    } catch (error) {
        next(error);
    }
}

export async function getTopicById(req, res, next) {
    try {
        const { topicId } = req.params;
        const { data, error } = await supabase
            .from('topics')
            .select('*')
            .eq('id', parseInt(topicId))
            .maybeSingle();
        if (error) throw error;

        if (!data) {
            return res.status(404).json({ success: false, error: { code: 'TOPIC_NOT_FOUND', message: 'Téma s daným ID neexistuje' } });
        }

        res.json({ success: true, data: {
            id: data.id, title: data.title, category: data.category,
            difficulty: data.difficulty, description: data.description,
            longDescription: data.long_description,
            estimatedDuration: data.estimated_duration,
            coverImage: data.cover_image
        }});
    } catch (error) {
        next(error);
    }
}
