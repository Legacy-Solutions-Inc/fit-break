// Member Sidebar Component
// Firebase Console style - categories collapsed by default
// Also generates mobile bottom navigation bar for PWA experience

const MEMBER_SIDEBAR_COLLAPSED_KEY = 'fitbreak_member_sidebar_collapsed';
const MEMBER_SIDEBAR_CATEGORIES_KEY = 'fitbreak_member_sidebar_categories_v2'; // v2 to reset old data

// Generate mobile bottom navigation bar for members
function getMemberBottomNav(activePage = '', isAdmin = false) {
  const navItems = [
    { id: 'dashboard', href: '/dashboard.html', label: 'Home', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>' },
    { id: 'schedule', href: '/schedule.html', label: 'Classes', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>' },
    { id: 'bookings', href: '/bookings.html', label: 'Bookings', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>' },
    { id: 'payments', href: '/payments.html', label: 'Payments', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>' },
  ];

  // Add Admin link for admin users, or More for regular users
  if (isAdmin) {
    navItems.push({ id: 'admin', href: '/admin.html', label: 'Admin', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>' });
  } else {
    navItems.push({ id: 'more', href: '#', label: 'More', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>', onclick: 'toggleMemberMobileSidebar(); return false;' });
  }

  const items = navItems.map(item => {
    const isActive = item.id === activePage;
    const activeClass = isActive ? 'text-brand-500' : 'text-gray-500';
    const onclick = item.onclick ? `onclick="${item.onclick}"` : '';

    return `
      <a href="${item.href}" ${onclick} class="flex flex-col items-center justify-center py-2 px-2 flex-1 ${activeClass} hover:text-brand-500 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">${item.icon}</svg>
        <span class="text-xs mt-1 font-medium">${item.label}</span>
      </a>
    `;
  }).join('');

  return `
    <nav id="member-mobile-nav" class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div class="flex items-center justify-around">
        ${items}
      </div>
    </nav>
  `;
}

// Get saved category states
function getMemberCategoryStates() {
  try {
    const saved = localStorage.getItem(MEMBER_SIDEBAR_CATEGORIES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

// Save category state
function saveMemberCategoryState(categoryId, isExpanded) {
  const states = getMemberCategoryStates();
  states[categoryId] = isExpanded;
  localStorage.setItem(MEMBER_SIDEBAR_CATEGORIES_KEY, JSON.stringify(states));
}

function getMemberSidebar(activePage = '') {
  const isCollapsed = localStorage.getItem(MEMBER_SIDEBAR_COLLAPSED_KEY) === 'true';
  const categoryStates = getMemberCategoryStates();

  // Navigation structure with categories
  const navStructure = [
    // Dashboard - always visible at top (not in any category)
    { href: '/dashboard.html', icon: 'dashboard', label: 'Dashboard', id: 'dashboard' },

    // Classes category
    {
      category: true,
      id: 'classes',
      label: 'Classes',
      icon: 'classes',
      items: [
        { href: '/schedule.html', icon: 'schedule', label: 'Schedule', id: 'schedule' },
        { href: '/bookings.html', icon: 'bookings', label: 'My Bookings', id: 'bookings' },
        { href: '/trainers.html', icon: 'trainers', label: 'Our Trainers', id: 'trainers' },
      ]
    },

    // Fitness category
    {
      category: true,
      id: 'fitness',
      label: 'Fitness',
      icon: 'fitness',
      items: [
        { href: '/programs.html', icon: 'exercises', label: 'Programs', id: 'programs' },
        { href: '/workout-tracker.html', icon: 'tracker', label: 'Workout Tracker', id: 'tracker' },
        { href: '/statistics.html', icon: 'statistics', label: 'Statistics', id: 'statistics' },
      ]
    },

    // Account category
    {
      category: true,
      id: 'account',
      label: 'Account',
      icon: 'account',
      items: [
        { href: '/profile.html', icon: 'profile', label: 'Profile', id: 'profile' },
        { href: '/payments.html', icon: 'payments', label: 'Payments', id: 'payments' },
        { href: '/settings.html', icon: 'settings', label: 'Settings', id: 'settings' },
      ]
    },
  ];

  const icons = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1" stroke-width="2"></rect><rect x="14" y="3" width="7" height="7" rx="1" stroke-width="2"></rect><rect x="3" y="14" width="7" height="7" rx="1" stroke-width="2"></rect><rect x="14" y="14" width="7" height="7" rx="1" stroke-width="2"></rect>',
    classes: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
    schedule: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>',
    bookings: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>',
    trainers: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>',
    fitness: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>',
    exercises: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h4v12H4zM16 6h4v12h-4zM8 10h8M8 14h8"></path>',
    tracker: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>',
    statistics: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>',
    account: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>',
    profile: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>',
    payments: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>',
    settings: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>',
    chevron: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>',
    logout: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>',
  };

  // Check if any item in a category is active
  function isCategoryActive(category) {
    return category.items?.some(item => item.id === activePage);
  }

  // Build navigation HTML
  let navHtml = '';

  navStructure.forEach(item => {
    if (item.category) {
      const categoryActive = isCategoryActive(item);
      // COLLAPSED by default. Only expand if:
      // 1. Category contains the currently active page, OR
      // 2. User has explicitly expanded it (saved state is true)
      const savedState = categoryStates[item.id];
      const isExpanded = categoryActive || savedState === true;

      navHtml += `
        <div class="category-group" data-category="${item.id}">
          <button class="category-header w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition group ${isCollapsed ? 'justify-center' : ''}" data-category-toggle="${item.id}">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icons[item.icon]}</svg>
              <span class="sidebar-label font-medium text-sm ${isCollapsed ? 'hidden' : ''}">${item.label}</span>
            </div>
            <svg class="category-chevron w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${isCollapsed ? 'hidden' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icons.chevron}</svg>
          </button>
          <div class="category-items overflow-hidden transition-all duration-200" data-category-items="${item.id}" style="max-height: ${isExpanded ? 'auto' : '0px'};">
            <div class="pl-8 py-1 space-y-0.5 ${isCollapsed ? 'pl-0' : ''}">
      `;

      item.items.forEach(subItem => {
        const isActive = activePage === subItem.id;
        const activeClass = isActive ? 'text-brand-600 bg-brand-50 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';
        navHtml += `
          <a href="${subItem.href}" class="sidebar-nav-item group relative flex items-center gap-3 px-3 py-2 rounded-lg ${activeClass} transition text-sm ${isCollapsed ? 'justify-center px-2' : ''}" data-page="${subItem.id}" title="${isCollapsed ? subItem.label : ''}">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icons[subItem.icon]}</svg>
            <span class="sidebar-label ${isCollapsed ? 'hidden' : ''}">${subItem.label}</span>
            ${isCollapsed ? `<div class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">${subItem.label}</div>` : ''}
          </a>
        `;
      });

      navHtml += `
            </div>
          </div>
        </div>
      `;
    } else {
      // Top-level item (Dashboard)
      const isActive = activePage === item.id;
      const activeClass = isActive ? 'text-white bg-brand-500 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';
      navHtml += `
        <a href="${item.href}" class="sidebar-nav-item group relative flex items-center gap-3 px-3 py-2.5 rounded-lg ${activeClass} transition text-sm mb-2 ${isCollapsed ? 'justify-center' : ''}" data-page="${item.id}" title="${isCollapsed ? item.label : ''}">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">${icons[item.icon]}</svg>
          <span class="sidebar-label ${isCollapsed ? 'hidden' : ''}">${item.label}</span>
          ${isCollapsed ? `<div class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">${item.label}</div>` : ''}
        </a>
      `;
    }
  });

  const sidebarWidth = isCollapsed ? 'w-16' : 'w-64';
  const collapsedClass = isCollapsed ? 'sidebar-collapsed' : '';

  const marginLeft = isCollapsed ? '4rem' : '16rem';

  return `
    <!-- Hide header on member pages - sidebar handles everything -->
    <style>
      #header-placeholder { display: none !important; }

      /* Fix main content and footer positioning for fixed sidebar */
      @media (min-width: 1024px) {
        main {
          margin-left: ${marginLeft} !important;
        }
        /* Target footer element directly - works for all footer structures */
        footer {
          margin-left: ${marginLeft} !important;
        }
        /* Hide the placeholder since we're using margin on main */
        #member-sidebar-placeholder {
          display: contents !important;
        }
      }
    </style>

    <!-- Sidebar Overlay for Mobile -->
    <div id="sidebar-overlay" class="fixed inset-0 bg-black/50 z-30 hidden lg:hidden"></div>

    <!-- Left Sidebar Navigation -->
    <aside id="sidebar" class="fixed top-0 left-0 z-40 h-[calc(100vh-5rem)] lg:h-screen ${sidebarWidth} bg-white border-r border-gray-200 transform -translate-x-full lg:translate-x-0 transition-all duration-300 flex flex-col pb-safe ${collapsedClass}">
      <!-- Logo -->
      <div class="p-4 border-b border-gray-100 flex items-center ${isCollapsed ? 'justify-center' : ''}">
        <a href="/dashboard.html" class="sidebar-logo flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}">
          ${isCollapsed ?
            '<img src="/images/fitbreak-logo.png" alt="FitBreak" class="h-8 w-8 object-contain" />' :
            '<img src="/images/fitbreak-landscape-logo.png" alt="FitBreak" class="h-10" />'
          }
        </a>
      </div>

      <!-- Navigation Menu (scrollable if content is long) -->
      <nav class="p-3 space-y-1 overflow-y-auto flex-1 min-h-0">
        ${navHtml}
      </nav>

      <!-- Footer Section - always at bottom, never shrinks -->
      <div class="shrink-0">
      <!-- User Profile Section -->
      <div class="p-3 border-t border-gray-100 ${isCollapsed ? 'p-2' : ''}">
        <div id="sidebar-user-section" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer ${isCollapsed ? 'justify-center' : ''}" onclick="toggleSidebarUserMenu()">
          <img id="sidebar-user-avatar" src="https://api.dicebear.com/7.x/initials/svg?seed=User&backgroundColor=D71E49" alt="User" class="w-9 h-9 rounded-full flex-shrink-0" />
          <div class="sidebar-label flex-1 min-w-0 ${isCollapsed ? 'hidden' : ''}">
            <p id="sidebar-user-name" class="text-sm font-medium text-gray-900 truncate">Loading...</p>
            <p id="sidebar-user-credits" class="text-xs text-gray-500">0 credits</p>
          </div>
          <svg class="sidebar-label w-4 h-4 text-gray-400 ${isCollapsed ? 'hidden' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
          </svg>
        </div>

        <!-- User Dropdown Menu -->
        <div id="sidebar-user-menu" class="hidden mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden ${isCollapsed ? 'absolute bottom-16 left-2 w-48' : ''}">
          <a href="/profile.html" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            My Profile
          </a>
          <a href="/settings.html" class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Settings
          </a>
          <!-- Admin Dashboard Link - Hidden by default, shown for admins -->
          <a href="/admin.html" id="sidebar-admin-link" class="hidden items-center gap-2 px-3 py-2 text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Admin Dashboard
          </a>
          <div class="border-t border-gray-100"></div>
          <button onclick="handleSidebarSignOut()" class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
          </button>
        </div>
      </div>

      <!-- Admin Dashboard Button - Hidden by default, shown for admins -->
      <div id="sidebar-admin-btn-container" class="hidden p-3 pt-0 ${isCollapsed ? 'p-2 pt-0' : ''}">
        <a href="/admin.html" id="sidebar-admin-btn" class="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition text-sm shadow-md ${isCollapsed ? 'px-2' : ''}" title="Admin Dashboard">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
          <span class="sidebar-label ${isCollapsed ? 'hidden' : ''}">Admin Dashboard</span>
        </a>
      </div>

      <!-- Book Class Button -->
      <div class="p-3 pt-0 ${isCollapsed ? 'p-2 pt-0' : ''}">
        <a href="/schedule.html" class="flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg font-semibold hover:from-brand-600 hover:to-brand-700 transition text-sm ${isCollapsed ? 'px-2' : ''}" title="Book a Class">
          <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
          <span class="sidebar-label pointer-events-none ${isCollapsed ? 'hidden' : ''}">Book a Class</span>
        </a>
      </div>

      <!-- Sign Out Button - Always Visible on Mobile -->
      <div class="p-3 pt-0 lg:hidden ${isCollapsed ? 'p-2 pt-0' : ''}">
        <button onclick="handleSidebarSignOut()" class="flex items-center justify-center gap-2 w-full py-2.5 border border-red-200 text-red-600 rounded-lg font-medium hover:bg-red-50 transition text-sm">
          <svg class="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
          <span class="sidebar-label pointer-events-none ${isCollapsed ? 'hidden' : ''}">Sign Out</span>
        </button>
      </div>
      </div><!-- End Footer Section -->
    </aside>
  `;
}

// Toggle category expand/collapse
function toggleMemberCategory(categoryId) {
  const categoryItems = document.querySelector(`[data-category-items="${categoryId}"]`);
  const chevron = document.querySelector(`[data-category-toggle="${categoryId}"] .category-chevron`);

  if (!categoryItems) return;

  const isCurrentlyExpanded = categoryItems.style.maxHeight !== '0px' && categoryItems.style.maxHeight !== '';
  const newState = !isCurrentlyExpanded;

  // Toggle max-height
  if (newState) {
    categoryItems.style.maxHeight = categoryItems.scrollHeight + 'px';
    chevron?.classList.add('rotate-90');
  } else {
    categoryItems.style.maxHeight = '0px';
    chevron?.classList.remove('rotate-90');
  }

  // Save state
  saveMemberCategoryState(categoryId, newState);
}

// Toggle sidebar collapsed state
function toggleMemberSidebar() {
  const isCurrentlyCollapsed = localStorage.getItem(MEMBER_SIDEBAR_COLLAPSED_KEY) === 'true';
  const newState = !isCurrentlyCollapsed;

  // Save state
  localStorage.setItem(MEMBER_SIDEBAR_COLLAPSED_KEY, newState.toString());

  // Get the current active page from the existing sidebar
  const activeLink = document.querySelector('#sidebar .sidebar-nav-item.bg-brand-500, #sidebar .sidebar-nav-item.bg-brand-50');
  const activePage = activeLink?.dataset?.page || '';

  // Re-render sidebar with new state (this updates the CSS margins too)
  const sidebarPlaceholder = document.getElementById('member-sidebar-placeholder');
  if (sidebarPlaceholder) {
    sidebarPlaceholder.innerHTML = getMemberSidebar(activePage);

    // Re-attach event listeners
    document.querySelectorAll('[data-category-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const categoryId = btn.getAttribute('data-category-toggle');
        toggleMemberCategory(categoryId);
      });
    });

    // Set initial max-height for expanded categories
    document.querySelectorAll('.category-items').forEach(items => {
      if (items.style.maxHeight !== '0px' && items.style.maxHeight !== '') {
        items.style.maxHeight = items.scrollHeight + 'px';
      }
    });

    // Re-attach mobile toggle
    document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
      document.getElementById('sidebar').classList.remove('-translate-x-full');
      document.getElementById('sidebar-overlay').classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    });

    document.getElementById('sidebar-overlay')?.addEventListener('click', closeMemberSidebar);
  }
}

// Initialize sidebar
// Store active page for bottom nav updates
let currentMemberActivePage = '';

function initMemberSidebar(activePage = '') {
  currentMemberActivePage = activePage;
  const sidebarPlaceholder = document.getElementById('member-sidebar-placeholder');
  if (sidebarPlaceholder) {
    sidebarPlaceholder.innerHTML = getMemberSidebar(activePage);
    // Margins are handled via CSS in the sidebar output

    // Add mobile bottom navigation bar (initially without admin, will be updated)
    document.getElementById('member-mobile-nav')?.remove();
    const mobileNav = document.createElement('div');
    mobileNav.innerHTML = getMemberBottomNav(activePage, false);
    document.body.appendChild(mobileNav.firstElementChild);

    // Add bottom padding to main content on mobile so it's not hidden behind nav
    const main = document.querySelector('main');
    if (main) {
      main.classList.add('pb-20', 'lg:pb-0');
    }
  }

  // Category toggle listeners
  document.querySelectorAll('[data-category-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const categoryId = btn.getAttribute('data-category-toggle');
      toggleMemberCategory(categoryId);
    });
  });

  // Set initial max-height for expanded categories (those with active page)
  document.querySelectorAll('.category-items').forEach(items => {
    if (items.style.maxHeight !== '0px' && items.style.maxHeight !== '') {
      items.style.maxHeight = items.scrollHeight + 'px';
    }
  });

  // Mobile sidebar toggle
  document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('-translate-x-full');
    document.getElementById('sidebar-overlay').classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  });

  document.getElementById('sidebar-overlay')?.addEventListener('click', closeMemberSidebar);

  // Keyboard shortcut: [ key to toggle sidebar
  document.addEventListener('keydown', (e) => {
    if (e.key === '[' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }
      e.preventDefault();
      toggleMemberSidebar();
    }
  });
}

// Update bottom nav when admin status is known
function updateMemberBottomNav(isAdmin) {
  const existingNav = document.getElementById('member-mobile-nav');
  if (existingNav) {
    existingNav.remove();
  }
  const mobileNav = document.createElement('div');
  mobileNav.innerHTML = getMemberBottomNav(currentMemberActivePage, isAdmin);
  document.body.appendChild(mobileNav.firstElementChild);
}

function closeMemberSidebar() {
  document.getElementById('sidebar').classList.add('-translate-x-full');
  document.getElementById('sidebar-overlay').classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

function openMemberSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) {
    sidebar.classList.remove('-translate-x-full');
    overlay?.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }
}

// Toggle sidebar for mobile "More" button
function toggleMemberMobileSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    const isOpen = !sidebar.classList.contains('-translate-x-full');
    if (isOpen) {
      closeMemberSidebar();
    } else {
      openMemberSidebar();
    }
  }
}

// Update sidebar user info (main function - updates both old and new sections)
function updateSidebarUser(user, userData = {}) {
  // Update old member section (if exists on page)
  const memberAvatar = document.getElementById('member-avatar');
  const memberName = document.getElementById('member-name');
  const memberCredits = document.getElementById('member-credits');

  if (memberName && user) {
    memberName.textContent = user.displayName || user.email?.split('@')[0] || 'Member';
  }

  if (memberAvatar && user) {
    if (user.photoURL) {
      memberAvatar.src = user.photoURL;
    } else {
      memberAvatar.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email || 'User')}&backgroundColor=D71E49`;
    }
  }

  if (memberCredits && userData) {
    const credits = userData.credits;
    if (typeof credits === 'object' && credits?.unlimited) {
      memberCredits.textContent = 'Unlimited';
    } else if (typeof credits === 'object' && credits?.remaining !== undefined) {
      memberCredits.textContent = `${credits.remaining} credits`;
    } else if (typeof credits === 'number') {
      memberCredits.textContent = `${credits} credits`;
    } else {
      memberCredits.textContent = '0 credits';
    }
  }

  // Also update new sidebar user section
  updateSidebarUserInfo(user, userData);
}

// Toggle sidebar user menu
function toggleSidebarUserMenu() {
  const menu = document.getElementById('sidebar-user-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}

// Handle sign out from sidebar
async function handleSidebarSignOut() {
  try {
    // Import Firebase auth
    const { getAuth, signOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const auth = getAuth();
    await signOut(auth);
    localStorage.removeItem('fitbreak_user');
    window.location.href = '/app.html';
  } catch (error) {
    console.error('Sign out error:', error);
    // Fallback - just clear storage and redirect
    localStorage.removeItem('fitbreak_user');
    window.location.href = '/app.html';
  }
}

// Update sidebar user info (called from auth.js)
function updateSidebarUserInfo(user, userData = {}) {
  const avatar = document.getElementById('sidebar-user-avatar');
  const name = document.getElementById('sidebar-user-name');
  const credits = document.getElementById('sidebar-user-credits');

  if (name && user) {
    name.textContent = user.displayName || user.email?.split('@')[0] || 'Member';
  }

  if (avatar && user) {
    if (user.photoURL) {
      avatar.src = user.photoURL;
    } else {
      avatar.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email || 'User')}&backgroundColor=D71E49`;
    }
  }

  if (credits && userData) {
    const userCredits = userData.credits;
    if (typeof userCredits === 'object' && userCredits?.unlimited) {
      credits.textContent = 'Unlimited credits';
    } else if (typeof userCredits === 'object' && userCredits?.remaining !== undefined) {
      credits.textContent = `${userCredits.remaining} credits`;
    } else if (typeof userCredits === 'number') {
      credits.textContent = `${userCredits} credits`;
    } else {
      credits.textContent = '0 credits';
    }
  }
}

// Handle window resize for sidebar margins
// Note: CSS handles margins via media query, this just clears any stale inline styles on resize
function handleMemberSidebarResize() {
  const mainContent = document.querySelector('main');
  const footer = document.querySelector('footer');

  // Clear any inline margin styles - let CSS handle it
  if (mainContent) mainContent.style.marginLeft = '';
  if (footer) footer.style.marginLeft = '';
}

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
  const userSection = document.getElementById('sidebar-user-section');
  const userMenu = document.getElementById('sidebar-user-menu');
  if (userMenu && userSection && !userSection.contains(e.target) && !userMenu.contains(e.target)) {
    userMenu.classList.add('hidden');
  }
});

// Export for module use
if (typeof window !== 'undefined') {
  window.initMemberSidebar = initMemberSidebar;
  window.closeMemberSidebar = closeMemberSidebar;
  window.openMemberSidebar = openMemberSidebar;
  window.toggleMemberMobileSidebar = toggleMemberMobileSidebar;
  window.updateMemberBottomNav = updateMemberBottomNav;
  window.updateSidebarUser = updateSidebarUser;
  window.updateSidebarUserInfo = updateSidebarUserInfo;
  window.toggleMemberSidebar = toggleMemberSidebar;
  window.toggleMemberCategory = toggleMemberCategory;
  window.toggleSidebarUserMenu = toggleSidebarUserMenu;
  window.handleSidebarSignOut = handleSidebarSignOut;
}
