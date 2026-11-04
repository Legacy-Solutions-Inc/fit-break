// Simplified Dashboard - Focus on Payments, Credits, and Classes

import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  getDoc,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import firebaseConfig from './firebase-config-module.js';
import { sanitizeHTML } from './security-utils.js';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, 'asia-db');

// Global state
let currentUser = null;
let userBookings = [];
let dashboardLoaded = false;
let userProfileUnsubscribe = null; // Real-time listener for user profile/credits

// Toast notification
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), duration);
}

// Check auth state and load dashboard
onAuthStateChanged(auth, async (user) => {
  console.log('Auth state changed:', user ? user.email : 'no user');
  if (user) {
    if (!dashboardLoaded) {
      dashboardLoaded = true;
      currentUser = user;
      await loadDashboard(user);
    }
  } else {
    // Clean up real-time listener on logout
    if (userProfileUnsubscribe) {
      userProfileUnsubscribe();
      userProfileUnsubscribe = null;
    }
    window.location.href = '/login.html';
  }
});

// Load dashboard data
async function loadDashboard(user) {
  // Update welcome section
  const welcomeName = document.getElementById('welcome-name');
  const profileName = document.getElementById('profile-name');
  const profileAvatar = document.getElementById('profile-avatar');

  const displayName = user.displayName || user.email.split('@')[0];

  if (welcomeName) welcomeName.textContent = displayName;
  if (profileName) profileName.textContent = displayName;

  if (profileAvatar) {
    if (user.photoURL) {
      profileAvatar.src = user.photoURL;
    } else {
      profileAvatar.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=D71E49`;
    }
  }

  // Load all data in parallel
  try {
    await Promise.all([
      loadUserProfile(user.uid),
      loadUserBookings(user.uid),
      loadPaymentHistory(user.uid)
    ]);

    // Update UI components
    updateCalendarWithBookings();
    updateBookingStats();
    loadUpcomingClasses(user.uid);
    checkBookingReminder(); // Show reminder if credits but no bookings

  } catch (error) {
    console.error('Error loading dashboard:', error);
    showToast('Error loading dashboard data');
  }
}

// Load user profile data with real-time updates
async function loadUserProfile(userId) {
  // Unsubscribe from previous listener if exists
  if (userProfileUnsubscribe) {
    userProfileUnsubscribe();
  }

  const userDocRef = doc(db, 'users', userId);

  // Set up real-time listener for user profile
  userProfileUnsubscribe = onSnapshot(userDocRef, (userDoc) => {
    if (userDoc.exists()) {
      const userData = userDoc.data();
      processUserProfileData(userData, userId);
    }
  }, (error) => {
    console.error('Error in user profile listener:', error);
  });
}

// Process user profile data (called by real-time listener)
function processUserProfileData(userData, userId) {
  // Update sidebar with user info
  if (typeof updateSidebarUser === 'function') {
    updateSidebarUser(currentUser, userData);
  }

  // Credits calculation
  let creditsRemaining = 0;
  let creditsPurchased = 0;
  let creditsUsed = 0;

  if (typeof userData.credits === 'number') {
    creditsRemaining = userData.credits;
  } else if (typeof userData.credits === 'object' && userData.credits !== null) {
    creditsRemaining = userData.credits.remaining || 0;
    creditsPurchased = userData.credits.total || userData.credits.purchased || 0;
    creditsUsed = userData.credits.used || (creditsPurchased - creditsRemaining);
  }
  creditsRemaining = creditsRemaining || userData.creditsRemaining || 0;

  // Update enhanced credits card
  updateCreditsCard(userData, creditsRemaining, creditsPurchased, creditsUsed);

  // User stats in profile card
  const userWeight = document.getElementById('user-weight');
  const userHeight = document.getElementById('user-height');
  const userStreak = document.getElementById('user-streak');

  if (userWeight) userWeight.textContent = userData.weight ? `${userData.weight}kg` : '--';
  if (userHeight) userHeight.textContent = userData.height ? `${userData.height}cm` : '--';
  if (userStreak) userStreak.textContent = userData.activeStreak || 0;

  // Membership badge
  const membershipBadge = document.getElementById('membership-badge');
  if (membershipBadge) {
    if (userData.credits?.unlimited) {
      membershipBadge.textContent = 'Unlimited';
    } else if (creditsRemaining > 0) {
      membershipBadge.textContent = 'Active';
    } else {
      membershipBadge.textContent = 'Member';
    }
  }

  // Check pending payments
  checkPendingPayments(userId);

  // Show phone prompt banner if user has no phone number
  const phonePromptBanner = document.getElementById('phone-prompt-banner');
  if (phonePromptBanner) {
    const hasPhone = userData.phone || userData.phoneNumber;
    if (!hasPhone) {
      phonePromptBanner.classList.remove('hidden');
    } else {
      phonePromptBanner.classList.add('hidden');
    }
  }
}

// Update enhanced credits card
function updateCreditsCard(userData, creditsRemaining, creditsPurchased, creditsUsed) {
  // Available credits
  const availableCredits = document.getElementById('available-credits');
  if (availableCredits) availableCredits.textContent = creditsRemaining;

  // Also update the total credits in profile
  const totalCredits = document.getElementById('total-credits');
  if (totalCredits) totalCredits.textContent = creditsRemaining;

  // Purchased credits
  const purchasedEl = document.getElementById('credits-purchased');
  if (purchasedEl) purchasedEl.textContent = creditsPurchased || creditsRemaining;

  // Used credits
  const usedEl = document.getElementById('credits-used');
  if (usedEl) usedEl.textContent = creditsUsed || 0;

  // Refunded credits
  const refundedEl = document.getElementById('credits-refunded');
  const creditsRefunded = userData.credits?.refunded || userData.creditsRefunded || 0;
  if (refundedEl) refundedEl.textContent = creditsRefunded;

  // Current package
  const currentPackage = document.getElementById('current-package');
  const packageName = userData.currentPackage || userData.lastPackage || 'None';
  if (currentPackage) currentPackage.textContent = packageName;

  // Show Refer Friends card only for package members (not drop-in only)
  const referFriendsCard = document.getElementById('refer-friends-card');
  if (referFriendsCard) {
    // Check if user has purchased a real package (starter, standard, power) - not just drop-in
    const packageLower = packageName.toLowerCase();
    const isPackageMember = packageLower.includes('starter') ||
                            packageLower.includes('standard') ||
                            packageLower.includes('power') ||
                            packageLower.includes('unlimited');
    if (isPackageMember) {
      referFriendsCard.classList.remove('hidden');
    } else {
      referFriendsCard.classList.add('hidden');
    }
  }

  // Last purchase date
  const lastPurchaseDateEl = document.getElementById('last-purchase-date');
  if (lastPurchaseDateEl && userData.lastPurchaseDate) {
    const purchaseDate = userData.lastPurchaseDate.toDate ? userData.lastPurchaseDate.toDate() : new Date(userData.lastPurchaseDate);
    if (!isNaN(purchaseDate.getTime())) {
      lastPurchaseDateEl.textContent = purchaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  // Package expiry
  let expiryDate = null;
  if (userData.creditsExpiryDate) {
    expiryDate = userData.creditsExpiryDate.toDate ? userData.creditsExpiryDate.toDate() : new Date(userData.creditsExpiryDate);
  } else if (userData.credits?.expiryDate) {
    expiryDate = userData.credits.expiryDate.toDate ? userData.credits.expiryDate.toDate() : new Date(userData.credits.expiryDate);
  } else if (userData.lastPurchaseDate) {
    const purchaseDate = userData.lastPurchaseDate.toDate ? userData.lastPurchaseDate.toDate() : new Date(userData.lastPurchaseDate);
    expiryDate = new Date(purchaseDate);
    expiryDate.setDate(expiryDate.getDate() + 30);
  }

  const packageExpiry = document.getElementById('package-expiry');
  const expiringRow = document.getElementById('expiring-credits-row');
  const expiringCount = document.getElementById('expiring-credits-count');
  const expiryDetail = document.getElementById('expiry-date-detail');

  if (expiryDate && !isNaN(expiryDate.getTime())) {
    const daysRemaining = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));

    if (packageExpiry) {
      if (daysRemaining <= 0) {
        packageExpiry.textContent = 'Expired';
        packageExpiry.className = 'text-sm font-medium text-red-600';
      } else if (daysRemaining <= 7) {
        packageExpiry.textContent = `${daysRemaining} days left`;
        packageExpiry.className = 'text-sm font-medium text-amber-600';
      } else {
        packageExpiry.textContent = expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        packageExpiry.className = 'text-sm font-medium text-gray-900';
      }
    }

    // Show expiring credits row if within 14 days
    if (daysRemaining > 0 && daysRemaining <= 14 && creditsRemaining > 0) {
      if (expiringRow) expiringRow.classList.remove('hidden');
      if (expiringCount) expiringCount.textContent = creditsRemaining;
      if (expiryDetail) expiryDetail.textContent = `Expires ${expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else if (expiringRow) {
      expiringRow.classList.add('hidden');
    }
  } else if (packageExpiry) {
    packageExpiry.textContent = '--';
  }

  // Also check booking reminder when credits update
  checkBookingReminder();
}

// Check for pending payments
async function checkPendingPayments(userId) {
  const pendingPaymentAlert = document.getElementById('pending-payment-alert');
  if (!pendingPaymentAlert) return;

  try {
    const paymentsRef = collection(db, 'payments');
    // Simple query without orderBy to avoid composite index requirement
    const pendingQuery = query(
      paymentsRef,
      where('userId', '==', userId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(pendingQuery);

    if (snapshot.empty) {
      pendingPaymentAlert.classList.add('hidden');
      return;
    }

    // Show pending payment alert
    pendingPaymentAlert.classList.remove('hidden');

    const paymentData = snapshot.docs[0].data();
    const pendingMessage = document.getElementById('pending-payment-message');

    if (pendingMessage) {
      const amount = paymentData.amount || 0;
      const packageName = paymentData.packageName || paymentData.packageType || 'credits';
      const credits = paymentData.credits || paymentData.creditsAssigned || 0;
      pendingMessage.innerHTML = `
        <span class="font-medium">₱${amount.toLocaleString()}</span> for ${packageName}<br>
        <span class="text-xs">Payment received • ${credits} credits pending transfer</span>
      `;
    }

  } catch (error) {
    console.error('Error checking pending payments:', error);
    pendingPaymentAlert.classList.add('hidden');
  }
}

// Load payment history
async function loadPaymentHistory(userId) {
  const recentPaymentsList = document.getElementById('recent-payments-list');
  const totalPaymentsAmountEl = document.getElementById('total-payments-amount');
  const totalCreditsAssignedEl = document.getElementById('total-credits-assigned');

  try {
    // Simple query without orderBy to avoid composite index requirement
    const paymentsRef = collection(db, 'payments');
    const paymentsQuery = query(
      paymentsRef,
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(paymentsQuery);

    if (snapshot.empty) {
      if (recentPaymentsList) {
        recentPaymentsList.innerHTML = `
          <div class="text-center py-4 text-gray-400 text-sm">
            <p>No payments yet</p>
            <a href="/payments.html" class="text-brand-500 hover:text-brand-600">Buy credits</a>
          </div>
        `;
      }
      if (totalPaymentsAmountEl) totalPaymentsAmountEl.textContent = '₱0';
      if (totalCreditsAssignedEl) totalCreditsAssignedEl.textContent = '0';
      return;
    }

    let totalAmount = 0;
    let totalCredits = 0;
    const payments = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      let paymentDate = null;
      if (data.createdAt) {
        paymentDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      } else if (data.paidAt) {
        paymentDate = data.paidAt.toDate ? data.paidAt.toDate() : new Date(data.paidAt);
      }
      payments.push({ id: doc.id, ...data, paymentDate });

      // Only count approved payments
      if (data.status === 'approved' || data.status === 'completed' || data.status === 'paid') {
        totalAmount += data.amount || 0;
        totalCredits += data.credits || data.creditsAssigned || 0;
      }
    });

    // Sort by date descending (newest first)
    payments.sort((a, b) => (b.paymentDate || 0) - (a.paymentDate || 0));

    // Update summary
    if (totalPaymentsAmountEl) totalPaymentsAmountEl.textContent = `₱${totalAmount.toLocaleString()}`;
    if (totalCreditsAssignedEl) totalCreditsAssignedEl.textContent = totalCredits;

    // Render recent payments (show last 3)
    if (recentPaymentsList) {
      const recentPayments = payments.slice(0, 3);

      recentPaymentsList.innerHTML = recentPayments.map(payment => {
        // Status colors and labels reflecting the payment workflow
        const statusConfig = {
          'pending': {
            color: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
            label: 'Credit Pending',
            icon: '⏳'
          },
          'pending_verification': {
            color: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
            label: 'Verifying',
            icon: '🔍'
          },
          'approved': {
            color: 'bg-green-100 text-green-700 border border-green-200',
            label: 'Credit Transferred',
            icon: '✓'
          },
          'completed': {
            color: 'bg-green-100 text-green-700 border border-green-200',
            label: 'Credit Transferred',
            icon: '✓'
          },
          'paid': {
            color: 'bg-green-100 text-green-700 border border-green-200',
            label: 'Credit Transferred',
            icon: '✓'
          },
          'rejected': {
            color: 'bg-red-100 text-red-700 border border-red-200',
            label: 'Rejected',
            icon: '✗'
          },
          'failed': {
            color: 'bg-red-100 text-red-700 border border-red-200',
            label: 'Failed',
            icon: '✗'
          }
        };
        const config = statusConfig[payment.status] || { color: 'bg-gray-100 text-gray-700', label: payment.status, icon: '' };

        const dateLabel = payment.paymentDate
          ? payment.paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '--';

        const credits = payment.credits || payment.creditsAssigned || 0;
        const packageName = payment.packageName || payment.packageType || payment.plan || '';
        const paymentMethod = payment.paymentMethod || payment.method || '';
        const refNumber = payment.referenceNumber || payment.refNo || '';

        // Show payment received status for pending payments
        const isPending = payment.status === 'pending' || payment.status === 'pending_verification';
        const isApproved = payment.status === 'approved' || payment.status === 'completed' || payment.status === 'paid';

        return `
          <div class="p-3 ${isPending ? 'bg-yellow-50 border border-yellow-200' : isApproved ? 'bg-green-50 border border-green-200' : 'bg-gray-50'} rounded-lg">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-sm font-bold text-gray-900">₱${(payment.amount || 0).toLocaleString()}</span>
                ${packageName ? `<span class="text-xs text-brand-600 font-medium">${packageName}</span>` : ''}
              </div>
              <span class="px-2 py-0.5 text-xs font-medium rounded-full ${config.color}">${config.icon} ${config.label}</span>
            </div>
            <div class="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
              <span>${dateLabel}</span>
              <span class="${isApproved ? 'text-green-600 font-medium' : ''}">${credits} credit${credits !== 1 ? 's' : ''}${isApproved ? ' added' : isPending ? ' (pending)' : ''}</span>
              ${paymentMethod ? `<span>${paymentMethod}</span>` : ''}
              ${refNumber ? `<span class="text-gray-400">Ref: ${refNumber}</span>` : ''}
            </div>
            ${isPending ? `<p class="text-xs text-yellow-600 mt-2">Payment received - awaiting verification</p>` : ''}
          </div>
        `;
      }).join('');
    }

  } catch (error) {
    console.error('Error loading payment history:', error);
    if (recentPaymentsList) {
      recentPaymentsList.innerHTML = `
        <div class="text-center py-4 text-gray-400 text-sm">
          <p>Error loading payments</p>
        </div>
      `;
    }
  }
}

// Load user bookings
async function loadUserBookings(userId) {
  try {
    const bookingsRef = collection(db, 'bookings');
    const bookingsQuery = query(bookingsRef, where('userId', '==', userId));
    const snapshot = await getDocs(bookingsQuery);

    userBookings = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      let classDate = null;
      const dateField = data.classDate || data.date || data.bookingDate || data.createdAt;
      if (dateField) {
        if (dateField.toDate) {
          classDate = dateField.toDate();
        } else if (dateField.seconds) {
          classDate = new Date(dateField.seconds * 1000);
        } else if (typeof dateField === 'string' || typeof dateField === 'number') {
          classDate = new Date(dateField);
        }
      }
      if (!classDate || isNaN(classDate.getTime())) {
        classDate = data.createdAt?.toDate?.() || new Date();
      }
      userBookings.push({ id: doc.id, ...data, classDate });
    });

    userBookings.sort((a, b) => b.classDate - a.classDate);

    // Update classes count in profile card
    const confirmedBookings = userBookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in' || b.checkedIn);
    const userClassesEl = document.getElementById('user-classes');
    if (userClassesEl) {
      userClassesEl.textContent = confirmedBookings.length;
    }
  } catch (error) {
    console.error('Error loading bookings:', error);
  }
}

// Update calendar with booking dates
function updateCalendarWithBookings() {
  const booked = [];
  const attended = [];
  const bookingDetails = {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  userBookings.forEach(b => {
    const d = b.classDate;
    if (!d || isNaN(d.getTime())) return;

    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // Check if date is in the past
    const classDateOnly = new Date(d);
    classDateOnly.setHours(0, 0, 0, 0);
    const isPast = classDateOnly < today;

    // Store booking details for tooltip
    if (!bookingDetails[dateKey]) bookingDetails[dateKey] = [];
    bookingDetails[dateKey].push({
      className: b.className,
      classTime: b.classTime,
      status: b.status
    });

    // Only mark as attended if it's in the past AND checked in
    if ((b.status === 'checked_in' || b.checkedIn) && isPast) {
      if (!attended.includes(dateKey)) attended.push(dateKey);
    } else if (b.status === 'confirmed' || b.status === 'checked_in') {
      // Future bookings (even if checked_in status was set incorrectly) show as booked
      if (!booked.includes(dateKey)) booked.push(dateKey);
    }
  });

  // Update global calendar data
  window.calendarBookings = { booked, attended };
  window.calendarBookingDetails = bookingDetails;

  // Re-render calendar
  if (typeof renderCalendar === 'function') {
    renderCalendar();
  }
}

// Update booking stats
function updateBookingStats() {
  const now = new Date();
  const upcoming = userBookings.filter(b => b.classDate >= now && b.status === 'confirmed');
  const attended = userBookings.filter(b => b.status === 'checked_in' || b.checkedIn);
  const cancelled = userBookings.filter(b => b.status === 'cancelled');

  const upcomingEl = document.getElementById('bookings-upcoming');
  const attendedEl = document.getElementById('bookings-attended');
  const cancelledEl = document.getElementById('bookings-cancelled');

  if (upcomingEl) upcomingEl.textContent = upcoming.length;
  if (attendedEl) attendedEl.textContent = attended.length;
  if (cancelledEl) cancelledEl.textContent = cancelled.length;

  // Credits used this month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const creditsThisMonth = userBookings.filter(b => {
    return b.classDate >= startOfMonth && (b.status === 'confirmed' || b.status === 'checked_in');
  }).length;

  const creditsUsedMonth = document.getElementById('credits-used-month');
  if (creditsUsedMonth) creditsUsedMonth.textContent = creditsThisMonth;
}

