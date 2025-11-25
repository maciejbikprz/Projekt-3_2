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

    // log incoming request for debugging
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    if (req.method === 'GET' && pathname === '/api/stations') {
        fetchStations(res);
    } else if (req.method === 'GET' && pathname === '/api/locations') {
        fetchLocations(res);
    } else if (req.method === 'GET' && pathname === '/api/data') {
        // forward query params to NOAA /data endpoint
        fetchData(res, parsedUrl.query);
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

function fetchData(res, query) {
    const https = require('https');
    const qs = require('querystring');

    // whitelist params: datasetid, stationid, startdate, enddate, limit
    const allowed = {};
    if (query && query.datasetid) allowed.datasetid = query.datasetid;
    if (query && query.stationid) allowed.stationid = query.stationid;
    if (query && query.startdate) allowed.startdate = query.startdate;
    if (query && query.enddate) allowed.enddate = query.enddate;
    if (query && query.limit) allowed.limit = query.limit;

    // If dataset is GHCND require stationid and ignore locationid
    if (allowed.datasetid && String(allowed.datasetid).toUpperCase() === 'GHCND' && !allowed.stationid) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'For dataset GHCND you must provide stationid (e.g. GHCND:AE000041196)' }));
        return;
    }

    const q = qs.stringify(allowed || {});
    const path = '/cdo-web/api/v2/data' + (q ? `?${q}` : '');

    console.log('Proxy to NOAA path:', path);

    const options = {
        hostname: 'www.ncei.noaa.gov',
        path,
        headers: {
            'token': API_TOKEN
        }
    };

    https.get(options, (apiRes) => {
        let data = '';
        const statusCode = apiRes.statusCode;
        console.log('NOAA responded with status:', statusCode);

        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        apiRes.on('end', () => {
            // forward NOAA status code and body
            const contentType = apiRes.headers['content-type'] || 'application/json';
            res.writeHead(statusCode, { 'Content-Type': contentType });
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
