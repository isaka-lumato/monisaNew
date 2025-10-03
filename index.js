// Simple slider logic for the right-side dots
const images = [
  "src/images/placeholderImg2.jpg",
  "src/images/placeholderImg1.jpg",
  "src/images/placeholderImg2.jpg"
];
const bg = document.getElementById("heroBg");
const dots = document.querySelectorAll(".dot");
let current = 0;

function setSlide(i) {
  current = i;
  bg.src = images[i];
  dots.forEach(d => d.classList.toggle("active", +d.dataset.slide === i));
  dots.forEach(d => d.removeAttribute("aria-current"));
  dots[i].setAttribute("aria-current", "true");
}

dots.forEach(d => d.addEventListener("click", e => setSlide(+e.currentTarget.dataset.slide)));

// Auto-rotate every 6s (can be removed if not desired)
setInterval(() => setSlide((current + 1) % images.length), 6000);

// House Plans slider functionality
document.addEventListener('DOMContentLoaded', () => {
  const plansSlider = document.querySelector('.plans-slider');
  const prevButton = document.querySelector('.slider-prev');
  const nextButton = document.querySelector('.slider-next');

  if (plansSlider) {
    // Add keyboard navigation
    plansSlider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        plansSlider.scrollBy({ left: 550, behavior: 'smooth' });
      } else if (e.key === 'ArrowLeft') {
        plansSlider.scrollBy({ left: -550, behavior: 'smooth' });
      }
    });

    // Intentionally no mouse wheel scroll to avoid accidental horizontal movement

    // Add navigation button functionality
    if (prevButton && nextButton) {
      prevButton.addEventListener('click', () => {
        plansSlider.scrollBy({ left: -550, behavior: 'smooth' });
      });

      nextButton.addEventListener('click', () => {
        plansSlider.scrollBy({ left: 550, behavior: 'smooth' });
      });
    }
  }
});

// "You may also like" horizontal slider on houseInfo.html
document.addEventListener('DOMContentLoaded', () => {
  const relSlider = document.querySelector('.hi-rel-slider');
  const relPrev = document.querySelector('.hi-rel-prev');
  const relNext = document.querySelector('.hi-rel-next');

  if (!relSlider) return;

  const getStep = () => {
    const card = relSlider.querySelector('.hi-rel-card');
    if (!card) return 320;
    const style = getComputedStyle(relSlider);
    const gap = parseInt(style.columnGap || style.gap || '16', 10) || 16;
    return Math.ceil(card.getBoundingClientRect().width + gap);
  };

  if (relPrev) relPrev.addEventListener('click', () => {
    relSlider.scrollBy({ left: -getStep(), behavior: 'smooth' });
  });
  if (relNext) relNext.addEventListener('click', () => {
    relSlider.scrollBy({ left: getStep(), behavior: 'smooth' });
  });

  // Keyboard support when slider is focused
  relSlider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      relSlider.scrollBy({ left: getStep(), behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft') {
      relSlider.scrollBy({ left: -getStep(), behavior: 'smooth' });
    }
  });
  // Intentionally disable mouse wheel horizontal scroll for UX consistency
});

// Smooth dropdowns: keep open while moving between menu items; close after mouse leaves the whole nav
document.addEventListener('DOMContentLoaded', () => {
  const NAV_CLOSE_DELAY = 500; // ms (you can tune this)
  const nav = document.querySelector('.nav');
  const items = Array.from(document.querySelectorAll('.nav-item'));
  let closeTimer;

  function openItem(item) {
    clearTimeout(closeTimer);
    // Open the hovered item, close others
    items.forEach(i => i.classList.toggle('open', i === item));
  }

  function scheduleCloseAll() {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      items.forEach(i => i.classList.remove('open'));
    }, NAV_CLOSE_DELAY);
  }

  // Open respective panel on hover/focus, but do not close when moving between items
  items.forEach(item => {
    item.addEventListener('mouseenter', () => openItem(item));
    item.addEventListener('focusin', () => openItem(item));

    // Keep open while hovering the dropdown panel itself
    const panel = item.querySelector('.dropdown-panel');
    if (panel) {
      panel.addEventListener('mouseenter', () => openItem(item));
      panel.addEventListener('mouseleave', scheduleCloseAll);
    }
  });

  if (nav) {
    // Cancel closing if pointer returns quickly
    nav.addEventListener('mouseenter', () => clearTimeout(closeTimer));
    // Close only after leaving the entire nav area (not when moving to another item)
    nav.addEventListener('mouseleave', scheduleCloseAll);
    // Keyboard: close when focus completely leaves the nav
    nav.addEventListener('focusout', (e) => {
      if (!nav.contains(e.relatedTarget)) scheduleCloseAll();
    });
  }
});

