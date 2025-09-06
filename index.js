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

    // Add mouse wheel scrolling
    plansSlider.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        plansSlider.scrollBy({ left: e.deltaY, behavior: 'smooth' });
      }
    }, { passive: false });

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