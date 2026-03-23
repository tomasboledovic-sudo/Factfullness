import { createClient } from '@supabase/supabase-js';

let _client = null;

function getClient() {
    if (!_client) {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_ANON_KEY;
        if (!url || !key) throw new Error('SUPABASE_URL alebo SUPABASE_ANON_KEY nie sú nastavené');
        _client = createClient(url, key);
    }
    return _client;
}

const supabase = new Proxy({}, {
    get(_, prop) {
        return getClient()[prop];
    }
});

export default supabase;
