import supabase from '../services/supabaseClient.js';

export async function getTopics() {
    const { data, error } = await supabase.from('topics').select('*').order('id');
    if (error) throw error;
    return data.map(t => ({
        id: t.id, title: t.title, category: t.category,
        difficulty: t.difficulty, description: t.description,
        longDescription: t.long_description,
        estimatedDuration: t.estimated_duration,
        coverImage: t.cover_image
    }));
}

export async function getTopicById(topicId) {
    const { data, error } = await supabase
        .from('topics').select('*').eq('id', topicId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
        id: data.id, title: data.title, category: data.category,
        difficulty: data.difficulty, description: data.description,
        longDescription: data.long_description,
        estimatedDuration: data.estimated_duration,
        coverImage: data.cover_image
    };
}

export async function getQuestionsByTopicId(topicId) {
    const { data, error } = await supabase
        .from('pre_test_questions')
        .select('*')
        .eq('topic_id', topicId)
        .order('order');
    if (error) throw error;
    return data.map(q => ({
        id: q.id, topicId: q.topic_id,
        questionText: q.question_text,
        questionType: q.question_type,
        options: q.options,
        correctAnswer: q.correct_answer,
        order: q.order
    }));
}
