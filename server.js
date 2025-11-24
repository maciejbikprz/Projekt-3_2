const http = require('http');
const url = require('url');
require('dotenv').config();

const API_TOKEN = process.env.NOAA_API_TOKEN;
const API_BASE_URL = 'https://www.ncei.noaa.gov/cdo-web/api/v2';

if (!API_TOKEN) {
    console.error('Blad: NOAA_API_TOKEN nie jest ustawiony w zmiennych srodowiskowych');
    process.exit(1);
}

const server = http.createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (req.method === 'GET' && pathname === '/api/stations') {
        fetchStations(res);
    } else if (req.method === 'GET' && pathname === '/api/locations') {
        fetchLocations(res);
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

function fetchStations(res) {
    const https = require('https');
    
    const options = {
        hostname: 'www.ncei.noaa.gov',
        path: '/cdo-web/api/v2/stations',
        headers: {
            'token': API_TOKEN
        }
    };

    https.get(options, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    }).on('error', (error) => {
        console.error('Blad:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
    });
}

function fetchLocations(res) {
    const https = require('https');
    
    const options = {
        hostname: 'www.ncei.noaa.gov',
        path: '/cdo-web/api/v2/locations',
        headers: {
            'token': API_TOKEN
        }
    };

    https.get(options, (apiRes) => {
        let data = '';

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    }).on('error', (error) => {
        console.error('Blad:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: error.message }));
    });
}

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Serwer uruchomiony na http://localhost:${PORT}`);
    console.log(`Otwórz http://localhost:3000/index.html`);
});