// Testimonials slider
document.addEventListener('DOMContentLoaded', () => {
  const slides = Array.from(document.querySelectorAll('.testimonial-slide'));
  const dots = Array.from(document.querySelectorAll('.t-dot'));
  const prev = document.querySelector('.t-prev');
  const next = document.querySelector('.t-next');
  let idx = 0;
  let timer;

  function show(i) {
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, si) => s.classList.toggle('active', si === idx));
    dots.forEach((d, di) => d.classList.toggle('active', di === idx));
  }

  function auto() {
    clearInterval(timer);
    timer = setInterval(() => show(idx + 1), 5000);
  }

  function animateTo(nextIdx) {
    if (!slides.length || nextIdx === idx) return;
    const currentSlide = slides[idx];
    const dir = nextIdx > idx || (idx === 0 && nextIdx === slides.length - 1 && false) ? 1 : -1;
    const incoming = slides[(nextIdx + slides.length) % slides.length];

    // reset classes
    slides.forEach(s => s.classList.remove('from-left', 'from-right', 'to-left', 'to-right', 'active'));

    // prepare incoming
    incoming.classList.add(dir === 1 ? 'from-right' : 'from-left');
    incoming.offsetHeight; // force reflow

    // animate out current, animate in incoming
    currentSlide.classList.add(dir === 1 ? 'to-left' : 'to-right');
    incoming.classList.remove('from-right', 'from-left');
    incoming.classList.add('active');

    show(nextIdx);
  }

  if (slides.length) {
    dots.forEach((d, di) => d.addEventListener('click', () => { animateTo(di); auto(); }));
    if (prev) prev.addEventListener('click', () => { animateTo(idx - 1); auto(); });
    if (next) next.addEventListener('click', () => { animateTo(idx + 1); auto(); });
    auto();
  }
});

// Footer enhancements: dynamic year + newsletter UX
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const form = document.querySelector('.newsletter-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]');
      if (!email || !email.value.trim()) return;
      form.reset();
      // Simple toast
      const msg = document.createElement('div');
      msg.className = 'nl-toast';
      msg.setAttribute('role', 'status');
      msg.textContent = 'Thanks for subscribing!';
      form.insertAdjacentElement('afterend', msg);
      setTimeout(() => msg.remove(), 3000);
    });
  }
});

// Dynamic hero title for Best Sellers page
document.addEventListener('DOMContentLoaded', () => {
  // 1) When user clicks any link that goes to bestseller.html, store the link's text as desired title
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a');
    if (!a) return;
    try {
      const url = new URL(a.getAttribute('href'), window.location.href);
      if (url.pathname.endsWith('bestseller.html')) {
        const raw = a.getAttribute('data-title') || a.textContent || '';
        const title = raw.replace(/\s+/g, ' ').trim();
        if (title) sessionStorage.setItem('bsTitle', title);
      }
    } catch (_) { /* ignore malformed href */ }
  }, true);

  // 2) On bestseller.html, set the hero title from ?title= or sessionStorage, with a sensible fallback
  const heroTitleEl = document.querySelector('.bs-hero-title');
  if (heroTitleEl) {
    const params = new URLSearchParams(window.location.search);
    const fromParam = (params.get('title') || '').trim();
    const fromStorage = (sessionStorage.getItem('bsTitle') || '').trim();
    heroTitleEl.textContent = fromParam || fromStorage || 'Best Sellers';

    // 3) Update the title as filters are (de)selected
    const sidebar = document.querySelector('.bs-sidebar');
    if (sidebar) {
      const updateFromFilters = () => {
        const checked = Array.from(sidebar.querySelectorAll('.filter-list input[type="checkbox"]:checked'));
        if (checked.length) {
          const labels = checked.map(cb => {
            const label = cb.closest('label');
            if (!label) return '';
            // Remove counts like (32) if present
            return label.innerText.replace(/\(\s*\d+\s*\)/g, '').replace(/\s+/g, ' ').trim();
          }).filter(Boolean);
          const combined = labels.join(' • ');
          if (combined) {
            heroTitleEl.textContent = combined;
            sessionStorage.setItem('bsTitle', combined);
          }
        } else {
          // No filters selected – restore previous stored title or default
          const fallback = fromParam || fromStorage || 'Best Sellers';
          heroTitleEl.textContent = fallback;
          sessionStorage.setItem('bsTitle', fallback);
        }
      };
      sidebar.addEventListener('change', updateFromFilters);
    }
  }
});

