// Globalne zmienne
let allStations = [];

// Elementy DOM
const loadStationsBtn = document.getElementById('loadStationsBtn');
const searchInput = document.getElementById('searchInput');
const stationsBody = document.getElementById('stationsBody');
const statusDiv = document.getElementById('status');

// Event listeners
loadStationsBtn.addEventListener('click', loadStations);
searchInput.addEventListener('input', filterStations);

async function loadStations() {
    loadStationsBtn.disabled = true;
    statusDiv.textContent = 'Ładowanie...';

    try {
        console.log('Wysyłam zapytanie...');
        
        const url = `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.STATIONS}`;
        
        console.log('URL:', url);
        
        const response = await fetch(url, {
            method: 'GET'
        });

        console.log('Status odpowiedzi:', response.status);
        
        if (!response.ok) {
            throw new Error(`Błąd: ${response.status}`);
        }

        const data = await response.json();
        console.log('Pobrane dane:', data);
        
        allStations = data.results;
        displayStations(allStations);
        statusDiv.textContent = `Załadowano ${allStations.length} stacji`;
    } catch (error) {
        console.error('Błąd:', error);
        statusDiv.textContent = `Błąd: ${error.message}`;
    }
    
    loadStationsBtn.disabled = false;
}

function displayStations(stations) {
    stationsBody.innerHTML = stations.map(station => `
        <tr>
            <td>${station.id}</td>
            <td>${station.name}</td>
            <td>${station.latitude.toFixed(4)}</td>
            <td>${station.longitude.toFixed(4)}</td>
        </tr>
    `).join('');
}

function filterStations() {
    const searchTerm = searchInput.value.toLowerCase();

    if (searchTerm === '') {
        displayStations(allStations);
        return;
    }

    const filtered = allStations.filter(station => 
        station.id.toLowerCase().includes(searchTerm) || 
        station.name.toLowerCase().includes(searchTerm)
    );

    displayStations(filtered);
    statusDiv.textContent = `Znaleziono ${filtered.length} stacji`;
}
