// Utility Functions
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

// Set current year in footer
document.addEventListener('DOMContentLoaded', () => {
  const yearEl = $('#year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  initializeDropdowns();
  initializeMobileMenu();
  initializeToasts();
  initializeAnimations();
});

// Profile Dropdown
function initializeDropdowns() {
  const profileBtn = $('#profile-btn');
  const profileMenu = $('#profile-menu');
  
  if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleDropdown(profileMenu);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        closeDropdown(profileMenu);
      }
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDropdown(profileMenu);
      }
    });
  }
}

function toggleDropdown(menu) {
  const isOpen = menu.classList.contains('opacity-100');
  if (isOpen) {
    closeDropdown(menu);
  } else {
    openDropdown(menu);
  }
}

function openDropdown(menu) {
  menu.classList.remove('opacity-0', 'invisible', 'scale-95');
  menu.classList.add('opacity-100', 'visible', 'scale-100');
}

function closeDropdown(menu) {
  menu.classList.add('opacity-0', 'invisible', 'scale-95');
  menu.classList.remove('opacity-100', 'visible', 'scale-100');
}

// Mobile Menu
function initializeMobileMenu() {
  const mobileMenuBtn = $('#mobile-menu-btn');
  const mobileMenu = $('#mobile-menu');
  const menuIcon = $('#menu-icon');
  const closeIcon = $('#close-icon');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = !mobileMenu.classList.contains('hidden');

      if (isOpen) {
        // Close menu
        mobileMenu.classList.add('hidden');
        if (menuIcon) menuIcon.classList.remove('hidden');
        if (closeIcon) closeIcon.classList.add('hidden');
      } else {
        // Open menu
        mobileMenu.classList.remove('hidden');
        if (menuIcon) menuIcon.classList.add('hidden');
        if (closeIcon) closeIcon.classList.remove('hidden');
      }
    });
  }
}

// Toast Notifications
function initializeToasts() {
  window.showToast = (message, duration = 3000) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 transition-all duration-300 opacity-0';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Fade in
    setTimeout(() => {
      toast.classList.remove('opacity-0');
      toast.classList.add('opacity-100');
    }, 10);

    // Fade out and remove
    setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, duration);
  };
}

// Scroll Animations
function initializeAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all cards
  $$('.card-hover').forEach(card => {
    observer.observe(card);
  });
}

// Smooth Scroll for anchor links
$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && $(href)) {
      e.preventDefault();
      $(href).scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Search Functionality
const searchData = [
  // Pages
  { title: 'Home', description: 'Main landing page', url: '/app.html', type: 'page' },
  { title: 'Schedule & Book Class', description: 'View class schedule and book sessions', url: '/schedule.html', type: 'page' },
  { title: 'Pricing & Membership', description: 'View packages: Drop-In, Starter, Standard, Power', url: '/pricing.html', type: 'page' },
  { title: 'My Dashboard', description: 'View your bookings and credits', url: '/dashboard.html', type: 'page' },
  { title: 'Payment History', description: 'View your payment history', url: '/payments.html', type: 'page' },
  { title: 'About Coach Iren', description: 'Meet our head coach Iren San Buenaventura', url: '/calapan1/about.html', type: 'page' },
  { title: 'How It Works', description: 'Learn how to sign up, pay, and book classes', url: '/how-it-works.html', type: 'page' },

  // Classes
  { title: 'Total Body Burn', description: 'Monday - Full-body strength & endurance', url: '/schedule.html', type: 'class' },
  { title: 'Tone & Tighten', description: 'Tuesday - Lower body & core shaping', url: '/schedule.html', type: 'class' },
  { title: 'Cardio Crush', description: 'Wednesday - HIIT-style conditioning', url: '/schedule.html', type: 'class' },
  { title: 'Sculpt & Strength', description: 'Thursday - Upper body & posture', url: '/schedule.html', type: 'class' },
  { title: 'Core & Balance', description: 'Friday - Abs, stability, coordination', url: '/schedule.html', type: 'class' },
  { title: 'Booty & Burn', description: 'Saturday - Glutes & endurance', url: '/schedule.html', type: 'class' },

  // Pricing
  { title: 'Drop-In Class', description: '₱350 per class - No membership needed', url: '/pricing.html', type: 'pricing' },
  { title: 'Starter Pack', description: '₱1,800 for 6 classes - 15 days validity', url: '/pricing.html', type: 'pricing' },
  { title: 'Standard Pack', description: '₱3,300 for 12 classes - 30 days validity', url: '/pricing.html', type: 'pricing' },
  { title: 'Power Pack', description: '₱5,000 for 20 classes - 45 days validity', url: '/pricing.html', type: 'pricing' },

  // Topics
  { title: 'GCash Payment', description: 'How to pay via GCash', url: '/pricing.html#payment', type: 'topic' },
  { title: 'Bank Transfer', description: 'BPI bank transfer details', url: '/pricing.html#payment', type: 'topic' },
  { title: 'Annual Membership', description: '₱500/year membership fee info', url: '/pricing.html', type: 'topic' },
];

function performSearch(query, resultsContainerId) {
  const resultsContainer = document.getElementById(resultsContainerId);
  if (!resultsContainer) return;

  if (!query || query.length < 2) {
    resultsContainer.classList.add('hidden');
    resultsContainer.innerHTML = '';
    return;
  }

  const lowerQuery = query.toLowerCase();
  const results = searchData.filter(item =>
    item.title.toLowerCase().includes(lowerQuery) ||
    item.description.toLowerCase().includes(lowerQuery)
  ).slice(0, 8); // Limit to 8 results

  if (results.length === 0) {
    resultsContainer.innerHTML = '<div class="p-4 text-gray-500 text-sm text-center">No results found</div>';
    resultsContainer.classList.remove('hidden');
    return;
  }

  const typeIcons = {
    page: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>',
    class: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>',
    pricing: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>',
    topic: '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
  };

  resultsContainer.innerHTML = results.map(item => `
    <a href="${item.url}" class="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <span class="text-gray-400 mt-0.5">${typeIcons[item.type] || typeIcons.page}</span>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-gray-900 truncate">${item.title}</p>
        <p class="text-xs text-gray-500 truncate">${item.description}</p>
      </div>
    </a>
  `).join('');

  resultsContainer.classList.remove('hidden');
}

// Setup search for both desktop and mobile
function setupSearch(inputId, resultsId) {
  const input = document.getElementById(inputId);
  const results = document.getElementById(resultsId);
  if (!input) return;

  let searchTimeout;
  input.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      performSearch(e.target.value, resultsId);
    }, 200);
  });

  // Close results when clicking outside
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && results && !results.contains(e.target)) {
      results.classList.add('hidden');
    }
  });

  // Show results on focus if there's a query
  input.addEventListener('focus', () => {
    if (input.value.length >= 2) {
      performSearch(input.value, resultsId);
    }
  });
}

