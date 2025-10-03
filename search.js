// Search functionality for Monisa house plans
let allProjects = [];

// Load projects data
async function loadProjects() {
    try {
        const response = await fetch('data/projects.json');
        const data = await response.json();
        allProjects = data.projects;
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Initialize search functionality
function initSearch() {
    const searchBtn = document.querySelector('.icon-btn[title="Search"]');
    const searchModal = document.getElementById('searchModal');
    const closeSearchBtn = document.getElementById('closeSearch');
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const quickFilters = document.querySelectorAll('.quick-filter');

    if (!searchBtn || !searchModal) return;

    // Open search modal
    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchModal.classList.add('active');
        searchInput.focus();
        // Show all projects initially
        displaySearchResults(allProjects);
    });

    // Close search modal
    closeSearchBtn.addEventListener('click', () => {
        searchModal.classList.remove('active');
        searchInput.value = '';
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal.classList.contains('active')) {
            searchModal.classList.remove('active');
            searchInput.value = '';
        }
    });

    // Close on backdrop click
    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            searchModal.classList.remove('active');
            searchInput.value = '';
        }
    });

    // Search input handler
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        performSearch(query);
    });

    // Quick filter handlers
    quickFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Toggle active state
            filter.classList.toggle('active');
            
            // Get all active filters
            const activeFilters = Array.from(document.querySelectorAll('.quick-filter.active'));
            const filterData = activeFilters.map(f => ({
                type: f.dataset.filterType,
                value: f.dataset.filterValue
            }));

            // Apply filters
            applyFilters(filterData);
        });
    });
}

// Perform search
function performSearch(query) {
    if (!query) {
        displaySearchResults(allProjects);
        return;
    }

    const results = allProjects.filter(project => {
        const searchableText = `
            ${project.title} 
            ${project.subtitle || ''} 
            ${project.style} 
            ${project.type}
            ${project.bedrooms} bedroom
            ${project.id}
        `.toLowerCase();

        return searchableText.includes(query);
    });

    displaySearchResults(results);
}

// Apply filters
function applyFilters(filters) {
    if (filters.length === 0) {
        displaySearchResults(allProjects);
        return;
    }

    let filtered = allProjects;

    filters.forEach(filter => {
        if (filter.type === 'bedrooms') {
            filtered = filtered.filter(p => p.bedrooms === parseInt(filter.value));
        } else if (filter.type === 'style') {
            filtered = filtered.filter(p => p.style.toLowerCase() === filter.value.toLowerCase());
        } else if (filter.type === 'price') {
            const [min, max] = filter.value.split('-').map(v => parseFloat(v));
            if (max) {
                filtered = filtered.filter(p => p.priceFrom >= min && p.priceFrom <= max);
            } else {
                filtered = filtered.filter(p => p.priceFrom >= min);
            }
        } else if (filter.type === 'size') {
            filtered = filtered.filter(p => p.sizeBand === filter.value);
        }
    });

    displaySearchResults(filtered);
}

// Display search results
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    const resultsCount = document.getElementById('resultsCount');

    if (!searchResults) return;

    resultsCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;

    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <span class="material-symbols-rounded" style="font-size: 64px; color: #d1d5db;">search_off</span>
                <h3>No results found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    searchResults.innerHTML = results.map(project => `
        <div class="search-result-card" style="position: relative;">
            <button class="favorite-btn" data-project='${JSON.stringify(project)}'>
                <svg viewBox="0 0 24 24">
                    <path d="M12 21s-7-4.4-7-10a4.1 4.1 0 0 1 7-2.8A4.1 4.1 0 0 1 19 11c0 5.6-7 10-7 10Z" />
                </svg>
            </button>
            <a href="houseInfo.html?id=${project.id}" class="search-card-image">
                <img src="${project.images[0]}" alt="${project.title}">
                ${project.badge ? `<span class="search-badge">${project.badge}</span>` : ''}
            </a>
            <div class="search-card-content">
                <h4 class="search-card-title">${project.title}</h4>
                ${project.subtitle ? `<p class="search-card-subtitle">${project.subtitle}</p>` : ''}
                <div class="search-card-specs">
                    <span><span class="material-symbols-rounded">bed</span> ${project.bedrooms} bed</span>
                    <span><span class="material-symbols-rounded">bathtub</span> ${project.bathrooms} bath</span>
                    <span><span class="material-symbols-rounded">straighten</span> ${project.sizeSqm} m²</span>
                </div>
                <div class="search-card-footer">
                    <span class="search-card-price">From $${project.priceFrom.toFixed(2)}</span>
                    <span class="search-card-style">${project.style}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    // Re-initialize favorite buttons after rendering
    if (window.initializeFavoriteButtons) {
        window.initializeFavoriteButtons();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadProjects();
    initSearch();
});