// Render upcoming bookings list
function renderUpcomingBookingsList() {
  const container = document.getElementById('upcoming-bookings-list');
  if (!container) return;

  const now = new Date();
  const upcoming = userBookings
    .filter(b => b.classDate >= now && b.status === 'confirmed')
    .sort((a, b) => a.classDate - b.classDate)
    .slice(0, 5);

  if (upcoming.length === 0) {
    container.innerHTML = `
      <div class="text-center py-6">
        <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <p class="text-gray-500">No upcoming bookings</p>
        <a href="/bookings.html" class="text-brand-500 hover:text-brand-600 text-sm font-medium mt-2 inline-block">Book a class</a>
      </div>
    `;
    return;
  }

  container.innerHTML = upcoming.map(booking => {
    const isToday = booking.classDate.toDateString() === now.toDateString();
    const isTomorrow = booking.classDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();

    let dateLabel = booking.classDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    if (isToday) dateLabel = 'Today';
    if (isTomorrow) dateLabel = 'Tomorrow';

    const timeLabel = booking.classTime || booking.classDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const daysUntil = Math.ceil((booking.classDate - now) / (1000 * 60 * 60 * 24));

    return `
      <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
        <div class="flex-shrink-0 w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
          <svg class="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900 truncate">${booking.className}</p>
          <p class="text-sm text-gray-500">${dateLabel} ${timeLabel ? '• ' + timeLabel : ''}</p>
        </div>
        <div class="flex-shrink-0">
          ${isToday ? '<span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Today</span>' : ''}
          ${!isToday ? `<span class="text-sm text-gray-400">${daysUntil}d</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Load upcoming classes for "My Classes" section with enhanced details and attendance status
async function loadUpcomingClasses(userId) {
  const container = document.getElementById('upcoming-classes');
  const todayEl = document.getElementById('schedule-today');

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  // Categorize bookings: Upcoming, Attended, Missed
  const upcoming = [];
  const attended = [];
  const missed = [];

  userBookings.forEach(b => {
    if (b.status === 'cancelled') return;

    const isPast = b.classDate < todayStart;
    const isCheckedIn = b.status === 'checked_in' || b.checkedIn === true;

    if (isPast) {
      if (isCheckedIn) {
        attended.push(b);
      } else if (b.status === 'confirmed') {
        missed.push(b);
      }
    } else if (b.status === 'confirmed' || isCheckedIn) {
      upcoming.push(b);
    }
  });

  // Sort: upcoming by date ascending, past by date descending
  upcoming.sort((a, b) => a.classDate - b.classDate);
  attended.sort((a, b) => b.classDate - a.classDate);
  missed.sort((a, b) => b.classDate - a.classDate);

  // Update today's count
  const todayBookings = upcoming.filter(b => b.classDate >= todayStart && b.classDate < todayEnd);
  if (todayEl) todayEl.textContent = todayBookings.length;

  if (!container) return;

  // Build combined list: first upcoming (up to 3), then recent history (up to 2)
  const upcomingToShow = upcoming.slice(0, 3);
  const historyToShow = [...attended, ...missed].sort((a, b) => b.classDate - a.classDate).slice(0, 2);

  if (upcomingToShow.length === 0 && historyToShow.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4 text-gray-400 text-sm">
        <svg class="w-10 h-10 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <p>No classes yet</p>
        <p class="text-xs mt-1">Book a class to get started!</p>
      </div>
    `;
    return;
  }

  let html = '';

  // Render upcoming classes
  if (upcomingToShow.length > 0) {
    html += `<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Upcoming</p>`;
    html += upcomingToShow.map(booking => renderBookingCard(booking, now, 'upcoming')).join('');
  }

  // Render recent history
  if (historyToShow.length > 0) {
    html += `<p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 ${upcomingToShow.length > 0 ? 'mt-4' : ''}">Recent History</p>`;
    html += historyToShow.map(booking => {
      const isCheckedIn = booking.status === 'checked_in' || booking.checkedIn === true;
      return renderBookingCard(booking, now, isCheckedIn ? 'attended' : 'missed');
    }).join('');
  }

  container.innerHTML = html;
}

// Render a booking card with status
function renderBookingCard(booking, now, status) {
  const date = booking.classDate;
  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === new Date(now.getTime() + 86400000).toDateString();

  let dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  if (isToday) dateLabel = 'Today';
  if (isTomorrow) dateLabel = 'Tomorrow';

  const timeLabel = booking.classTime || date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const instructor = booking.instructor || 'Coach Iren';
  const daysUntil = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

  // Status configuration
  const statusConfig = {
    upcoming: {
      bg: isToday ? 'bg-green-50 border border-green-200' : 'bg-gray-50',
      icon: isToday ? 'bg-green-100' : 'bg-brand-100',
      iconText: isToday ? 'text-green-600' : 'text-brand-600',
      iconBold: isToday ? 'text-green-700' : 'text-brand-700',
      badge: isToday ? '<span class="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">Today</span>' :
             `<span class="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs font-medium rounded-full">Upcoming</span>`
    },
    attended: {
      bg: 'bg-gray-100 border border-gray-200',
      icon: 'bg-gray-300',
      iconText: 'text-gray-600',
      iconBold: 'text-gray-700',
      badge: '<span class="px-2 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full">✓ Attended</span>'
    },
    missed: {
      bg: 'bg-red-50 border border-red-200',
      icon: 'bg-red-100',
      iconText: 'text-red-600',
      iconBold: 'text-red-700',
      badge: '<span class="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">Missed</span>'
    }
  };

  const config = statusConfig[status];

  return `
    <div class="p-3 ${config.bg} rounded-xl mb-2">
      <div class="flex items-start gap-3">
        <div class="flex-shrink-0 w-12 h-12 ${config.icon} rounded-xl flex flex-col items-center justify-center">
          <span class="text-xs font-bold ${config.iconText}">${date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</span>
          <span class="text-lg font-bold ${config.iconBold}">${date.getDate()}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <p class="font-semibold ${status === 'attended' ? 'text-gray-600' : 'text-gray-900'} text-sm truncate">${booking.className}</p>
            ${config.badge}
          </div>
          <p class="text-xs text-gray-500 mt-0.5">${dateLabel} • ${timeLabel}</p>
          <p class="text-xs text-gray-400 mt-0.5">${instructor}</p>
        </div>
      </div>
    </div>
  `;
}

// Handle calendar day click
window.handleDayClick = function(dateKey) {
  const bookingsForDay = userBookings.filter(b => {
    const d = b.classDate;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return key === dateKey;
  });

  if (bookingsForDay.length > 0) {
    const booking = bookingsForDay[0];
    showToast(`${booking.className} - ${booking.status === 'checked_in' ? 'Attended' : 'Booked'}`);
  }
};

// Sign out handler
document.getElementById('btn-sign-out')?.addEventListener('click', async () => {
  try {
    await signOut(auth);
    showToast('Signed out successfully');
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Error signing out:', error);
    showToast('Error signing out');
  }
});

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

const searchInput = document.getElementById('dashboard-search');
const searchResults = document.getElementById('search-results');

if (searchInput && searchResults) {
  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim().toLowerCase();

    if (query.length < 2) {
      searchResults.classList.add('hidden');
      return;
    }

    searchTimeout = setTimeout(() => performSearch(query), 300);
  });

  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length >= 2) {
      searchResults.classList.remove('hidden');
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add('hidden');
    }
  });
}