// Initialize search after components load
document.addEventListener('componentsLoaded', () => {
  console.log('componentsLoaded fired - setting up search');
  setupSearch('desktop-search', 'desktop-search-results');
  setupSearch('mobile-search', 'mobile-search-results');
});

// Fallback: retry search setup after a delay (in case componentsLoaded already fired)
function initSearchWithRetry(attempts = 0) {
  const desktopSearch = document.getElementById('desktop-search');
  if (desktopSearch) {
    console.log('Search elements found - setting up search');
    setupSearch('desktop-search', 'desktop-search-results');
    setupSearch('mobile-search', 'mobile-search-results');
  } else if (attempts < 10) {
    setTimeout(() => initSearchWithRetry(attempts + 1), 200);
  }
}

// Start retry after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initSearchWithRetry());
} else {
  initSearchWithRetry();
}

// Form Handling Examples - only for booking forms, not auth forms
const bookingForms = $$('form').filter(form => {
  // Exclude auth-related forms
  return form.id !== 'auth-form' && !form.closest('#modal-auth');
});
bookingForms.forEach(form => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    console.log('Form submitted:', Object.fromEntries(formData));
    showToast('Booking submitted successfully! 🎉');
    // Add actual form submission logic here
  });
});

// Button Click Handlers
$$('button').forEach(button => {
  const text = button.textContent.trim();
  
  if (text.includes('Book')) {
    button.addEventListener('click', () => {
      console.log('Book button clicked');
      // Add booking logic
    });
  }
  
  if (text.includes('GCash')) {
    button.addEventListener('click', () => {
      console.log('GCash payment clicked');
      showToast('Opening GCash payment...');
      // Add GCash payment logic
    });
  }
});

// Metric Cards Animation on Load
window.addEventListener('load', () => {
  const metricCards = $$('.bg-white.rounded-2xl');
  metricCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'all 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 50);
    }, index * 100);
  });
});

// Lazy Loading Images (if needed)
if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      }
    });
  });

  $$('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Local Storage for User Preferences
const savePreference = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save preference:', e);
  }
};

const getPreference = (key, defaultValue = null) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (e) {
    console.error('Failed to get preference:', e);
    return defaultValue;
  }
};

// Export for use in other modules
window.fitbreak = {
  showToast: (msg, dur) => window.showToast?.(msg, dur),
  savePreference,
  getPreference
};
