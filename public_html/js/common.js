// Global API base URL
const API_BASE = 'https://24832931.it.scu.edu.au/api';


function loadNavbar() {
    const navbarHTML = `
<nav class="navbar">
    <a href="index.html" class="logo">Hope Foundation</a>
    <ul class="nav-links">
        <li><a href="index.html" id="nav-home">Home</a></li>
        <li><a href="search.html" id="nav-search">Find Events</a></li>
    </ul>
</nav>
`;
    document.body.insertAdjacentHTML('afterbegin', navbarHTML);

 
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'index.html' || currentPage === '') {
        document.getElementById('nav-home').classList.add('active');
    } else if (currentPage === 'search.html') {
        document.getElementById('nav-search').classList.add('active');
    }
}
// Inject navigation bar on all pages
document.addEventListener('DOMContentLoaded', () => {
        loadNavbar();

    // Inject global modal
    const modalHTML = `
    <div class="modal" id="registerModal">
        <div class="modal-content">
            <h3>Notice</h3>
            <p>This feature is currently under construction.</p>
            <button class="btn btn-primary" style="margin-top: 1.5rem;" onclick="closeModal()">OK</button>
        </div>
    </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
});

// Modal controls
function showRegisterModal() {
    document.getElementById('registerModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('registerModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('registerModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Format date to readable string
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Calculate fundraising progress percentage
function getProgress(current, goal) {
    if (goal <= 0) return 0;
    return Math.min(100, Math.round((current / goal) * 100));
}