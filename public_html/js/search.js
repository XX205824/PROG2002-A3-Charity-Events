document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    loadCategories();
    initSearchForm();
    initClearButton();
});

// Load categories into dropdown
async function loadCategories() {
    const categorySelect = document.getElementById('category');
    try {
        const response = await fetch(`${API_BASE}/categories`);
        const result = await response.json();
        if (result.success) {
            result.data.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.category_id;
                option.textContent = cat.category_name;
                categorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load categories:', error);
    }
}

// Initialise search form submission
function initSearchForm() {
    const form = document.getElementById('searchForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const date = document.getElementById('date').value;
        const location = document.getElementById('location').value.trim();
        const category_id = document.getElementById('category').value;
        
        // Build query string
        const params = new URLSearchParams();
        if (date) params.append('date', date);
        if (location) params.append('location', location);
        if (category_id) params.append('category_id', category_id);
        
        await searchEvents(params.toString());
    });
}

// Execute search
async function searchEvents(queryString) {
    const container = document.getElementById('resultsContainer');
    const errorMsg = document.getElementById('errorMsg');
    
    // Hide previous error
    errorMsg.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE}/events/search?${queryString}`);
        const result = await response.json();
        
        if (!result.success) {
            showError('Search failed. Please try again later.');
            return;
        }
        
        if (result.count === 0) {
            showError('No events found matching your criteria. Try adjusting your filters.');
            container.innerHTML = '';
            return;
        }
        
        // Render results
        container.innerHTML = result.data.map(event => {
            return `
            <div class="event-card" onclick="goToDetail(${event.event_id})">
                <div class="event-card-img" style="background: linear-gradient(135deg, #11998e, #38ef7d); display:flex; align-items:center; justify-content:center; color:white; font-size:3rem;">
                    🎗️
                </div>
                <div class="event-card-body">
                    <span class="event-category">${event.category_name}</span>
                    <h3>${event.event_name}</h3>
                    <div class="event-meta">
                        <div>📍 ${event.location}</div>
                        <div>🕒 ${formatDate(event.event_date)}</div>
                        <div>💰 Ticket: $${Number(event.ticket_price).toFixed(2)}</div>
                    </div>
                </div>
            </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Search error:', error);
        showError('Connection error. Please ensure the API server is running.');
    }
}

// Display error message
function showError(message) {
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
}

// Clear filters button
function initClearButton() {
    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('searchForm').reset();
        document.getElementById('resultsContainer').innerHTML = '<p style="color:#666;">Select filters and click Search to find events</p>';
        document.getElementById('errorMsg').style.display = 'none';
    });
}

// Navigate to event detail page
function goToDetail(eventId) {
    window.location.href = `event.html?id=${eventId}`;
}