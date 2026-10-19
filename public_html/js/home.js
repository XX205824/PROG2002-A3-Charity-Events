document.addEventListener('DOMContentLoaded', loadHomeEvents);

async function loadHomeEvents() {
    const container = document.getElementById('eventsContainer');
    
    try {
        const response = await fetch(`${API_BASE}/events/home`);
        const result = await response.json();
        
        if (!result.success) {
            container.innerHTML = '<p style="text-align:center; color:#666;">Failed to load events. Please try again later.</p>';
            return;
        }
        
        if (result.count === 0) {
            container.innerHTML = '<p style="text-align:center; color:#666;">No upcoming events at the moment.</p>';
            return;
        }
        
        // Render event cards
        container.innerHTML = result.data.map(event => {
            const progress = getProgress(event.current_funds, event.fundraising_goal);
            return `
            <div class="event-card" onclick="goToDetail(${event.event_id})">
                <div class="event-card-img" style="background: linear-gradient(135deg, #667eea, #764ba2); display:flex; align-items:center; justify-content:center; color:white; font-size:3rem;">
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
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <p style="font-size:0.85rem; color:#666; margin-top:0.5rem;">Fundraising: ${progress}% complete</p>
                </div>
            </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading events:', error);
        container.innerHTML = '<p style="text-align:center; color:#c0392b;">Connection error. Please ensure the API server is running.</p>';
    }
}

// Navigate to event detail page
function goToDetail(eventId) {
    window.location.href = `event.html?id=${eventId}`;
}