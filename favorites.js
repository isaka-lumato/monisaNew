// Favorites Management System - No Backend Required
// Uses localStorage to persist favorites across sessions

const FAVORITES_KEY = 'monisa_favorites';

// Get all favorites from localStorage
function getFavorites() {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
}

// Save favorites to localStorage
function saveFavorites(favorites) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    updateFavoritesCount();
}

// Check if a project is favorited
function isFavorited(projectId) {
    const favorites = getFavorites();
    return favorites.some(fav => fav.id === projectId);
}

// Add project to favorites
function addToFavorites(project) {
    const favorites = getFavorites();
    
    // Check if already favorited
    if (isFavorited(project.id)) {
        return false;
    }
    
    favorites.push(project);
    saveFavorites(favorites);
    
    // Show toast notification
    showToast('Added to favorites!', 'success');
    return true;
}

// Remove project from favorites
function removeFromFavorites(projectId) {
    let favorites = getFavorites();
    favorites = favorites.filter(fav => fav.id !== projectId);
    saveFavorites(favorites);
    
    // Show toast notification
    showToast('Removed from favorites', 'info');
    return true;
}

// Toggle favorite status
function toggleFavorite(project) {
    if (isFavorited(project.id)) {
        removeFromFavorites(project.id);
        return false;
    } else {
        addToFavorites(project);
        return true;
    }
}

// Update favorites count in navigation
function updateFavoritesCount() {
    const favorites = getFavorites();
    const count = favorites.length;
    const badge = document.getElementById('favoritesCount');
    
    if (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <span class="material-symbols-rounded">${type === 'success' ? 'check_circle' : 'info'}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize favorite buttons on page load
function initializeFavoriteButtons() {
    // Update count on page load
    updateFavoritesCount();
    
    // Add click handlers to all favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const projectData = btn.dataset.project;
        
        if (projectData) {
            try {
                const project = JSON.parse(projectData);
                
                // Set initial state
                if (isFavorited(project.id)) {
                    btn.classList.add('favorited');
                }
                
                // Add click handler
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const isFav = toggleFavorite(project);
                    
                    if (isFav) {
                        btn.classList.add('favorited');
                    } else {
                        btn.classList.remove('favorited');
                    }
                });
            } catch (error) {
                console.error('Error parsing project data:', error);
            }
        }
    });
}

// Open favorites popup
function openFavoritesPopup() {
    const popup = document.getElementById('favoritesPopup');
    if (popup) {
        popup.classList.add('active');
        renderFavoritesPopup();
    }
}

// Close favorites popup
function closeFavoritesPopup() {
    const popup = document.getElementById('favoritesPopup');
    if (popup) {
        popup.classList.remove('active');
    }
}

// Render favorites in popup
function renderFavoritesPopup() {
    const favorites = getFavorites();
    const grid = document.getElementById('favoritesPopupGrid');
    const emptyState = document.getElementById('favoritesPopupEmpty');
    const countText = document.getElementById('favoritesPopupCount');

    if (!grid) return;

    // Update count
    countText.textContent = `${favorites.length} saved plan${favorites.length !== 1 ? 's' : ''}`;

    if (favorites.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
    } else {
        grid.style.display = 'grid';
        emptyState.style.display = 'none';

        // Render cards
        grid.innerHTML = favorites.map(project => `
            <div class="favorite-popup-card">
                <button class="favorite-btn favorited" data-project='${JSON.stringify(project)}'>
                    <svg viewBox="0 0 24 24">
                        <path d="M12 21s-7-4.4-7-10a4.1 4.1 0 0 1 7-2.8A4.1 4.1 0 0 1 19 11c0 5.6-7 10-7 10Z" />
                    </svg>
                </button>
                <a href="houseInfo.html?id=${project.id}" class="favorite-popup-image">
                    <img src="${project.images[0]}" alt="${project.title}">
                </a>
                <div class="favorite-popup-content">
                    <h4 class="favorite-popup-title">${project.title}</h4>
                    <div class="favorite-popup-specs">
                        <span><span class="material-symbols-rounded">bed</span> ${project.bedrooms}</span>
                        <span><span class="material-symbols-rounded">bathtub</span> ${project.bathrooms}</span>
                        <span><span class="material-symbols-rounded">straighten</span> ${project.sizeSqm}m²</span>
                    </div>
                    <div class="favorite-popup-footer">
                        <span class="favorite-popup-price">$${project.priceFrom.toFixed(2)}</span>
                        <a href="houseInfo.html?id=${project.id}" class="favorite-popup-view">View</a>
                    </div>
                </div>
            </div>
        `).join('');

        // Re-initialize favorite buttons
        initializeFavoriteButtons();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeFavoriteButtons();
    
    // Update favorites link in navigation to open popup
    const favoritesLink = document.querySelector('.icon-btn[title="Favorites"]');
    if (favoritesLink) {
        favoritesLink.href = '#';
        favoritesLink.addEventListener('click', (e) => {
            e.preventDefault();
            openFavoritesPopup();
        });
    }
    
    // Close popup handlers
    const closeBtn = document.getElementById('closeFavoritesPopup');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeFavoritesPopup);
    }
    
    const popup = document.getElementById('favoritesPopup');
    if (popup) {
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                closeFavoritesPopup();
            }
        });
    }
    
    // Clear all button in popup
    const clearAllBtn = document.getElementById('clearAllFavoritesBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to remove all favorites?')) {
                localStorage.removeItem('monisa_favorites');
                updateFavoritesCount();
                renderFavoritesPopup();
            }
        });
    }
});

// Export functions for use in other scripts
window.FavoritesManager = {
    getFavorites,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorited,
    updateFavoritesCount
};
