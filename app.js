// Globalne zmienne
let allData = [];
let currentDataType = 'stations';

// Elementy DOM
const loadStationsBtn = document.getElementById('loadStationsBtn');
const loadLocationsBtn = document.getElementById('loadLocationsBtn');
const searchInput = document.getElementById('searchInput');
const tableBody = document.getElementById('tableBody');
const tableHeader = document.getElementById('tableHeader');
const statusDiv = document.getElementById('status');

// Preset example buttons
const exampleBtn1 = document.getElementById('exampleBtn1');
const exampleBtn2 = document.getElementById('exampleBtn2');
const exampleBtn3 = document.getElementById('exampleBtn3');

// Preset queries
const examples = {
    1: { datasetid: 'GHCND', stationid: 'GHCND:AE000041196', startdate: '2020-01-01', enddate: '2020-01-31', limit: '1000' },
    2: { datasetid: 'GHCND', stationid: 'GHCND:AE000041196', startdate: '2020-02-01', enddate: '2020-02-29', limit: '1000' },
    3: { datasetid: 'GHCND', stationid: 'GHCND:AE000041196', startdate: '2020-03-01', enddate: '2020-03-31', limit: '1000' }
};

// Event listeners
loadStationsBtn.addEventListener('click', () => loadData('stations'));
loadLocationsBtn.addEventListener('click', () => loadData('locations'));
exampleBtn1 && exampleBtn1.addEventListener('click', () => loadDataWithParams(examples[1]));
exampleBtn2 && exampleBtn2.addEventListener('click', () => loadDataWithParams(examples[2]));
exampleBtn3 && exampleBtn3.addEventListener('click', () => loadDataWithParams(examples[3]));
searchInput.addEventListener('input', filterData);

async function loadData(type) {
    let btn = loadStationsBtn;
    if (type === 'locations') btn = loadLocationsBtn;
    btn && (btn.disabled = true);
    statusDiv.textContent = 'Ładowanie...';
    currentDataType = type;

    try {
        let endpoint = CONFIG.ENDPOINTS.STATIONS;
        if (type === 'locations') endpoint = CONFIG.ENDPOINTS.LOCATIONS;
        let url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        console.log('URL:', url);
        
        const response = await fetch(url, { method: 'GET' });

        console.log('Status odpowiedzi:', response.status);
        
        if (!response.ok) {
            throw new Error(`Blad: ${response.status}`);
        }

        const data = await response.json();
        console.log('Pobrane dane:', data);
        allData = data.results || [];
        displayData(allData, type);
        statusDiv.textContent = `Zaladowano ${allData.length} rekordow`;
    } catch (error) {
        console.error('Blad:', error);
        statusDiv.textContent = `Blad: ${error.message}`;
    }
    
    btn && (btn.disabled = false);
}

async function loadDataWithParams(params) {
    statusDiv.textContent = 'Ładowanie...';
    currentDataType = 'data';

    try {
        let url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.DATA}`;
        const qs = new URLSearchParams(params).toString();
        if (qs) url += `?${qs}`;
        
        console.log('URL:', url);
        
        const response = await fetch(url, { method: 'GET' });

        console.log('Status odpowiedzi:', response.status);
        
        if (!response.ok) {
            throw new Error(`Blad: ${response.status}`);
        }

        const data = await response.json();
        console.log('Pobrane dane:', data);
        allData = data.results || [];
        displayData(allData, 'data');
        statusDiv.textContent = `Zaladowano ${allData.length} rekordow`;
    } catch (error) {
        console.error('Blad:', error);
        statusDiv.textContent = `Blad: ${error.message}`;
    }
}

function displayData(data, type) {
    // Ustaw naglowek tabeli
    if (type === 'stations') {
        tableHeader.innerHTML = `
            <th>ID</th>
            <th>Nazwa</th>
            <th>Latitude</th>
            <th>Longitude</th>
        `;
        tableBody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.latitude.toFixed(4)}</td>
                <td>${item.longitude.toFixed(4)}</td>
            </tr>
        `).join('');
    } else if (type === 'locations') {
        tableHeader.innerHTML = `
            <th>ID</th>
            <th>Nazwa</th>
        `;
        tableBody.innerHTML = data.map(item => `
            <tr>
                <td>${item.id}</td>
                <td>${item.name}</td>
            </tr>
        `).join('');
    } else if (type === 'data') {
        tableHeader.innerHTML = `
            <th>Date</th>
            <th>Datatype</th>
            <th>Station</th>
            <th>Value</th>
        `;
        tableBody.innerHTML = data.map(item => `
            <tr>
                <td>${item.date || ''}</td>
                <td>${item.datatype || ''}</td>
                <td>${item.station || ''}</td>
                <td>${item.value !== undefined ? item.value : ''}</td>
            </tr>
        `).join('');
    }
}

function filterData() {
    const searchTerm = searchInput.value.toLowerCase();

    if (searchTerm === '') {
        displayData(allData, currentDataType);
        return;
    }

    const filtered = allData.filter(item => 
        item.id.toLowerCase().includes(searchTerm) || 
        item.name.toLowerCase().includes(searchTerm)
    );

    displayData(filtered, currentDataType);
    statusDiv.textContent = `Znaleziono ${filtered.length} rekordow`;
}
