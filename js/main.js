/* ============================================================
   PROLAUNCH — Main JS
   ============================================================ */

// ---- Page Loader ----
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) {
    setTimeout(() => loader.classList.add('hide'), 600);
    setTimeout(() => loader.remove(), 1200);
  }
});

// ---- Mobile Menu ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  });

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  if (mobileClose) mobileClose.addEventListener('click', closeMenu);

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// ---- Scroll Reveal ----
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));

// ---- Nav scroll styling ----
const nav = document.getElementById('nav');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  if (nav) {
    nav.classList.toggle('scrolled', current > 50);
  }
  lastScroll = current;
}, { passive: true });

// ---- Search Overlay ----
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('searchOverlay');
  const bg = document.getElementById('searchOverlayBg');
  const closeBtn = document.getElementById('searchClose');
  const input = document.getElementById('searchInput');
  const suggestions = document.querySelectorAll('.search-suggestion');

  if (!overlay) return;

  // Open search
  document.querySelectorAll('.nav-icon[aria-label="Search"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input && input.focus(), 200);
    });
  });

  // Close search
  const closeSearch = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    if (input) input.value = '';
    suggestions.forEach(s => s.classList.remove('hidden'));
  };

  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  if (bg) bg.addEventListener('click', closeSearch);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) closeSearch();
  });

  // Filter suggestions as user types
  if (input) {
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      suggestions.forEach(s => {
        if (!q || s.textContent.toLowerCase().includes(q)) {
          s.classList.remove('hidden');
        } else {
          s.classList.add('hidden');
        }
      });
    });
  }
});

// ---- Rotating Word (GlamLaunch hero) ----
const ROTATING_WORDS = ['Beauty', 'Fashion', 'Lifestyle'];
let rotatingIdx = 0;
let rotatingInterval = null;

function startRotatingWords() {
  const el = document.querySelector('.rotating-word');
  if (!el) return;
  stopRotatingWords();
  rotatingIdx = 0;
  el.textContent = ROTATING_WORDS[0];
  rotatingInterval = setInterval(() => {
    rotatingIdx = (rotatingIdx + 1) % ROTATING_WORDS.length;
    el.classList.remove('is-animating');
    void el.offsetWidth; // force reflow
    el.textContent = ROTATING_WORDS[rotatingIdx];
    el.classList.add('is-animating');
  }, 2000);
}

function stopRotatingWords() {
  if (rotatingInterval) {
    clearInterval(rotatingInterval);
    rotatingInterval = null;
  }
}

// ---- Brand Toggle ----
function getCurrentBrand() {
  return document.body.dataset.brand || document.documentElement.dataset.brand || 'prolaunch';
}

function getOtherBrand() {
  return getCurrentBrand() === 'prolaunch' ? 'glamlaunch' : 'prolaunch';
}

function applyBrandContent(brand) {
  if (typeof BRAND_CONTENT === 'undefined') return;
  const content = BRAND_CONTENT[brand];
  if (!content) return;
  document.querySelectorAll('[data-brand-key]').forEach(el => {
    const key = el.dataset.brandKey;
    if (content[key] !== undefined) {
      el.textContent = content[key];
    }
  });
}

function applyBrandImages(brand) {
  if (typeof BRAND_IMAGES === 'undefined') return;
  const images = BRAND_IMAGES[brand];
  if (!images) return;
  document.querySelectorAll('[data-brand-img]').forEach(el => {
    const key = el.dataset.brandImg;
    if (images[key]) {
      el.src = images[key];
    }
  });
}

function toggleBrand() {
  const newBrand = getOtherBrand();
  if (newBrand === 'prolaunch') {
    delete document.body.dataset.brand;
    delete document.documentElement.dataset.brand;
  } else {
    document.body.dataset.brand = newBrand;
    document.documentElement.dataset.brand = newBrand;
  }
  localStorage.setItem('prolaunch-brand', newBrand);
  applyBrandContent(newBrand);
  applyBrandImages(newBrand);
  updateToggleLabels(newBrand);
  if (newBrand === 'glamlaunch') {
    startRotatingWords();
  } else {
    stopRotatingWords();
  }
}

function updateToggleLabels(brand) {
  const otherName = brand === 'prolaunch' ? 'GlamLaunch' : 'ProLaunch';
  document.querySelectorAll('.brand-toggle-btn').forEach(btn => {
    btn.textContent = otherName;
  });
  document.querySelectorAll('.mobile-brand-toggle').forEach(btn => {
    btn.textContent = 'Switch to ' + otherName;
  });
}

// Default brand from the current hostname — glamlaunch.co serves GlamLaunch,
// prolaunchhq.com (or anything else) serves ProLaunch. localStorage still wins
// so a visitor's last brand toggle is remembered across pages.
function defaultBrandForHost() {
  var h = (typeof location !== 'undefined' && location.hostname) ? location.hostname.toLowerCase() : '';
  if (h.indexOf('glamlaunch.co') !== -1) return 'glamlaunch';
  return 'prolaunch';
}

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('prolaunch-brand') || defaultBrandForHost();
  if (saved === 'glamlaunch') {
    document.body.dataset.brand = 'glamlaunch';
    applyBrandContent('glamlaunch');
    applyBrandImages('glamlaunch');
    startRotatingWords();
  }
  updateToggleLabels(saved);
  document.querySelectorAll('.brand-toggle-btn, .mobile-brand-toggle').forEach(btn => {
    btn.addEventListener('click', toggleBrand);
  });
  // Also bind brand tab buttons
  document.querySelectorAll('.brand-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const isPro = btn.classList.contains('brand-tab--pro');
      const current = getCurrentBrand();
      if (isPro && current !== 'prolaunch') toggleBrand();
      if (!isPro && current !== 'glamlaunch') toggleBrand();
    });
  });
});
