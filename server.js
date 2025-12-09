const http = require('http');
const fs = require('fs');
const path = require('path');

// API kľúč priamo v kóde
const GEMINI_API_KEY = 'AIzaSyBcH1zsd8JZpqVuLbgDJ_3g-WLjt8nJ1yU';
const PORT = 8000;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Chyba pri načítaní súboru');
                return;
            }
            
            // Nahradíme placeholder API kľúčom
            const html = data.replace(/GEMINI_API_KEY_FROM_ENV/g, GEMINI_API_KEY);
            
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(html);
        });
    } else {
        res.writeHead(404);
        res.end('Stránka nenájdená');
    }
});

server.listen(PORT, () => {
    console.log(`Server beží na http://localhost:${PORT}`);
    console.log('API kľúč je nastavený priamo v kóde');
});

