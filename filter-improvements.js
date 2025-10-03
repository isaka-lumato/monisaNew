// Enhanced Filter System with Loading States and Better UX
// This file contains improvements that can be integrated into index.js

// Add this CSS to styles.css for loading states
const loadingStyles = `
/* Loading spinner */
.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6d28d9;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

/* No results message */
.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.no-results-icon {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.no-results-title {
  font-size: 24px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 8px;
}

.no-results-text {
  font-size: 16px;
  margin-bottom: 24px;
}

.clear-filters-btn {
  background: #6d28d9;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.clear-filters-btn:hover {
  background: #5b21b6;
}

/* Active filter badges */
.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  font-size: 14px;
  color: #374151;
}

.filter-badge-remove {
  cursor: pointer;
  color: #6b7280;
  font-size: 16px;
  line-height: 1;
}

.filter-badge-remove:hover {
  color: #ef4444;
}

/* Results count */
.results-count {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}
`;

// Enhanced Filter Implementation
document.addEventListener('DOMContentLoaded', () => {
  const GRID_SELECTOR = '.bs-page-grid';
  const SIDEBAR_SELECTOR = '.bs-sidebar';
  const DATA_URL = 'data/projects.json';

  const grid = document.querySelector(GRID_SELECTOR);
  const sidebar = document.querySelector(SIDEBAR_SELECTOR);
  if (!grid || !sidebar) return;

  // State management
  let ALL_PROJECTS = [];
  let isLoading = false;
  let filterDebounceTimer = null;

  // Create UI elements
  const createLoadingSpinner = () => {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    return overlay;
  };

  const createNoResultsMessage = () => {
    const div = document.createElement('div');
    div.className = 'no-results';
    div.innerHTML = `
      <div class="no-results-icon">
        <span class="material-symbols-rounded">search_off</span>
      </div>
      <h3 class="no-results-title">No houses found</h3>
      <p class="no-results-text">Try adjusting your filters to see more results</p>
      <button class="clear-filters-btn">Clear all filters</button>
    `;
    return div;
  };

  const createActiveFiltersDisplay = (state) => {
    const container = document.createElement('div');
    container.className = 'active-filters';
    
    const badges = [];
    
    // Add type badges
    state.types.forEach(type => {
      badges.push({ label: type, category: 'type', value: type });
    });
    
    // Add bedroom badges
    state.bedrooms.forEach(bed => {
      const label = typeof bed === 'string' && bed.includes('+') 
        ? `${bed} Bedrooms` 
        : `${bed} Bedroom${bed !== 1 ? 's' : ''}`;
      badges.push({ label, category: 'bedrooms', value: bed });
    });
    
    // Add floor badges
    state.floors.forEach(floor => {
      const label = typeof floor === 'string' && floor.includes('+')
        ? `${floor} Floors`
        : `${floor} Floor${floor !== 1 ? 's' : ''}`;
      badges.push({ label, category: 'floors', value: floor });
    });
    
    // Add bathroom badges
    if (state.bathrooms) {
      state.bathrooms.forEach(bath => {
        const label = typeof bath === 'string' && bath.includes('+')
          ? `${bath} Bathrooms`
          : `${bath} Bathroom${bath !== 1 ? 's' : ''}`;
        badges.push({ label, category: 'bathrooms', value: bath });
      });
    }
    
    // Add style badges
    state.styles.forEach(style => {
      badges.push({ label: style, category: 'style', value: style });
    });
    
    // Add size badges
    state.sizeBands.forEach(size => {
      badges.push({ label: size, category: 'size', value: size });
    });
    
    // Add price badge
    if (state.priceRange) {
      badges.push({ label: state.priceRange, category: 'price', value: state.priceRange });
    }
    
    if (badges.length === 0) return null;
    
    container.innerHTML = badges.map(badge => `
      <span class="filter-badge" data-category="${badge.category}" data-value="${badge.value}">
        ${badge.label}
        <span class="filter-badge-remove" title="Remove filter">×</span>
      </span>
    `).join('');
    
    return container;
  };

  const createResultsCount = (count, total) => {
    const div = document.createElement('div');
    div.className = 'results-count';
    div.textContent = count === total 
      ? `Showing all ${total} house plans`
      : `Showing ${count} of ${total} house plans`;
    return div;
  };

  // Show loading state
  const showLoading = () => {
    if (isLoading) return;
    isLoading = true;
    const spinner = createLoadingSpinner();
    grid.style.position = 'relative';
    grid.appendChild(spinner);
  };

  // Hide loading state
  const hideLoading = () => {
    isLoading = false;
    const spinner = grid.querySelector('.loading-overlay');
    if (spinner) spinner.remove();
  };

  // Enhanced render with loading and empty states
  const renderGridEnhanced = (projects, state) => {
    hideLoading();
    
    // Clear existing content
    grid.innerHTML = '';
    
    // Add active filters display
    const activeFilters = createActiveFiltersDisplay(state);
    if (activeFilters) {
      grid.parentElement.insertBefore(activeFilters, grid);
      
      // Add click handlers for removing filters
      activeFilters.querySelectorAll('.filter-badge-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const badge = e.target.closest('.filter-badge');
          const category = badge.dataset.category;
          const value = badge.dataset.value;
          
          // Remove the filter from state and update
          removeFilter(category, value);
        });
      });
    } else {
      // Remove any existing active filters display
      const existing = grid.parentElement.querySelector('.active-filters');
      if (existing) existing.remove();
    }
    
    // Add results count
    const resultsCount = createResultsCount(projects.length, ALL_PROJECTS.length);
    const existingCount = grid.parentElement.querySelector('.results-count');
    if (existingCount) {
      existingCount.replaceWith(resultsCount);
    } else {
      grid.parentElement.insertBefore(resultsCount, grid);
    }
    
    // Handle empty state
    if (projects.length === 0) {
      const noResults = createNoResultsMessage();
      grid.appendChild(noResults);
      
      // Add clear filters handler
      const clearBtn = noResults.querySelector('.clear-filters-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', clearAllFilters);
      }
      return;
    }
    
    // Render projects
    const frag = document.createDocumentFragment();
    projects.forEach(p => {
      const wrap = document.createElement('div');
      wrap.innerHTML = cardHtml(p); // Use existing cardHtml function
      frag.appendChild(wrap.firstElementChild);
    });
    grid.appendChild(frag);
  };

  // Remove a specific filter
  const removeFilter = (category, value) => {
    const state = readSidebarState();
    
    switch(category) {
      case 'type':
        state.types.delete(value);
        break;
      case 'bedrooms':
        state.bedrooms.delete(value);
        break;
      case 'floors':
        state.floors.delete(value);
        break;
      case 'bathrooms':
        state.bathrooms.delete(value);
        break;
      case 'style':
        state.styles.delete(value);
        break;
      case 'size':
        state.sizeBands.delete(value);
        break;
      case 'price':
        state.priceRange = null;
        break;
    }
    
    applyStateToSidebar(state);
    syncUrl(state);
    renderGridEnhanced(ALL_PROJECTS.filter(p => passes(p, state)), state);
  };

  // Clear all filters
  const clearAllFilters = () => {
    const checkboxes = sidebar.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    
    const state = readSidebarState();
    syncUrl(state);
    renderGridEnhanced(ALL_PROJECTS, state);
  };

  // Debounced filter handler
  const handleFilterChange = () => {
    clearTimeout(filterDebounceTimer);
    filterDebounceTimer = setTimeout(() => {
      const state = readSidebarState();
      syncUrl(state);
      renderGridEnhanced(ALL_PROJECTS.filter(p => passes(p, state)), state);
    }, 300); // 300ms debounce
  };

  // Initialize enhanced filter system
  const initEnhanced = async () => {
    showLoading();
    
    try {
      const response = await fetch(DATA_URL);
      const json = await response.json();
      ALL_PROJECTS = Array.isArray(json.projects) ? json.projects : [];
      
      // Initial state from URL
      let state = readUrl();
      applyStateToSidebar(state);
      
      // First render
      renderGridEnhanced(ALL_PROJECTS.filter(p => passes(p, state)), state);
      
      // Listen for changes with debouncing
      sidebar.addEventListener('change', handleFilterChange);
      
    } catch (error) {
      hideLoading();
      grid.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">
            <span class="material-symbols-rounded">error</span>
          </div>
          <h3 class="no-results-title">Failed to load projects</h3>
          <p class="no-results-text">Please try refreshing the page</p>
        </div>
      `;
      console.error('Failed to load projects:', error);
    }
  };

  // Replace the existing initialization
  // Comment out or remove the existing fetch().then() chain in your index.js
  // and call initEnhanced() instead
  
  // Export functions for use in main file
  window.enhancedFilters = {
    init: initEnhanced,
    clearAll: clearAllFilters,
    showLoading,
    hideLoading
  };
});
