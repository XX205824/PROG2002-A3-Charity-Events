const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');
    
    if (eventId) {
        document.getElementById('formTitle').textContent = 'Edit Event';
        loadEventData(eventId);
    }

    initForm(eventId);
});

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        const result = await response.json();
        const select = document.getElementById('categorySelect');
        
        result.data.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.category_id;
            option.textContent = cat.category_name;
            select.appendChild(option);
        });
    } catch (err) {
        console.error('Failed to load categories');
    }
}

async function loadEventData(eventId) {
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`);
        const result = await response.json();
        
        if (!result.success) return;
        
        const event = result.data;
        const form = document.getElementById('eventForm');
        
        form.elements['event_name'].value = event.event_name;
        form.elements['category_id'].value = event.category_id;
        form.elements['event_date'].value = event.event_date.slice(0, 16);
        form.elements['location'].value = event.location;
        form.elements['latitude'].value = event.latitude;
        form.elements['longitude'].value = event.longitude;
        form.elements['short_desc'].value = event.short_desc;
        form.elements['full_desc'].value = event.full_desc || '';
        form.elements['ticket_price'].value = event.ticket_price;
        form.elements['fundraising_goal'].value = event.fundraising_goal;
        form.elements['current_funds'].value = event.current_funds;
        form.elements['status'].value = event.status;
        
    } catch (err) {
        console.error('Failed to load event');
    }
}

function initForm(eventId) {
    const form = document.getElementById('eventForm');
    const errorEl = document.getElementById('formError');
    const successEl = document.getElementById('formSuccess');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.style.display = 'none';
        successEl.style.display = 'none';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        data.category_id = parseInt(data.category_id);
        data.org_id = 1;
        data.ticket_price = parseFloat(data.ticket_price) || 0;
        data.fundraising_goal = parseFloat(data.fundraising_goal);
        data.current_funds = parseFloat(data.current_funds) || 0;
        data.latitude = parseFloat(data.latitude);
        data.longitude = parseFloat(data.longitude);

        try {
            let response;
            
            if (eventId) {
                // Update existing event
                response = await fetch(`${API_BASE}/events/${eventId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            } else {
                // Create new event
                response = await fetch(`${API_BASE}/events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
            }

            const result = await response.json();
            
            if (!result.success) {
                errorEl.textContent = result.message || 'Failed to save event';
                errorEl.style.display = 'block';
                return;
            }

            successEl.style.display = 'block';
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            errorEl.textContent = 'Connection error. Please try again.';
            errorEl.style.display = 'block';
        }
    });
}