async function performSearch(query) {
  if (!currentUser) return;

  const results = [];

  // Search classes
  const classTypes = [
    { name: 'Total Body Burn', day: 'Monday', href: '/bookings.html' },
    { name: 'Tone & Tighten', day: 'Tuesday', href: '/bookings.html' },
    { name: 'Cardio Crush', day: 'Wednesday', href: '/bookings.html' },
    { name: 'Sculpt & Strength', day: 'Thursday', href: '/bookings.html' },
    { name: 'Core & Balance', day: 'Friday', href: '/bookings.html' },
    { name: 'Booty & Burn', day: 'Saturday', href: '/bookings.html' }
  ];

  classTypes.forEach(cls => {
    if (cls.name.toLowerCase().includes(query)) {
      results.push({ type: 'class', title: cls.name, subtitle: cls.day, href: cls.href });
    }
  });

  // Search pages
  const pages = [
    { name: 'My Profile', href: '/profile.html' },
    { name: 'Settings', href: '/settings.html' },
    { name: 'Bookings', href: '/bookings.html' },
    { name: 'Payments', href: '/payments.html' },
    { name: 'Schedule', href: '/schedule.html' },
    { name: 'Statistics', href: '/statistics.html' },
    { name: 'Pricing', href: '/pricing.html' }
  ];

  pages.forEach(page => {
    if (page.name.toLowerCase().includes(query)) {
      results.push({ type: 'page', title: page.name, subtitle: 'Page', href: page.href });
    }
  });

  // Search user bookings
  userBookings.forEach(booking => {
    if (booking.className?.toLowerCase().includes(query)) {
      results.push({
        type: 'booking',
        title: booking.className,
        subtitle: `Booked for ${booking.classDate.toLocaleDateString()}`,
        href: '/bookings.html'
      });
    }
  });

  // Display results
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="p-4 text-center text-gray-500 text-sm">No results found</div>';
  } else {
    searchResults.innerHTML = results.slice(0, 6).map(r => `
      <a href="${r.href}" class="flex items-center gap-3 p-3 hover:bg-gray-50 transition">
        <div class="w-8 h-8 rounded-lg ${r.type === 'class' ? 'bg-brand-100 text-brand-600' : r.type === 'booking' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'} flex items-center justify-center">
          ${r.type === 'class' ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>' :
            r.type === 'booking' ? '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>' :
            '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>'}
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">${r.title}</p>
          <p class="text-xs text-gray-500">${r.subtitle}</p>
        </div>
      </a>
    `).join('');
  }

  searchResults.classList.remove('hidden');
}

// Check if user has credits but no upcoming bookings and show reminder
function checkBookingReminder() {
  const reminderEl = document.getElementById('book-class-reminder');
  if (!reminderEl) return;

  // Get credits from the displayed value (updated by real-time listener)
  const creditsEl = document.getElementById('available-credits');
  const credits = creditsEl ? parseInt(creditsEl.textContent) || 0 : 0;

  // Check for upcoming confirmed bookings
  const now = new Date();
  const hasUpcoming = userBookings.some(b =>
    b.classDate >= now && (b.status === 'confirmed' || b.status === 'booked')
  );

  // Show reminder if: has credits AND no upcoming bookings
  if (credits > 0 && !hasUpcoming) {
    reminderEl.classList.remove('hidden');
    console.log('[Dashboard] Showing booking reminder - has credits but no upcoming bookings');
  } else {
    reminderEl.classList.add('hidden');
  }
}

console.log('Dashboard.js loaded');
