// Onboarding Tour System for FitBreak
// Provides first-time user guidance, tooltips, and contextual help

const TOUR_STORAGE_KEY = 'fitbreak_tour_completed';
const TOOLTIPS_STORAGE_KEY = 'fitbreak_tooltips_seen';
const TOUR_VERSION = '2.0'; // Increment to show tour again after updates

// Tour steps configuration for all pages
const tourSteps = {
  dashboard: [
    {
      target: '#credits-card, .credits-card, [data-tour="credits"]',
      title: 'Your Credits',
      content: 'This shows how many class credits you have. 1 credit = 1 class session. Credits expire within 30-45 days based on your package.',
      position: 'bottom'
    },
    {
      target: '#upcoming-classes, .upcoming-bookings, [data-tour="upcoming"]',
      title: 'Upcoming Classes',
      content: 'Your booked classes appear here. You\'ll see the class name, time, and a QR code for check-in.',
      position: 'bottom'
    },
    {
      target: '#credit-expiry-alert, [data-tour="expiry"]',
      title: 'Credit Alerts',
      content: 'We\'ll notify you when your credits are running low or about to expire.',
      position: 'bottom'
    },
    {
      target: '[href="/schedule.html"], [data-tour="schedule-link"]',
      title: 'Book Classes',
      content: 'Click here to browse the weekly schedule and book available classes.',
      position: 'right'
    },
    {
      target: '[href="/payments.html"], [data-tour="payments-link"]',
      title: 'Buy Credits',
      content: 'Need more credits? Purchase class packages here via GCash or BPI.',
      position: 'right'
    }
  ],
  schedule: [
    {
      target: '#week-range, [data-tour="week-nav"]',
      title: 'Weekly Schedule',
      content: 'This shows the current week\'s schedule. All classes run Monday to Saturday.',
      position: 'bottom'
    },
    {
      target: '#credits-banner, [data-tour="credits-display"]',
      title: 'Your Credits',
      content: 'Your available credits are shown here. Each class costs 1 credit.',
      position: 'bottom'
    },
    {
      target: '#schedule-container .bg-white, [data-tour="class-card"]',
      title: 'Class Sessions',
      content: 'Click on any available time slot to book. Green means available, gray means full or already booked.',
      position: 'bottom'
    }
  ],
  pricing: [
    {
      target: '.package-card:first-child, [data-tour="package"]',
      title: 'Choose a Package',
      content: 'Compare packages based on your fitness goals. Bigger packs offer better value per class!',
      position: 'bottom'
    },
    {
      target: '[data-tour="best-value"], .bg-brand-500',
      title: 'Best Value',
      content: 'This package offers the best savings per class. Recommended for regular gym-goers!',
      position: 'top'
    },
    {
      target: '.cta-button, [data-tour="buy-now"]',
      title: 'Get Started',
      content: 'Click to proceed with payment. You can pay via GCash or BPI bank transfer.',
      position: 'top'
    }
  ],
  payments: [
    {
      target: '[data-tour="payment-status"], .payment-status-card',
      title: 'Payment Status',
      content: 'Track the status of your payments here. Pending payments are usually verified within 24 hours.',
      position: 'bottom'
    },
    {
      target: '[data-tour="credit-history"], #credit-usage-section',
      title: 'Credit History',
      content: 'See how you\'ve used your credits over time - purchases, classes attended, and more.',
      position: 'bottom'
    },
    {
      target: '[data-tour="buy-credits"], [href="/pricing.html"]',
      title: 'Need More Credits?',
      content: 'Click here to purchase additional class packages.',
      position: 'right'
    }
  ],
  profile: [
    {
      target: '[data-tour="profile-info"], .profile-card',
      title: 'Your Profile',
      content: 'Manage your account details here. Keep your info updated for class notifications!',
      position: 'bottom'
    },
    {
      target: '[data-tour="referral"], #referral-section',
      title: 'Refer Friends',
      content: 'Share your referral code with friends. When they sign up and book, you both get bonus credits!',
      position: 'bottom'
    },
    {
      target: '[data-tour="settings"], [href="/settings.html"]',
      title: 'Settings',
      content: 'Customize your notification preferences and account settings.',
      position: 'right'
    }
  ],
  bookings: [
    {
      target: '#weekly-schedule, [data-tour="weekly-schedule"]',
      title: 'Weekly Classes',
      content: 'Browse all available classes for the week. Click on any class to book your spot.',
      position: 'bottom'
    },
    {
      target: '#my-bookings-list, [data-tour="my-bookings"]',
      title: 'Your Bookings',
      content: 'All your upcoming and past bookings appear here. You can cancel bookings up to 2 hours before class.',
      position: 'top'
    }
  ],
  'my-programs': [
    {
      target: '[data-tour="enrolled-programs"]',
      title: 'Your Programs',
      content: 'Programs you\'ve enrolled in appear here. Track your progress and access workout content.',
      position: 'bottom'
    },
    {
      target: '[data-tour="browse-programs"], [href="/programs.html"]',
      title: 'Browse Programs',
      content: 'Explore our fitness programs designed for different goals and fitness levels.',
      position: 'right'
    }
  ],
  checkout: [
    {
      target: '.payment-method, [data-tour="payment-method"]',
      title: 'Choose Payment Method',
      content: 'Select GCash for instant mobile payment, or BPI for bank transfer. Both are secure!',
      position: 'bottom'
    },
    {
      target: '[data-tour="payment-details"]',
      title: 'Payment Instructions',
      content: 'Follow these steps to complete your payment. Make sure to pay the exact amount shown.',
      position: 'bottom'
    },
    {
      target: '.upload-receipt, [data-tour="upload-receipt"]',
      title: 'Upload Receipt',
      content: 'After paying, take a screenshot and upload it here. We\'ll verify and add credits within 24 hours.',
      position: 'top'
    }
  ]
};

