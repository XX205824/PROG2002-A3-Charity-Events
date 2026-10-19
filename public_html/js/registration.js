document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');
    
    if (!eventId) {
        document.getElementById('eventSummary').innerHTML = '<p style="color:#c0392b;">Invalid event ID</p>';
        return;
    }

    loadEventSummary(eventId);
    initRegistrationForm(eventId);
});

async function loadEventSummary(eventId) {
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`);
        const result = await response.json();
        
        if (!result.success) {
            document.getElementById('eventSummary').innerHTML = '<p style="color:#c0392b;">Event not found</p>';
            return;
        }

        const event = result.data;
            event.ticket_price = Number(event.ticket_price) || 0;
        document.getElementById('eventSummary').innerHTML = `
            <h3 style="color:#2c3e50; margin-bottom:0.8rem;">${event.event_name}</h3>
            <p style="color:#666; margin-bottom:0.5rem;">📍 ${event.location}</p>
            <p style="color:#666; margin-bottom:0.5rem;">🕒 ${formatDate(event.event_date)}</p>
            <p style="font-weight:600; color:#2980b9;">💰 Ticket Price: ${event.ticket_price > 0 ? '$' + event.ticket_price.toFixed(2) + ' per person' : 'Free Entry'}</p>
        `;
    } catch (error) {
        document.getElementById('eventSummary').innerHTML = '<p style="color:#c0392b;">Failed to load event details</p>';
    }
}

function initRegistrationForm(eventId) {
    const form = document.getElementById('regForm');
    const errorDiv = document.getElementById('formError');
    const successDiv = document.getElementById('formSuccess');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        const full_name = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const ticket_count = parseInt(document.getElementById('ticketCount').value);

        if (!full_name || !email) {
            showError('Please fill in all required fields.');
            return;
        }
        if (ticket_count < 1) {
            showError('You must book at least 1 ticket.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/events/${eventId}/registrations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name, email, phone, ticket_count })
            });

            const result = await response.json();

            if (!result.success) {
                showError(result.message || 'Registration failed. Please try again.');
                return;
            }

            form.style.display = 'none';
            successDiv.style.display = 'block';

        } catch (error) {
            showError('Connection error. Please try again later.');
        }
    });
}

function showError(message) {
    const errorDiv = document.getElementById('formError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}