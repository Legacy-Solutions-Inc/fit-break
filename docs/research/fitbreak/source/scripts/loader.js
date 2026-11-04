// Component Loader - Loads reusable header and footer across all pages
// This must be loaded BEFORE any other scripts that depend on header/footer elements

(async function() {
  console.log('Component loader starting...');

  const COMPONENT_VERSION = 'v7';

  async function loadComponent(elementId, componentPath) {
    try {
      // Add cache-busting parameter
      const url = `${componentPath}?${COMPONENT_VERSION}`;
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load ${componentPath}`);
      }
      const html = await response.text();
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = html;
        console.log(`✓ Loaded ${componentPath}`);
      } else {
        console.warn(`Element #${elementId} not found`);
      }
    } catch (error) {
      console.error('Error loading component:', error);
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
  }

  // Load header, footer, and modals in parallel
  await Promise.all([
    loadComponent('header-placeholder', '/components/header.html'),
    loadComponent('footer-placeholder', '/components/footer.html'),
    loadComponent('modals-placeholder', '/components/modals.html')
  ]);

  console.log('✓ All components loaded');

  // Initialize About Us Dropdown
  const aboutBtn = document.getElementById('about-dropdown-btn');
  const aboutMenu = document.getElementById('about-dropdown-menu');

  if (aboutBtn && aboutMenu) {
    aboutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      aboutMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!aboutBtn.contains(e.target) && !aboutMenu.contains(e.target)) {
        aboutMenu.classList.add('hidden');
      }
    });
    console.log('✓ About Us dropdown initialized');
  }

  // Initialize Mobile Menu
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (mobileMenuBtn && mobileMenu) {
    const toggleMobileMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Mobile menu toggled');
      mobileMenu.classList.toggle('hidden');
      menuIcon?.classList.toggle('hidden');
      closeIcon?.classList.toggle('hidden');
    };

    // Add both click and touchend for better mobile support
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    mobileMenuBtn.addEventListener('touchend', (e) => {
      // Prevent double-firing on touch devices
      e.preventDefault();
      toggleMobileMenu(e);
    });
    console.log('✓ Mobile menu initialized');
  } else {
    console.warn('Mobile menu elements not found - btn:', !!mobileMenuBtn, 'menu:', !!mobileMenu);
  }

  // Fallback: delegated event listener for mobile menu (in case direct binding fails)
  document.addEventListener('click', (e) => {
    const menuBtn = e.target.closest('#mobile-menu-btn');
    if (menuBtn) {
      const menu = document.getElementById('mobile-menu');
      const icon = document.getElementById('menu-icon');
      const closeIcn = document.getElementById('close-icon');
      if (menu) {
        console.log('Mobile menu toggled (delegated)');
        menu.classList.toggle('hidden');
        icon?.classList.toggle('hidden');
        closeIcn?.classList.toggle('hidden');
      }
    }
  });

  // Initialize User Profile Dropdown (backup - auth.js also does this)
  const userProfileBtn = document.getElementById('user-profile-btn');
  const userDropdown = document.getElementById('user-dropdown');

  if (userProfileBtn && userDropdown) {
    userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
      console.log('User dropdown toggled');
    });

    document.addEventListener('click', (e) => {
      if (!userProfileBtn.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.add('hidden');
      }
    });
    console.log('✓ User profile dropdown initialized');
  }

  // Dispatch custom event to notify that components are loaded
  // Other scripts (like auth.js) should wait for this event
  document.dispatchEvent(new Event('componentsLoaded'));
})();