// Hover tooltips configuration
const hoverTooltips = {
  // Dashboard tooltips
  'credits-count': {
    title: 'Available Credits',
    content: '1 credit = 1 class. Credits expire within 30-45 days based on your package.',
    position: 'bottom'
  },
  'book-class-btn': {
    title: 'Book a Class',
    content: 'Browse the schedule and reserve your spot in upcoming classes.',
    position: 'bottom'
  },
  'buy-credits-btn': {
    title: 'Buy Credits',
    content: 'Purchase class packages. Bigger packs = better savings!',
    position: 'bottom'
  },
  // Schedule tooltips
  'class-slot-available': {
    title: 'Available',
    content: 'Click to book this class. Uses 1 credit.',
    position: 'top'
  },
  'class-slot-full': {
    title: 'Class Full',
    content: 'This session is at capacity. Try another time slot.',
    position: 'top'
  },
  'class-slot-booked': {
    title: 'Already Booked',
    content: 'You\'ve already booked this class. See you there!',
    position: 'top'
  },
  // Payment tooltips
  'payment-pending': {
    title: 'Pending Verification',
    content: 'We\'re reviewing your payment. Usually takes less than 24 hours.',
    position: 'right'
  },
  'payment-approved': {
    title: 'Payment Approved',
    content: 'Credits have been added to your account!',
    position: 'right'
  }
};

// Current tour state
let currentTour = null;
let currentStep = 0;
let tourOverlay = null;
let tourTooltip = null;
let activeHoverTooltip = null;

// Check if user needs to see the tour
function shouldShowTour() {
  const completed = localStorage.getItem(TOUR_STORAGE_KEY);
  if (!completed) return true;

  try {
    const data = JSON.parse(completed);
    return data.version !== TOUR_VERSION;
  } catch {
    return true;
  }
}

// Check if this is a first-time sign-in (check Firestore user creation date)
async function isFirstTimeUser() {
  try {
    // Check localStorage first for quick response
    const tourData = localStorage.getItem(TOUR_STORAGE_KEY);
    if (tourData) {
      const parsed = JSON.parse(tourData);
      if (parsed.version === TOUR_VERSION) return false;
    }
    return true;
  } catch {
    return true;
  }
}

// Initialize tour system
async function initOnboardingTour() {
  // Add styles first
  addTourStyles();

  // Create floating help button
  createHelpButton();

  // Initialize hover tooltips
  initHoverTooltips();

  // Check for tour parameter in URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tour') === '1') {
    // Remove the parameter from URL
    urlParams.delete('tour');
    const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
    window.history.replaceState({}, '', newUrl);

    // Start tour after a short delay
    setTimeout(() => startTour(getCurrentPage()), 500);
    return;
  }

  // Check if first-time user
  if (await isFirstTimeUser()) {
    const page = getCurrentPage();
    if (page === 'dashboard') {
      // Show welcome modal for first-time users
      setTimeout(() => showWelcomeModal(), 800);
    }
  }
}

