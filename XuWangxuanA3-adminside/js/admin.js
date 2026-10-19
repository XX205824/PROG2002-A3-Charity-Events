const API_BASE = 'http://localhost:3000/api';
let deleteEventId = null;

document.addEventListener('DOMContentLoaded', loadEvents);

async function loadEvents() {
    const container = document.getElementById('eventTableContainer');
    
    try {
        const response = await fetch(`${API_BASE}/admin/events`);
        const result = await response.json();
        
        if (!result.success) {
            container.innerHTML = '<p style="color:#c0392b;">Failed to load events</p>';
            return;
        }

        if (result.count === 0) {
            container.innerHTML = '<p style="text-align:center; padding:2rem; background:white; border-radius:10px;">No events found</p>';
            return;
        }

        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Event Name</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Registrations</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${result.data.map(event => `
                        <tr>
                            <td><strong>${event.event_name}</strong></td>
                            <td>${event.category_name}</td>
                            <td>${formatDate(event.event_date)}</td>
                            <td>${event.location}</td>
                            <td><span class="status-badge status-${event.status}">${event.status.charAt(0).toUpperCase() + event.status.slice(1)}</span></td>
                            <td style="text-align:center;">${event.registration_count}</td>
                            <td>
                                <div class="action-buttons">
                                    <a href="event-form.html?id=${event.event_id}" class="btn btn-primary">Edit</a>
                                    <button class="btn btn-danger" onclick="openDeleteModal(${event.event_id})">Delete</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

    } catch (error) {
        container.innerHTML = '<p style="color:#c0392b;">Connection error. Please ensure API server is running.</p>';
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function openDeleteModal(eventId) {
    deleteEventId = eventId;
    document.getElementById('deleteError').style.display = 'none';
    document.getElementById('deleteModal').style.display = 'flex';
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    deleteEventId = null;
}

async function confirmDelete() {
    if (!deleteEventId) return;
    
    const errorEl = document.getElementById('deleteError');
    errorEl.style.display = 'none';
    
    try {
        const response = await fetch(`${API_BASE}/events/${deleteEventId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (!result.success) {
            errorEl.textContent = result.message;
            errorEl.style.display = 'block';
            return;
        }

        closeDeleteModal();
        loadEvents(); // Refresh list

    } catch (error) {
        errorEl.textContent = 'Connection error. Please try again.';
        errorEl.style.display = 'block';
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('deleteModal');
    if (event.target === modal) {
        closeDeleteModal();
    }
}