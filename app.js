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

// Event listeners
loadStationsBtn.addEventListener('click', () => loadData('stations'));
loadLocationsBtn.addEventListener('click', () => loadData('locations'));
searchInput.addEventListener('input', filterData);

async function loadData(type) {
    const btn = type === 'stations' ? loadStationsBtn : loadLocationsBtn;
    btn.disabled = true;
    statusDiv.textContent = 'Ładowanie...';
    currentDataType = type;

    try {
        const endpoint = type === 'stations' ? CONFIG.ENDPOINTS.STATIONS : CONFIG.ENDPOINTS.LOCATIONS;
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        console.log('URL:', url);
        
        const response = await fetch(url, { method: 'GET' });

        console.log('Status odpowiedzi:', response.status);
        
        if (!response.ok) {
            throw new Error(`Blad: ${response.status}`);
        }

        const data = await response.json();
        console.log('Pobrane dane:', data);
        
        allData = data.results;
        displayData(allData, type);
        statusDiv.textContent = `Zaladowano ${allData.length} rekordow`;
    } catch (error) {
        console.error('Blad:', error);
        statusDiv.textContent = `Blad: ${error.message}`;
    }
    
    btn.disabled = false;
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