// Show styled welcome modal
function showWelcomeModal() {
  // Check if modal already exists
  if (document.getElementById('welcome-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'welcome-modal';
  modal.className = 'fixed inset-0 z-[10000] flex items-center justify-center p-4';
  modal.innerHTML = `
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="closeWelcomeModal(false)"></div>
    <div class="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-modal-in">
      <!-- Header with gradient -->
      <div class="bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-8 text-center text-white">
        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 class="text-2xl font-bold mb-2">Welcome to FitBreak!</h2>
        <p class="text-white/90">Your fitness journey starts here</p>
      </div>

      <!-- Content -->
      <div class="p-6">
        <p class="text-gray-600 text-center mb-6">
          We're excited to have you! Let us show you around so you can make the most of your FitBreak experience.
        </p>

        <!-- Quick highlights -->
        <div class="space-y-3 mb-6">
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span class="text-2xl">📅</span>
            <div>
              <p class="font-medium text-gray-900">Book Classes</p>
              <p class="text-sm text-gray-500">Reserve your spot in bootcamp sessions</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span class="text-2xl">💳</span>
            <div>
              <p class="font-medium text-gray-900">Buy Credits</p>
              <p class="text-sm text-gray-500">1 credit = 1 class session</p>
            </div>
          </div>
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span class="text-2xl">🎁</span>
            <div>
              <p class="font-medium text-gray-900">Refer Friends</p>
              <p class="text-sm text-gray-500">Earn bonus credits for referrals</p>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex flex-col gap-3">
          <button onclick="closeWelcomeModal(true)" class="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Take the Tour
          </button>
          <button onclick="closeWelcomeModal(false)" class="w-full py-3 text-gray-600 hover:text-gray-900 font-medium transition">
            Maybe Later
          </button>
        </div>

        <p class="text-xs text-gray-400 text-center mt-4">
          You can always restart the tour from the Help button
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

// Close welcome modal
function closeWelcomeModal(startTourAfter) {
  const modal = document.getElementById('welcome-modal');
  if (modal) {
    modal.querySelector('.relative').classList.add('animate-modal-out');
    setTimeout(() => {
      modal.remove();
      if (startTourAfter) {
        startTour('dashboard');
      } else {
        markTourComplete();
      }
    }, 200);
  }
}

// Initialize hover tooltips
function initHoverTooltips() {
  // Add tooltips to elements with data-tooltip attribute
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    const tooltipId = el.dataset.tooltip;
    const tooltipConfig = hoverTooltips[tooltipId];
    if (!tooltipConfig) return;

    el.addEventListener('mouseenter', (e) => showHoverTooltip(e.target, tooltipConfig));
    el.addEventListener('mouseleave', hideHoverTooltip);
    el.addEventListener('focus', (e) => showHoverTooltip(e.target, tooltipConfig));
    el.addEventListener('blur', hideHoverTooltip);
  });

  // Also initialize for elements with specific classes
  initContextualTooltips();
}

// Initialize contextual tooltips based on element types
function initContextualTooltips() {
  // Credits display
  document.querySelectorAll('#credits-count, .credits-count').forEach(el => {
    if (el.dataset.tooltipInit) return;
    el.dataset.tooltipInit = 'true';
    el.style.cursor = 'help';
    el.addEventListener('mouseenter', () => showHoverTooltip(el, {
      title: 'Your Credits',
      content: '1 credit = 1 class. Credits expire within 30-45 days based on your package.',
      position: 'bottom'
    }));
    el.addEventListener('mouseleave', hideHoverTooltip);
  });
}

// Show hover tooltip
function showHoverTooltip(target, config) {
  hideHoverTooltip(); // Remove any existing tooltip

  const tooltip = document.createElement('div');
  tooltip.id = 'hover-tooltip';
  tooltip.className = 'fixed z-[9999] bg-gray-900 text-white rounded-lg shadow-xl max-w-xs pointer-events-none animate-tooltip-in';
  tooltip.innerHTML = `
    <div class="p-3">
      <p class="font-semibold text-sm mb-1">${config.title}</p>
      <p class="text-xs text-gray-300">${config.content}</p>
    </div>
    <div class="tooltip-arrow"></div>
  `;

  document.body.appendChild(tooltip);
  activeHoverTooltip = tooltip;

  // Position the tooltip
  positionHoverTooltip(target, tooltip, config.position || 'top');
}

// Position hover tooltip
function positionHoverTooltip(target, tooltip, position) {
  const rect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const padding = 8;

  let top, left;

  switch (position) {
    case 'top':
      top = rect.top - tooltipRect.height - padding;
      left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      tooltip.classList.add('tooltip-top');
      break;
    case 'bottom':
      top = rect.bottom + padding;
      left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
      tooltip.classList.add('tooltip-bottom');
      break;
    case 'left':
      top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
      left = rect.left - tooltipRect.width - padding;
      tooltip.classList.add('tooltip-left');
      break;
    case 'right':
      top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
      left = rect.right + padding;
      tooltip.classList.add('tooltip-right');
      break;
  }

  // Keep on screen
  top = Math.max(padding, Math.min(window.innerHeight - tooltipRect.height - padding, top));
  left = Math.max(padding, Math.min(window.innerWidth - tooltipRect.width - padding, left));

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

// Hide hover tooltip
function hideHoverTooltip() {
  if (activeHoverTooltip) {
    activeHoverTooltip.remove();
    activeHoverTooltip = null;
  }
}

// Get current page name
function getCurrentPage() {
  const path = window.location.pathname;
  if (path.includes('dashboard')) return 'dashboard';
  if (path.includes('schedule')) return 'schedule';
  if (path.includes('pricing')) return 'pricing';
  if (path.includes('checkout')) return 'checkout';
  if (path.includes('profile')) return 'profile';
  if (path.includes('bookings')) return 'bookings';
  if (path.includes('payments')) return 'payments';
  if (path.includes('my-programs')) return 'my-programs';
  return 'home';
}

// Create floating help button
function createHelpButton() {
  // Don't create if already exists
  if (document.getElementById('floating-help-btn')) return;

  const helpBtn = document.createElement('button');
  helpBtn.id = 'floating-help-btn';
  helpBtn.className = 'fixed bottom-20 right-6 z-40 w-12 h-12 bg-brand-500 text-white rounded-full shadow-lg hover:bg-brand-600 hover:scale-110 transition-all flex items-center justify-center group';
  helpBtn.setAttribute('aria-label', 'Help and support');
  helpBtn.innerHTML = `
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    <span class="absolute right-14 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      Need Help?
    </span>
  `;
  helpBtn.onclick = showHelpMenu;
  document.body.appendChild(helpBtn);

  // Pulse animation for first-time users
  if (shouldShowTour()) {
    helpBtn.classList.add('animate-bounce-gentle');
    setTimeout(() => helpBtn.classList.remove('animate-bounce-gentle'), 5000);
  }
}

// Show help menu
function showHelpMenu() {
  // Remove existing menu if any
  const existingMenu = document.getElementById('help-menu');
  if (existingMenu) {
    existingMenu.remove();
    return;
  }

  const page = getCurrentPage();
  const hasTour = tourSteps[page] && tourSteps[page].length > 0;

  const menu = document.createElement('div');
  menu.id = 'help-menu';
  menu.className = 'fixed bottom-36 right-6 z-50 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 w-64 animate-fade-in';
  menu.innerHTML = `
    <div class="px-4 py-2 border-b border-gray-100">
      <p class="font-semibold text-gray-900">Need Help?</p>
      <p class="text-xs text-gray-500">Learn how to use FitBreak</p>
    </div>
    ${hasTour ? `
    <button onclick="startCurrentPageTour()" class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition">
      <span class="text-xl">🎯</span>
      <div>
        <p class="font-medium text-gray-900">Tour This Page</p>
        <p class="text-xs text-gray-500">Learn about ${page} features</p>
      </div>
    </button>
    ` : ''}
    <button onclick="startFullTour()" class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition">
      <span class="text-xl">🚀</span>
      <div>
        <p class="font-medium text-gray-900">Full App Tour</p>
        <p class="text-xs text-gray-500">Complete walkthrough from dashboard</p>
      </div>
    </button>
    <a href="/profile.html#help-guide" class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition block">
      <span class="text-xl">📖</span>
      <div>
        <p class="font-medium text-gray-900">User Guide</p>
        <p class="text-xs text-gray-500">Step-by-step instructions</p>
      </div>
    </a>
    <div class="border-t border-gray-100 mt-1 pt-1">
      <a href="mailto:support@fitbreak.ph" class="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition block">
        <span class="text-xl">💬</span>
        <div>
          <p class="font-medium text-gray-900">Contact Support</p>
          <p class="text-xs text-gray-500">Email us your questions</p>
        </div>
      </a>
    </div>
    <button onclick="document.getElementById('help-menu').remove()" class="w-full px-4 py-2 text-center text-gray-500 text-sm hover:text-gray-700 border-t border-gray-100">
      Close
    </button>
  `;
  document.body.appendChild(menu);

  // Close on click outside
  setTimeout(() => {
    document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target) && e.target.id !== 'floating-help-btn') {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 100);
}

// Start tour for current page
function startCurrentPageTour() {
  const helpMenu = document.getElementById('help-menu');
  if (helpMenu) helpMenu.remove();

  const page = getCurrentPage();
  if (tourSteps[page]) {
    startTour(page);
  }
}

// Start full tour from dashboard
function startFullTour() {
  const helpMenu = document.getElementById('help-menu');
  if (helpMenu) helpMenu.remove();

  if (getCurrentPage() !== 'dashboard') {
    window.location.href = '/dashboard.html?tour=1';
  } else {
    startTour('dashboard');
  }
}

// Start the onboarding tour (legacy function name for compatibility)
function startOnboardingTour() {
  startFullTour();
}

// Start tour for a specific page
function startTour(page) {
  currentTour = tourSteps[page];
  currentStep = 0;

  if (!currentTour || currentTour.length === 0) {
    console.log('No tour steps for page:', page);
    return;
  }

  createTourOverlay();
  showStep(0);
}

// Create tour overlay
function createTourOverlay() {
  if (tourOverlay) return;

  tourOverlay = document.createElement('div');
  tourOverlay.id = 'tour-overlay';
  tourOverlay.className = 'fixed inset-0 z-[10001] pointer-events-none';
  tourOverlay.innerHTML = `
    <div class="absolute inset-0 bg-black bg-opacity-50 transition-opacity"></div>
  `;
  document.body.appendChild(tourOverlay);

  tourTooltip = document.createElement('div');
  tourTooltip.id = 'tour-tooltip';
  tourTooltip.className = 'fixed z-[10002] bg-white rounded-xl shadow-2xl max-w-sm pointer-events-auto';
  document.body.appendChild(tourTooltip);
}

// Show a tour step
function showStep(stepIndex) {
  if (!currentTour || stepIndex >= currentTour.length) {
    endTour();
    return;
  }

  currentStep = stepIndex;
  const step = currentTour[stepIndex];

  // Find target element (try multiple selectors)
  let target = null;
  const selectors = step.target.split(',').map(s => s.trim());
  for (const selector of selectors) {
    target = document.querySelector(selector);
    if (target) break;
  }

  // Update tooltip content
  const isLastStep = stepIndex >= currentTour.length - 1;
  tourTooltip.innerHTML = `
    <div class="p-4">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-bold text-gray-900">${step.title}</h4>
        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">${stepIndex + 1}/${currentTour.length}</span>
      </div>
      <p class="text-sm text-gray-600 mb-4">${step.content}</p>

      <!-- Progress dots -->
      <div class="flex justify-center gap-1.5 mb-4">
        ${currentTour.map((_, i) => `
          <div class="w-2 h-2 rounded-full ${i === stepIndex ? 'bg-brand-500' : i < stepIndex ? 'bg-brand-300' : 'bg-gray-200'}"></div>
        `).join('')}
      </div>

      <div class="flex items-center justify-between">
        <button onclick="skipTour()" class="text-sm text-gray-500 hover:text-gray-700 transition">Skip</button>
        <div class="flex gap-2">
          ${stepIndex > 0 ? '<button onclick="prevStep()" class="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition">Back</button>' : ''}
          <button onclick="nextStep()" class="px-5 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition font-medium">
            ${isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  `;

  // Position tooltip
  if (target) {
    positionTooltip(target, step.position);
    highlightElement(target);
  } else {
    // If target not found, center the tooltip and show a message
    tourTooltip.style.top = '50%';
    tourTooltip.style.left = '50%';
    tourTooltip.style.transform = 'translate(-50%, -50%)';
    console.log('Tour target not found:', step.target);
  }
}

// Position tooltip relative to target
function positionTooltip(target, position) {
  const rect = target.getBoundingClientRect();
  const padding = 16;

  // Position tooltip (will adjust after getting dimensions)
  tourTooltip.style.top = '0px';
  tourTooltip.style.left = '0px';
  tourTooltip.style.transform = 'none';

  // Get tooltip dimensions after render
  requestAnimationFrame(() => {
    const tooltipRect = tourTooltip.getBoundingClientRect();
    let top, left;

    switch (position) {
      case 'top':
        top = rect.top - tooltipRect.height - padding;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.left - tooltipRect.width - padding;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        left = rect.right + padding;
        break;
      default:
        top = rect.bottom + padding;
        left = rect.left;
    }

    // Keep tooltip on screen
    top = Math.max(padding, Math.min(window.innerHeight - tooltipRect.height - padding, top));
    left = Math.max(padding, Math.min(window.innerWidth - tooltipRect.width - padding, left));

    tourTooltip.style.top = `${top}px`;
    tourTooltip.style.left = `${left}px`;
  });
}

// Highlight the target element
function highlightElement(target) {
  // Remove previous highlight
  document.querySelectorAll('.tour-highlighted').forEach(el => {
    el.classList.remove('tour-highlighted');
    el.style.removeProperty('position');
    el.style.removeProperty('z-index');
    el.style.removeProperty('box-shadow');
    el.style.removeProperty('isolation');
  });

  // Add highlight to current target
  target.classList.add('tour-highlighted');
  const currentPosition = window.getComputedStyle(target).position;
  if (currentPosition === 'static') {
    target.style.position = 'relative';
  }
  target.style.zIndex = '10000';
  target.style.boxShadow = '0 0 0 4px rgba(215, 30, 73, 0.4), 0 0 30px rgba(215, 30, 73, 0.3)';
  // Ensure highlighted element is above sidebar
  target.style.isolation = 'isolate';

  // Scroll into view if needed
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Next step
function nextStep() {
  if (currentStep < currentTour.length - 1) {
    showStep(currentStep + 1);
  } else {
    endTour();
  }
}

// Previous step
function prevStep() {
  if (currentStep > 0) {
    showStep(currentStep - 1);
  }
}

// Skip tour
function skipTour() {
  endTour();
}

// End tour
function endTour() {
  // Remove overlay and tooltip with animation
  if (tourOverlay) {
    tourOverlay.style.opacity = '0';
    setTimeout(() => {
      if (tourOverlay) {
        tourOverlay.remove();
        tourOverlay = null;
      }
    }, 200);
  }
  if (tourTooltip) {
    tourTooltip.style.opacity = '0';
    tourTooltip.style.transform = 'scale(0.95)';
    setTimeout(() => {
      if (tourTooltip) {
        tourTooltip.remove();
        tourTooltip = null;
      }
    }, 200);
  }

  // Remove all highlights
  document.querySelectorAll('.tour-highlighted').forEach(el => {
    el.classList.remove('tour-highlighted');
    el.style.removeProperty('position');
    el.style.removeProperty('z-index');
    el.style.removeProperty('box-shadow');
    el.style.removeProperty('isolation');
  });

  // Mark tour as complete
  markTourComplete();

  // Show completion toast
  showToast('Tour complete! Click the help button anytime for assistance.');

  currentTour = null;
  currentStep = 0;
}

// Show a toast message
function showToast(message) {
  const existingToast = document.getElementById('tour-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.id = 'tour-toast';
  toast.className = 'fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-gray-900 text-white rounded-full shadow-lg z-50 animate-fade-in';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Mark tour as complete
function markTourComplete() {
  localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify({
    version: TOUR_VERSION,
    completedAt: new Date().toISOString()
  }));

  // Hide new user banner if exists
  const banner = document.getElementById('new-user-banner');
  if (banner) banner.classList.add('hidden');
}

// Reset tour (for testing or re-showing)
function resetTour() {
  localStorage.removeItem(TOUR_STORAGE_KEY);
  localStorage.removeItem(TOOLTIPS_STORAGE_KEY);
  location.reload();
}

// Add CSS for tour and tooltips
function addTourStyles() {
  if (document.getElementById('tour-styles')) return;

  const style = document.createElement('style');
  style.id = 'tour-styles';
  style.textContent = `
    /* Tour highlight */
    .tour-highlighted {
      transition: box-shadow 0.3s ease;
    }

    /* Tour tooltip */
    #tour-tooltip {
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    /* Hover tooltip */
    #hover-tooltip {
      pointer-events: none;
    }

    .tooltip-top .tooltip-arrow,
    .tooltip-bottom .tooltip-arrow,
    .tooltip-left .tooltip-arrow,
    .tooltip-right .tooltip-arrow {
      position: absolute;
      width: 0;
      height: 0;
    }

    .tooltip-top .tooltip-arrow {
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid #1f2937;
    }

    .tooltip-bottom .tooltip-arrow {
      top: -6px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-bottom: 6px solid #1f2937;
    }

    .tooltip-left .tooltip-arrow {
      right: -6px;
      top: 50%;
      transform: translateY(-50%);
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 6px solid #1f2937;
    }

    .tooltip-right .tooltip-arrow {
      left: -6px;
      top: 50%;
      transform: translateY(-50%);
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-right: 6px solid #1f2937;
    }

    /* Animations */
    @keyframes tooltipFadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.9) translateY(20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    @keyframes modalOut {
      from { opacity: 1; transform: scale(1) translateY(0); }
      to { opacity: 0; transform: scale(0.9) translateY(20px); }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    @keyframes bounceGentle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    @keyframes pulseSubtle {
      0%, 100% { box-shadow: 0 4px 15px rgba(215, 30, 73, 0.3); }
      50% { box-shadow: 0 4px 25px rgba(215, 30, 73, 0.5); }
    }

    .animate-tooltip-in {
      animation: tooltipFadeIn 0.15s ease-out;
    }

    .animate-modal-in {
      animation: modalIn 0.3s ease-out;
    }

    .animate-modal-out {
      animation: modalOut 0.2s ease-in forwards;
    }

    .animate-fade-in {
      animation: fadeIn 0.2s ease;
    }

    .animate-bounce-gentle {
      animation: bounceGentle 1s ease-in-out 3;
    }

    #floating-help-btn {
      animation: pulseSubtle 2s infinite;
    }

    #floating-help-btn:hover {
      animation: none;
    }

    /* Move help button up on mobile to stay above chatbot and bottom nav */
    @media (max-width: 1023px) {
      #floating-help-btn {
        bottom: 10rem; /* 160px - above chatbot at 80px */
      }
      #help-menu {
        bottom: 14rem; /* 224px - above help button */
      }
    }

    /* Focus styles for accessibility */
    #floating-help-btn:focus {
      outline: 2px solid #d71e49;
      outline-offset: 2px;
    }

    /* Cursor help for tooltipped elements */
    [data-tooltip] {
      cursor: help;
    }
  `;
  document.head.appendChild(style);
}

// Expose functions globally
window.startOnboardingTour = startOnboardingTour;
window.startCurrentPageTour = startCurrentPageTour;
window.startFullTour = startFullTour;
window.startTour = startTour;
window.nextStep = nextStep;
window.prevStep = prevStep;
window.skipTour = skipTour;
window.endTour = endTour;
window.resetTour = resetTour;
window.showHelpMenu = showHelpMenu;
window.closeWelcomeModal = closeWelcomeModal;
window.showHoverTooltip = showHoverTooltip;
window.hideHoverTooltip = hideHoverTooltip;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initOnboardingTour();
  });
} else {
  initOnboardingTour();
}

// Re-init tooltips when page content changes (for SPAs)
const observer = new MutationObserver(() => {
  initContextualTooltips();
});
observer.observe(document.body, { childList: true, subtree: true });

console.log('FitBreak Onboarding Tour v2.0 loaded');