// Before/After Comparison Slider
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('comparisonSlider');
  const handle = document.getElementById('comparisonHandle');
  const afterImage = document.querySelector('.comparison-after');
  const optionButtons = document.querySelectorAll('.comparison-option');
  const beforeImg = document.querySelector('.comparison-before img');
  const afterImg = document.querySelector('.comparison-after img');
  
  if (!slider || !handle || !afterImage) return;
  
  let isDragging = false;
  let sliderWidth = slider.offsetWidth;
  
  // Update slider width on window resize
  window.addEventListener('resize', () => {
    sliderWidth = slider.offsetWidth;
    // Update after image width for responsive
    const currentPosition = parseFloat(handle.style.left || '50%');
    afterImg.style.minWidth = sliderWidth + 'px';
    afterImg.style.maxWidth = sliderWidth + 'px';
  });
  
  // Initialize after image width
  afterImg.style.minWidth = sliderWidth + 'px';
  afterImg.style.maxWidth = sliderWidth + 'px';
  
  function updateSliderPosition(x) {
    const rect = slider.getBoundingClientRect();
    let position = ((x - rect.left) / sliderWidth) * 100;
    
    // Clamp position between 0 and 100
    position = Math.max(0, Math.min(100, position));
    
    // Update handle and after image positions
    handle.style.left = position + '%';
    afterImage.style.width = position + '%';
    
    // Get the labels
    const beforeLabel = document.querySelector('.comparison-label-before');
    const afterLabel = document.querySelector('.comparison-label-after');
    
    // Gradual fade effect for labels starting from center (50%)
    if (beforeLabel) {
      // For "Architectural Plan" label - starts fading from 50% to 0%
      let beforeOpacity = 1;
      if (position <= 50) {
        // Gradually fade from 50% to 0%
        // At 50% = fully visible (opacity 1), at 0% = invisible (opacity 0)
        beforeOpacity = position / 50;
      }
      beforeLabel.style.opacity = beforeOpacity;
      
      // Add slight scale and blur effect as it fades
      const beforeScale = 0.85 + (beforeOpacity * 0.15);
      const beforeBlur = (1 - beforeOpacity) * 3;
      beforeLabel.style.transform = `scale(${beforeScale})`;
      beforeLabel.style.filter = `blur(${beforeBlur}px)`;
      
      // Disable pointer events when nearly invisible
      beforeLabel.style.pointerEvents = beforeOpacity < 0.1 ? 'none' : 'auto';
    }
    
    if (afterLabel) {
      // For "Completed Home" label - starts fading from 50% to 100%
      let afterOpacity = 1;
      if (position >= 50) {
        // Gradually fade from 50% to 100%
        // At 50% = fully visible (opacity 1), at 100% = invisible (opacity 0)
        afterOpacity = (100 - position) / 50;
      }
      afterLabel.style.opacity = afterOpacity;
      
      // Add slight scale and blur effect as it fades
      const afterScale = 0.85 + (afterOpacity * 0.15);
      const afterBlur = (1 - afterOpacity) * 3;
      afterLabel.style.transform = `scale(${afterScale})`;
      afterLabel.style.filter = `blur(${afterBlur}px)`;
      
      // Disable pointer events when nearly invisible
      afterLabel.style.pointerEvents = afterOpacity < 0.1 ? 'none' : 'auto';
    }
  }
  
  // Mouse events
  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  // Touch events for mobile
  handle.addEventListener('touchstart', (e) => {
    isDragging = true;
    e.preventDefault();
  });
  
  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    updateSliderPosition(touch.clientX);
  });
  
  document.addEventListener('touchend', () => {
    isDragging = false;
  });
  
  // Click on slider to move handle
  slider.addEventListener('click', (e) => {
    if (e.target === handle || handle.contains(e.target)) return;
    updateSliderPosition(e.clientX);
  });
  
  // Option buttons to switch images
  optionButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Update active state
      optionButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Change images
      const beforeSrc = button.dataset.before;
      const afterSrc = button.dataset.after;
      
      if (beforeSrc && afterSrc) {
        // Add fade transition
        slider.style.opacity = '0.5';
        setTimeout(() => {
          beforeImg.src = beforeSrc;
          afterImg.src = afterSrc;
          slider.style.opacity = '1';
        }, 200);
      }
    });
  });
  
  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!slider.matches(':hover')) return;
    
    const currentPosition = parseFloat(handle.style.left || '50');
    let newPosition = currentPosition;
    
    if (e.key === 'ArrowLeft') {
      newPosition = Math.max(0, currentPosition - 5);
    } else if (e.key === 'ArrowRight') {
      newPosition = Math.min(100, currentPosition + 5);
    } else {
      return;
    }
    
    handle.style.left = newPosition + '%';
    afterImage.style.width = newPosition + '%';
  });
});
