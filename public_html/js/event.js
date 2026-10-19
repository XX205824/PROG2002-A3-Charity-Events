document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
    loadEventDetail();
});

async function loadEventDetail() {
    const container = document.getElementById('eventDetailContainer');
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('id');
    
    if (!eventId) {
        container.innerHTML = '<p style="text-align:center; padding:2rem; color:#c0392b;">Invalid event ID</p>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/events/${eventId}`);
        const result = await response.json();
        
        if (!result.success) {
            container.innerHTML = `<p style="text-align:center; padding:2rem; color:#c0392b;">${result.message || 'Failed to load event'}</p>`;
            return;
        }
        
        const event = result.data;
    event.ticket_price = Number(event.ticket_price) || 0;
    event.current_funds = Number(event.current_funds) || 0;
    event.fundraising_goal = Number(event.fundraising_goal) || 0;
        const progress = Math.min(100, Math.round((event.current_funds / event.fundraising_goal) * 100));
        
        container.innerHTML = `
            <div class="detail-img" style="background: linear-gradient(135deg, #667eea, #764ba2); display:flex; align-items:center; justify-content:center; color:white; font-size:5rem;">
                🎗️
            </div>
            <div class="detail-body">
                <span class="event-category">${event.category_name}</span>
                <h1>${event.event_name}</h1>
                <p style="color:#666; margin-bottom:1rem;">Hosted by ${event.org_name}</p>
                
                <div class="detail-info-grid">
                    <div class="info-item">
                        <h4>Date & Time</h4>
                        <p>${formatDate(event.event_date)}</p>
                    </div>
                    <div class="info-item">
                        <h4>Location</h4>
                        <p>${event.location}</p>
                    </div>
                    <div class="info-item">
                        <h4>Ticket Price</h4>
                        <p>${event.ticket_price > 0 ? '$' + event.ticket_price.toFixed(2) : 'Free Entry'}</p>
                    </div>
                    <div class="info-item">
                        <h4>Status</h4>
                        <p style="color: ${event.status === 'upcoming' ? '#27ae60' : '#f39c12'};">
                            ${event.status === 'upcoming' ? 'Upcoming' : 'Ongoing'}
                        </p>
                    </div>
                </div>
                
                <div class="fundraising-section">
                    <h3>Fundraising Progress</h3>
                    <div class="fundraising-numbers">
                        <span>Raised: $${event.current_funds.toFixed(2)}</span>
                        <span>Goal: $${event.fundraising_goal.toFixed(2)}</span>
                    </div>
                    <div class="progress-bar" style="height: 12px;">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <p style="text-align:right; margin-top:0.5rem; font-weight:600;">${progress}% Complete</p>
                </div>
                
                <h3 style="margin: 1.5rem 0 0.8rem; color:#2c3e50;">About This Event</h3>
                <p style="white-space: pre-line;">${event.full_desc}</p>
                
                <button class="btn btn-primary register-btn" onclick="goToRegistration(${event.event_id})">Register Now</button>
            </div>
        `;

        renderRegistrations(event.registrations);
        loadWeather(event.latitude, event.longitude);
        
    } catch (error) {
        console.error('Error loading event details:', error);
        container.innerHTML = '<p style="text-align:center; padding:2rem; color:#c0392b;">Connection error. Please ensure the API server is running.</p>';
    }
}

function renderRegistrations(registrations) {
    const listContainer = document.getElementById('registrationsList');
    
    if (!registrations || registrations.length === 0) {
        listContainer.innerHTML = '<p style="color:#666; text-align:center;">No registrations yet. Be the first to register!</p>';
        return;
    }

    listContainer.innerHTML = `
        <table style="width:100%; border-collapse:collapse;">
            <thead>
                <tr style="border-bottom:2px solid #eee;">
                    <th style="text-align:left; padding:0.8rem; color:#2c3e50;">Name</th>
                    <th style="text-align:left; padding:0.8rem; color:#2c3e50;">Email</th>
                    <th style="text-align:center; padding:0.8rem; color:#2c3e50;">Tickets</th>
                    <th style="text-align:right; padding:0.8rem; color:#2c3e50;">Registered On</th>
                </tr>
            </thead>
            <tbody>
                ${registrations.map(reg => `
                    <tr style="border-bottom:1px solid #f0f0f0;">
                        <td style="padding:0.8rem;">${reg.full_name}</td>
                        <td style="padding:0.8rem; color:#666;">${reg.email}</td>
                        <td style="padding:0.8rem; text-align:center;">${reg.ticket_count}</td>
                        <td style="padding:0.8rem; text-align:right; color:#666; font-size:0.9rem;">${formatDate(reg.registration_date)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Bonus: Open-Meteo Weather API
async function loadWeather(lat, lon) {
    if (!lat || !lon) return;
    
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Australia/Sydney`);
        const weather = await response.json();
        
        const weatherCodes = {
            0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
            45: 'Foggy', 48: 'Depositing rime fog',
            51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
            61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
            80: 'Rain showers', 81: 'Moderate showers', 82: 'Violent showers',
            95: 'Thunderstorm'
        };

        const code = weather.daily.weather_code[0];
        const maxTemp = weather.daily.temperature_2m_max[0];
        const minTemp = weather.daily.temperature_2m_min[0];

        document.getElementById('weatherCard').style.display = 'block';
        document.getElementById('weatherContent').innerHTML = `
            <p style="font-size:1.1rem; font-weight:600; margin-bottom:0.5rem;">${weatherCodes[code] || 'Unknown'}</p>
            <p>🌡️ High: ${maxTemp}°C / Low: ${minTemp}°C</p>
            <p style="font-size:0.85rem; color:#666; margin-top:0.5rem;">Forecast for event day</p>
        `;
    } catch (err) {
        console.log('Weather unavailable');
    }
}

function goToRegistration(eventId) {
    window.location.href = `registration.html?id=${eventId}`;
}