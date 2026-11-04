// Bookings and Schedule Module
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  Timestamp,
  doc,
  updateDoc,
  deleteDoc,
  increment,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js';
import firebaseConfig from './firebase-config-module.js';

// Initialize Firebase (use existing app if already initialized)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, 'asia-db');
const functions = getFunctions(app, 'asia-east2');

// Cloud Functions for secure credit operations
const deductCreditFn = httpsCallable(functions, 'deductCredit');
const refundCreditFn = httpsCallable(functions, 'refundCredit');

// Class schedule data - 4 sessions per day
const classSchedule = {
  Monday: { name: 'Total Body Burn', description: 'Full-body strength & endurance', times: ['06:30', '09:00', '16:30', '18:00', '19:30'] },
  Tuesday: { name: 'Tone & Tighten', description: 'Lower body & core shaping', times: ['06:30', '09:00', '16:30', '18:00', '19:30'] },
  Wednesday: { name: 'Cardio Crush', description: 'HIIT-style conditioning', times: ['06:30', '09:00', '16:30', '18:00', '19:30'] },
  Thursday: { name: 'Sculpt & Strength', description: 'Upper body & posture', times: ['06:30', '09:00', '16:30', '18:00', '19:30'] },
  Friday: { name: 'Core & Balance', description: 'Abs, stability & coordination', times: ['06:30', '09:00', '16:30', '18:00', '19:30'] },
  Saturday: { name: 'Booty & Burn', description: 'Glutes & endurance', times: ['06:30', '09:00', '16:30', '18:00', '19:30'] }
};

// Format time from 24h to 12h AM/PM
function formatTime(time24) {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

// Format date to YYYY-MM-DD in LOCAL timezone (not UTC!)
function formatDateLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Toast notification
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), duration);
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Check auth
  onAuthStateChanged(auth, (user) => {
    if (user) {
      updateUserInfo(user);
      renderSchedule();
      loadUserBookings(user.uid);
      initBookingForm();
    } else {
      window.location.href = '/login.html';
    }
  });

  // Setup event listeners
  setupEventListeners();
}

// Update user info in header and sidebar
async function updateUserInfo(user) {
  const userNameEl = document.getElementById('user-name');
  const userEmailEl = document.getElementById('user-email');
  const userAvatarEl = document.getElementById('user-avatar');

  if (userNameEl) userNameEl.textContent = user.displayName || user.email.split('@')[0];
  if (userEmailEl) userEmailEl.textContent = user.email;
  if (userAvatarEl) {
    if (user.photoURL) {
      userAvatarEl.src = user.photoURL;
    } else {
      userAvatarEl.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email)}&backgroundColor=e64a8a`;
    }
  }

  // Update sidebar
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && typeof updateSidebarUser === 'function') {
      updateSidebarUser(user, userDoc.data());
    }
  } catch (error) {
    console.error('Error loading user data for sidebar:', error);
  }
}

// Render weekly schedule
function renderSchedule() {
  const scheduleContainer = document.getElementById('weekly-schedule');
  if (!scheduleContainer) return;

  scheduleContainer.innerHTML = '';

  // Sort classes by next available date (chronologically)
  const sortedClasses = Object.entries(classSchedule)
    .map(([day, classInfo]) => ({
      day,
      classInfo,
      nextDate: getNextClassDate(day, classInfo.times[0])
    }))
    .sort((a, b) => a.nextDate - b.nextDate);

  sortedClasses.forEach(({ day, classInfo }) => {
    const dayCard = createDayCard(day, classInfo);
    scheduleContainer.appendChild(dayCard);
  });
}

// Create day card
function createDayCard(day, classInfo) {
  const classDate = getNextClassDate(day, classInfo.times[0]);
  const dateLabel = classDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const card = document.createElement('div');
  card.className = 'bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all';

  // Class name as clickable link (moved to top/left)
  const titleLink = document.createElement('a');
  titleLink.href = '/app.html#programs';
  titleLink.className = 'text-xl font-bold text-brand-600 hover:text-brand-700 hover:underline mb-1 block';
  titleLink.textContent = classInfo.name;

  const dayBadge = document.createElement('span');
  dayBadge.className = 'inline-block px-3 py-1 bg-brand-100 text-brand-700 text-xs font-bold rounded-full mb-3';
  dayBadge.textContent = `${day} • Next: ${dateLabel}`;

  const desc = document.createElement('p');
  desc.className = 'text-gray-600 text-sm mb-4';
  desc.textContent = classInfo.description;

  const timesDiv = document.createElement('div');
  timesDiv.className = 'space-y-2';

  classInfo.times.forEach(time => {
    const timeButton = document.createElement('button');
    timeButton.className = 'w-full px-4 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-[1.02]';
    timeButton.textContent = `Book ${formatTime(time)}`;
    timeButton.onclick = () => openBookingModal(day, classInfo.name, time);
    timesDiv.appendChild(timeButton);
  });

  card.appendChild(titleLink);
  card.appendChild(dayBadge);
  card.appendChild(desc);
  card.appendChild(timesDiv);

  return card;
}

// Open booking modal
function openBookingModal(day, className, time) {
  const modal = document.getElementById('modal-book-class');
  if (!modal) {
    // Create a simple confirmation
    const confirmed = confirm(`Book ${className} on ${day} at ${time}?`);
    if (confirmed) {
      bookClass(day, className, time);
    }
    return;
  }

  document.getElementById('booking-day').textContent = day;
  document.getElementById('booking-class-name').textContent = className;
  document.getElementById('booking-time').textContent = time;
  
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Store booking data
  modal.dataset.day = day;
  modal.dataset.className = className;
  modal.dataset.time = time;
}

// Close booking modal
function closeBookingModal() {
  const modal = document.getElementById('modal-book-class');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Book a class
async function bookClass(day, className, time) {
  const user = auth.currentUser;
  if (!user) {
    showToast('Please sign in to book a class');
    return;
  }

  try {
    // Check user credits first
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    const userCredits = userData.credits?.remaining || 0;

    // Check if credits have expired
    const creditsExpiresAt = userData.credits?.expiresAt;
    if (creditsExpiresAt) {
      const expiryDate = creditsExpiresAt.toDate ? creditsExpiresAt.toDate() : new Date(creditsExpiresAt);
      if (expiryDate < new Date()) {
        showToast('Your credits have expired. Please purchase a new package.');
        setTimeout(() => {
          window.location.href = '/pricing.html';
        }, 2000);
        return;
      }
    }

    if (userCredits < 1) {
      showToast('Insufficient credits. Please purchase a package to book classes.');
      setTimeout(() => {
        window.location.href = '/pricing.html';
      }, 2000);
      return;
    }

    // Calculate the next occurrence of this day
    const classDate = getNextClassDate(day, time);
    const dateStr = formatDateLocal(classDate); // YYYY-MM-DD format (local timezone)

    // Calculate end time (classes are 60 minutes)
    const [startHour, startMin] = time.split(':').map(Number);
    const endHour = startHour + 1;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;

    // Add booking to Firestore with standardized structure
    const bookingRef = await addDoc(collection(db, 'bookings'), {
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || user.email.split('@')[0],
      // Class identification
      classId: `${day.toLowerCase()}_${time.replace(':', '')}`, // Generated ID for consistency
      className: className,
      instructor: 'Coach Iren',
      // Date/Time fields (both formats for compatibility)
      classDate: Timestamp.fromDate(classDate), // Timestamp format
      date: dateStr,                            // String format (YYYY-MM-DD)
      classDay: day,                            // Day name (e.g., "Monday")
      dayOfWeek: day.toLowerCase(),             // Lowercase day (e.g., "monday")
      classTime: time,                          // Start time
      startTime: time,                          // Alias for compatibility
      endTime: endTime,                         // Calculated end time
      duration: 60,                             // Duration in minutes
      // Booking metadata
      status: 'confirmed',
      creditsUsed: 1,
      createdAt: Timestamp.now()
    });

    // Deduct credit via secure Cloud Function (handles audit logging)
    try {
      await deductCreditFn({
        bookingId: bookingRef.id,
        className: className,
        classDay: day,
        classTime: time,
        classDate: dateStr,
        creditsRequired: 1
      });
    } catch (creditError) {
      // If credit deduction fails, delete the booking and show error
      console.error('Credit deduction failed:', creditError);
      await deleteDoc(doc(db, 'bookings', bookingRef.id));
      const errorMsg = creditError.message || 'Failed to deduct credit';
      showToast(errorMsg, 'error');
      return;
    }

    // Add activity
    await addDoc(collection(db, 'activity'), {
      userId: user.uid,
      type: 'booking',
      title: 'Class Booked',
      description: `${className} on ${day} at ${time}`,
      timestamp: Timestamp.now()
    });

    showToast('Class booked successfully! 🎉');
    closeBookingModal();
    loadUserBookings(user.uid);
  } catch (error) {
    console.error('Error booking class:', error);
    showToast('Error booking class. Please try again.');
  }
}

// Get next class date (returns dates >= Jan 9, 2026)
function getNextClassDate(day, time) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDay = days.indexOf(day);
  const openingDate = new Date('2026-01-09T00:00:00');

  // Start from today or opening date, whichever is later
  let startDate = new Date();
  if (startDate < openingDate) {
    startDate = new Date(openingDate);
  }

  const currentDay = startDate.getDay();

  let daysUntilClass = targetDay - currentDay;
  if (daysUntilClass < 0) daysUntilClass += 7;
  if (daysUntilClass === 0) {
    // Check if time has passed
    const [hours, minutes] = time.split(':');
    const classTime = new Date(startDate);
    classTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    if (classTime < new Date()) daysUntilClass = 7;
  }

  const classDate = new Date(startDate);
  classDate.setDate(startDate.getDate() + daysUntilClass);
  const [hours, minutes] = time.split(':');
  classDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  return classDate;
}

// Load user bookings
async function loadUserBookings(userId) {
  const container = document.getElementById('my-bookings-list');
  if (!container) return;

  try {
    console.log('Loading bookings for user:', userId);
    const bookingsRef = collection(db, 'bookings');
    
    // First try with orderBy - if it fails due to missing index, try without
    let snapshot;
    try {
      const bookingsQuery = query(
        bookingsRef,
        where('userId', '==', userId),
        orderBy('classDate', 'desc')
      );
      snapshot = await getDocs(bookingsQuery);
    } catch (indexError) {
      console.warn('Index not available, loading without ordering:', indexError);
      // Fallback: load without orderBy
      const bookingsQuery = query(
        bookingsRef,
        where('userId', '==', userId)
      );
      snapshot = await getDocs(bookingsQuery);
    }

    console.log('Found', snapshot.size, 'bookings');

    if (snapshot.empty) {
      container.innerHTML = '<div class="text-center py-8 text-gray-500">No bookings yet. Book your first class!</div>';
      return;
    }

    container.innerHTML = '';
    const now = new Date();

    // Convert to array and sort manually if needed
    const bookings = [];
    snapshot.forEach(doc => {
      bookings.push({ id: doc.id, data: doc.data() });
    });

    // Sort by classDate manually
    bookings.sort((a, b) => {
      const dateA = a.data.classDate?.toDate() || new Date();
      const dateB = b.data.classDate?.toDate() || new Date();
      return dateB - dateA; // desc
    });

    // Render sorted bookings
    bookings.forEach(({ id, data }) => {
      const bookingCard = createBookingCard(id, data, now);
      container.appendChild(bookingCard);
    });
  } catch (error) {
    console.error('Error loading bookings:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    container.innerHTML = `<div class="text-center py-8 text-red-500">
      <p>Error loading bookings</p>
      <p class="text-sm mt-2">${error.message}</p>
      <button onclick="location.reload()" class="mt-4 px-4 py-2 bg-brand-500 text-white rounded-lg">Retry</button>
    </div>`;
  }
}

// Create booking card
function createBookingCard(bookingId, booking, now) {
  // Handle classDate - could be Firestore Timestamp, Date, string, or undefined
  let classDate;
  if (booking.classDate?.toDate) {
    classDate = booking.classDate.toDate();
  } else if (booking.classDate instanceof Date) {
    classDate = booking.classDate;
  } else if (booking.classDate) {
    classDate = new Date(booking.classDate);
  } else {
    // Fallback to current date if classDate is missing
    classDate = new Date();
  }

  // Combine classDate with classTime to get actual start time
  // (classDate might only have the date portion, not the time)
  const classTime = booking.classTime || booking.startTime || '00:00';
  const [hours, minutes] = classTime.split(':').map(Number);
  const classStartTime = new Date(classDate);
  classStartTime.setHours(hours, minutes, 0, 0);

  // QR code visibility window:
  // - Show QR starting 24 hours BEFORE class (so members can screenshot/download in advance)
  // - Keep showing until 4 hours AFTER class starts (for late arrivals)
  const earlyWindow = 24 * 60 * 60 * 1000; // 24 hours before
  const lateWindow = 4 * 60 * 60 * 1000; // 4 hours after class starts
  const qrStartTime = new Date(classStartTime.getTime() - earlyWindow);
  const qrCutoffTime = new Date(classStartTime.getTime() + lateWindow);

  // Class is "past" for display purposes once it has started
  const isPast = classStartTime < now;
  const isToday = classStartTime.toDateString() === now.toDateString();

  // QR code visible from 24h before until 4h after class
  // For same-day classes where classTime might be missing, show QR all day
  const isSameDay = classDate.toDateString() === now.toDateString();
  const canShowQR = isSameDay || (now >= qrStartTime && now < qrCutoffTime);

  const card = document.createElement('div');
  card.className = `bg-white rounded-2xl p-6 border border-gray-100 shadow-sm ${isPast ? 'opacity-60' : ''}`;

  const header = document.createElement('div');
  header.className = 'flex items-start justify-between mb-4';

  const info = document.createElement('div');
  const className = document.createElement('h3');
  className.className = 'text-lg font-bold text-gray-900';
  className.textContent = booking.className;

  const dateTime = document.createElement('p');
  dateTime.className = 'text-sm text-gray-600 mt-1';
  dateTime.textContent = `${booking.classDay}, ${classDate.toLocaleDateString()} at ${formatTime(booking.classTime || booking.startTime || '00:00')}`;

  // Check-in status
  if (booking.checkedIn && booking.checkInTime) {
    let checkInDate;
    if (booking.checkInTime?.toDate) {
      checkInDate = booking.checkInTime.toDate();
    } else if (booking.checkInTime instanceof Date) {
      checkInDate = booking.checkInTime;
    } else {
      checkInDate = new Date(booking.checkInTime);
    }

    const checkinStatus = document.createElement('p');
    checkinStatus.className = 'text-sm text-green-600 mt-1 flex items-center gap-1';
    checkinStatus.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      Checked in at ${checkInDate.toLocaleTimeString()}
    `;
    info.appendChild(checkinStatus);
  }

  info.appendChild(className);
  info.appendChild(dateTime);

  const badge = document.createElement('span');
  badge.className = `px-3 py-1 text-xs font-bold rounded-full ${
    isPast ? 'bg-gray-100 text-gray-600' :
    isToday ? 'bg-green-100 text-green-700' :
    'bg-blue-100 text-blue-700'
  }`;
  badge.textContent = isPast ? 'Completed' : isToday ? 'Today' : 'Upcoming';

  header.appendChild(info);
  header.appendChild(badge);

  card.appendChild(header);

  // QR Code visible until class ENDS (not checked in yet)
  // This allows late arrivals to still check in during the class
  if (canShowQR && !booking.checkedIn) {
    const qrSection = document.createElement('div');
    qrSection.className = 'bg-gray-50 rounded-lg p-4 mb-4';
    qrSection.innerHTML = `
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold text-gray-700">Check-In QR Code</h4>
        <button onclick="window.showQRModal('${bookingId}')" class="text-sm text-pink-600 hover:text-pink-700 font-medium">
          View Full Size
        </button>
      </div>
      <div class="flex items-center gap-4">
        <div id="qr-${bookingId}" class="bg-white p-2 rounded"></div>
        <div class="flex-1 text-sm text-gray-600">
          <p>Show this QR code when you arrive at the studio for quick check-in.</p>
        </div>
      </div>
    `;
    card.appendChild(qrSection);

    // Generate QR code
    setTimeout(() => generateQRCode(bookingId), 100);
  }

  // Actions
  if (!isPast && !booking.checkedIn) {
    const actions = document.createElement('div');
    actions.className = 'flex flex-col gap-2';

    const buttonsRow = document.createElement('div');
    buttonsRow.className = 'flex gap-2';

    // Calculate time until class for 2-hour cancellation rule
    const classTime = booking.classTime || booking.startTime || '06:00';
    const [hours, minutes] = classTime.split(':').map(Number);
    const classDateTime = new Date(classDate);
    classDateTime.setHours(hours, minutes, 0, 0);
    const hoursUntilClass = (classDateTime - now) / (1000 * 60 * 60);
    const canCancel = hoursUntilClass >= 2;

    const rescheduleBtn = document.createElement('button');
    rescheduleBtn.className = 'px-4 py-2 text-sm font-semibold text-brand-600 hover:bg-brand-50 rounded-lg transition-colors';
    rescheduleBtn.textContent = 'Reschedule';
    rescheduleBtn.onclick = () => openRescheduleModal(bookingId, booking);

    const cancelBtn = document.createElement('button');
    if (canCancel) {
      cancelBtn.className = 'px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors';
      cancelBtn.textContent = 'Cancel Booking';
      cancelBtn.onclick = () => cancelBooking(bookingId, booking, classDateTime);
    } else {
      // Disable cancel button when less than 2 hours before class
      cancelBtn.className = 'px-4 py-2 text-sm font-semibold text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed';
      cancelBtn.textContent = 'Cancel Booking';
      cancelBtn.disabled = true;
      cancelBtn.title = 'Cancellation not available within 2 hours of class';
    }

    buttonsRow.appendChild(rescheduleBtn);
    buttonsRow.appendChild(cancelBtn);
    actions.appendChild(buttonsRow);

    // Show warning message if cancellation is disabled
    if (!canCancel) {
      const warning = document.createElement('p');
      warning.className = 'text-xs text-gray-500 mt-1';
      const minutesUntil = Math.max(0, Math.floor(hoursUntilClass * 60));
      warning.textContent = `⚠️ Cancellation not available within 2 hours of class (${minutesUntil} min remaining)`;
      actions.appendChild(warning);
    }

    card.appendChild(actions);
  }

  return card;
}

// Cancel booking with 2-hour rule validation
async function cancelBooking(bookingId, booking, classDateTime) {
  // Server-side validation: Check 2-hour cancellation rule
  const now = new Date();

  // If classDateTime wasn't passed, calculate it
  if (!classDateTime) {
    let classDate;
    if (booking.classDate?.toDate) {
      classDate = booking.classDate.toDate();
    } else if (booking.classDate instanceof Date) {
      classDate = booking.classDate;
    } else if (booking.classDate) {
      classDate = new Date(booking.classDate);
    } else {
      classDate = new Date();
    }
    const classTime = booking.classTime || booking.startTime || '06:00';
    const [hours, minutes] = classTime.split(':').map(Number);
    classDateTime = new Date(classDate);
    classDateTime.setHours(hours, minutes, 0, 0);
  }

  const hoursUntilClass = (classDateTime - now) / (1000 * 60 * 60);

  if (hoursUntilClass < 2) {
    showToast('Cancellation not allowed within 2 hours of class start time', 'error');
    return;
  }

  if (!confirm('Are you sure you want to cancel this booking? Your credit will be refunded.')) return;

  try {
    // Refund credit via secure Cloud Function (handles audit logging)
    // This must happen BEFORE deleting the booking as the function verifies ownership
    const creditsToRefund = booking.creditsUsed || 1;
    await refundCreditFn({
      bookingId: bookingId,
      creditsToRefund: creditsToRefund,
      className: booking.className,
      classDay: booking.classDay || booking.date
    });

    // Delete the booking after successful refund
    await deleteDoc(doc(db, 'bookings', bookingId));

    // Add activity
    await addDoc(collection(db, 'activity'), {
      userId: auth.currentUser.uid,
      type: 'cancellation',
      title: 'Booking Cancelled',
      description: `${booking.className} on ${booking.classDay || booking.date} - ${creditsToRefund} credit refunded`,
      timestamp: Timestamp.now()
    });

    showToast('Booking cancelled. Your credit has been refunded.');
    loadUserBookings(auth.currentUser.uid);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    const errorMsg = error.message || 'Error cancelling booking';
    showToast(errorMsg, 'error');
  }
}

// Class names by day (for reschedule)
const classNamesByDay = {
  'monday': 'Total Body Burn',
  'tuesday': 'Tone & Tighten',
  'wednesday': 'Cardio Crush',
  'thursday': 'Sculpt & Strength',
  'friday': 'Core & Balance',
  'saturday': 'Booty & Burn'
};

// Max class capacity
const MAX_CLASS_CAPACITY = 20;

// Open reschedule modal
async function openRescheduleModal(bookingId, booking) {
  // Create modal if it doesn't exist
  let modal = document.getElementById('reschedule-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'reschedule-modal';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm hidden items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-brand-50 to-brand-100">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Reschedule Class</h2>
            <p class="text-sm text-gray-600" id="reschedule-current">Current booking info</p>
          </div>
          <button onclick="closeRescheduleModal()" class="p-2 hover:bg-gray-200 rounded-full transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6 overflow-y-auto flex-1" id="reschedule-slots">
          <p class="text-center text-gray-500">Loading available slots...</p>
        </div>
      </div>
    `;
    modal.onclick = (e) => { if (e.target === modal) closeRescheduleModal(); };
    document.body.appendChild(modal);
  }

  // Store booking info
  modal.dataset.bookingId = bookingId;
  modal.dataset.booking = JSON.stringify(booking);

  // Update current booking info (handle both old and new booking formats)
  const bookingDate = booking.date || (booking.classDate?.toDate ?
    formatDateLocal(booking.classDate.toDate()) :
    formatDateLocal(new Date()));
  const bookingTime = booking.startTime || booking.classTime || '00:00';
  document.getElementById('reschedule-current').textContent =
    `${booking.className} - ${bookingDate} at ${formatTimeDisplay(bookingTime)}`;

  // Show modal
  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Load available slots
  await loadAvailableSlots(bookingId, booking);
}

// Close reschedule modal
function closeRescheduleModal() {
  const modal = document.getElementById('reschedule-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}
window.closeRescheduleModal = closeRescheduleModal;

// Format time for display
function formatTimeDisplay(time) {
  if (!time) return '';
  const [hours, mins] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${mins} ${ampm}`;
}

// Load available slots for rescheduling
async function loadAvailableSlots(bookingId, currentBooking) {
  const container = document.getElementById('reschedule-slots');

  try {
    // Get all classes
    const classesRef = collection(db, 'classes');
    const classesSnapshot = await getDocs(classesRef);

    const classes = [];
    classesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.isActive !== false) {
        classes.push({ id: doc.id, ...data });
      }
    });

    // Get all confirmed bookings to check capacity
    const bookingsRef = collection(db, 'bookings');
    const bookingsQuery = query(bookingsRef, where('status', '==', 'confirmed'));
    const bookingsSnapshot = await getDocs(bookingsQuery);

    const bookingCounts = {};
    bookingsSnapshot.forEach(doc => {
      const b = doc.data();
      // Handle both old format (classDay/classTime/classDate) and new format (classId/date)
      let dateStr = b.date;
      if (!dateStr && b.classDate) {
        // Convert Timestamp to date string (local timezone)
        const d = b.classDate.toDate ? b.classDate.toDate() : new Date(b.classDate);
        dateStr = formatDateLocal(d);
      }

      // Generate classId from old format if not present
      let classId = b.classId;
      if (!classId && b.classDay && (b.classTime || b.startTime)) {
        const day = b.classDay.toLowerCase();
        const time = (b.classTime || b.startTime).replace(':', '');
        classId = `${day}_${time}`;
      }

      if (dateStr && classId) {
        const key = `${classId}_${dateStr}`;
        bookingCounts[key] = (bookingCounts[key] || 0) + 1;
      }
    });

    // Generate dates for next 3 weeks
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 21; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];

      // Skip Sunday (no classes)
      if (dayName === 'sunday') continue;

      dates.push({ date, dayName });
    }

    // Build HTML
    let html = '<div class="space-y-4">';

    dates.forEach(({ date, dayName }) => {
      const dateStr = formatDateLocal(date);
      const dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const className = classNamesByDay[dayName];

      // Get classes for this day
      const dayClasses = classes.filter(c => c.dayOfWeek === dayName);
      dayClasses.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));

      if (dayClasses.length === 0) return;

      html += `
        <div class="border border-gray-200 rounded-xl overflow-hidden">
          <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <p class="font-semibold text-gray-900">${dateLabel}</p>
            <p class="text-sm text-gray-600">${className}</p>
          </div>
          <div class="p-3 grid grid-cols-2 gap-2">
      `;

      dayClasses.forEach(classData => {
        // Generate consistent key using dayOfWeek_time format (matches our booking classId format)
        const generatedClassId = `${dayName}_${classData.startTime.replace(':', '')}`;
        const key = `${generatedClassId}_${dateStr}`;
        const count = bookingCounts[key] || 0;
        const isFull = count >= MAX_CLASS_CAPACITY;

        // Check if this is the current booking (handle both old and new formats)
        const currentBookingDate = currentBooking.date || (currentBooking.classDate?.toDate ?
          formatDateLocal(currentBooking.classDate.toDate()) : null);
        const currentBookingClassId = currentBooking.classId ||
          (currentBooking.classDay && (currentBooking.classTime || currentBooking.startTime) ?
            `${currentBooking.classDay.toLowerCase()}_${(currentBooking.classTime || currentBooking.startTime).replace(':', '')}` : null);
        const isCurrent = currentBookingClassId === generatedClassId && currentBookingDate === dateStr;

        // Check if time has passed
        const now = new Date();
        const [h, m] = classData.startTime.split(':');
        const classTime = new Date(date);
        classTime.setHours(parseInt(h), parseInt(m), 0, 0);
        const isPast = now > classTime;

        if (isCurrent) {
          html += `
            <div class="text-center p-3 bg-brand-100 rounded-lg border-2 border-brand-500">
              <p class="font-semibold text-brand-700">${formatTimeDisplay(classData.startTime)}</p>
              <p class="text-xs text-brand-600">Current</p>
            </div>
          `;
        } else if (isPast) {
          html += `
            <div class="text-center p-3 bg-gray-100 rounded-lg opacity-50">
              <p class="font-semibold text-gray-400">${formatTimeDisplay(classData.startTime)}</p>
              <p class="text-xs text-gray-400">Passed</p>
            </div>
          `;
        } else if (isFull) {
          html += `
            <div class="text-center p-3 bg-red-50 rounded-lg">
              <p class="font-semibold text-red-600">${formatTimeDisplay(classData.startTime)}</p>
              <p class="text-xs text-red-500">Full</p>
            </div>
          `;
        } else {
          html += `
            <button onclick="confirmReschedule('${generatedClassId}', '${dateStr}', '${classData.startTime}', '${classData.endTime || ''}', '${dayName}')"
                    class="text-center p-3 bg-white rounded-lg border border-gray-200 hover:border-brand-500 hover:bg-brand-50 transition">
              <p class="font-semibold text-gray-900">${formatTimeDisplay(classData.startTime)}</p>
              <p class="text-xs text-brand-600">${count} registered</p>
            </button>
          `;
        }
      });

      html += '</div></div>';
    });

    html += '</div>';
    container.innerHTML = html;

  } catch (error) {
    console.error('Error loading slots:', error);
    container.innerHTML = '<p class="text-center text-red-500">Error loading available slots</p>';
  }
}

// Confirm reschedule
async function confirmReschedule(newClassId, newDate, newStartTime, newEndTime, newDayOfWeek) {
  const modal = document.getElementById('reschedule-modal');
  const bookingId = modal.dataset.bookingId;
  const oldBooking = JSON.parse(modal.dataset.booking);

  const newClassName = classNamesByDay[newDayOfWeek];
  // Parse date string using local timezone constructor
  const [nYear, nMonth, nDay] = newDate.split('-').map(Number);
  const newDateFormatted = new Date(nYear, nMonth - 1, nDay).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  if (!confirm(`Reschedule to ${newClassName} on ${newDateFormatted} at ${formatTimeDisplay(newStartTime)}?`)) {
    return;
  }

  try {
    // Double-check capacity (handle both old and new booking formats)
    const bookingsRef = collection(db, 'bookings');
    const capacityQuery = query(bookingsRef, where('status', '==', 'confirmed'));
    const capacitySnapshot = await getDocs(capacityQuery);

    let slotCount = 0;
    capacitySnapshot.forEach(doc => {
      const b = doc.data();
      // Check if this booking matches the target slot
      const bDate = b.date || (b.classDate?.toDate ? formatDateLocal(b.classDate.toDate()) : null);
      const bClassId = b.classId || (b.classDay && (b.classTime || b.startTime) ?
        `${b.classDay.toLowerCase()}_${(b.classTime || b.startTime).replace(':', '')}` : null);

      if (bDate === newDate && bClassId === newClassId) {
        slotCount++;
      }
    });

    if (slotCount >= MAX_CLASS_CAPACITY) {
      showToast('Sorry, this slot is now full. Please choose another.', 'error');
      await loadAvailableSlots(bookingId, oldBooking);
      return;
    }

    // Calculate new classDate from date string using local timezone constructor
    const [rYear, rMonth, rDay] = newDate.split('-').map(Number);
    const newClassDate = new Date(rYear, rMonth - 1, rDay);
    const [hours, mins] = newStartTime.split(':').map(Number);
    newClassDate.setHours(hours, mins, 0, 0);

    // Calculate end time if not provided
    const calculatedEndTime = newEndTime || `${String(hours + 1).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    // Get old booking info (handle both formats)
    const oldDate = oldBooking.date || (oldBooking.classDate?.toDate ?
      formatDateLocal(oldBooking.classDate.toDate()) :
      formatDateLocal(new Date()));
    const oldClassId = oldBooking.classId ||
      (oldBooking.classDay && (oldBooking.classTime || oldBooking.startTime) ?
        `${oldBooking.classDay.toLowerCase()}_${(oldBooking.classTime || oldBooking.startTime).replace(':', '')}` : null);
    const oldTime = oldBooking.startTime || oldBooking.classTime || '00:00';

    // Capitalize day of week for classDay field
    const capitalizedDay = newDayOfWeek.charAt(0).toUpperCase() + newDayOfWeek.slice(1);

    // Update the booking with ALL fields in standardized format
    await updateDoc(doc(db, 'bookings', bookingId), {
      // Class identification
      classId: newClassId,
      className: newClassName,
      instructor: 'Coach Iren',
      // Date/Time fields (both formats)
      classDate: Timestamp.fromDate(newClassDate),
      date: newDate,
      classDay: capitalizedDay,
      dayOfWeek: newDayOfWeek,
      classTime: newStartTime,
      startTime: newStartTime,
      endTime: calculatedEndTime,
      duration: 60,
      // Reschedule tracking
      rescheduledAt: Timestamp.now(),
      rescheduledFrom: {
        classId: oldClassId,
        className: oldBooking.className,
        date: oldDate,
        startTime: oldTime
      }
    });

    // Add activity
    await addDoc(collection(db, 'activity'), {
      userId: auth.currentUser.uid,
      type: 'reschedule',
      title: 'Class Rescheduled',
      description: `${oldBooking.className} → ${newClassName} on ${newDateFormatted}`,
      timestamp: Timestamp.now()
    });

    closeRescheduleModal();
    showToast('Class rescheduled successfully!');
    loadUserBookings(auth.currentUser.uid);

  } catch (error) {
    console.error('Error rescheduling:', error);
    showToast('Error rescheduling. Please try again.', 'error');
  }
}
window.confirmReschedule = confirmReschedule;

// Initialize booking form
function initBookingForm() {
  const form = document.getElementById('confirm-booking-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const modal = document.getElementById('modal-book-class');
      const day = modal.dataset.day;
      const className = modal.dataset.className;
      const time = modal.dataset.time;
      await bookClass(day, className, time);
    });
  }
}

// Setup event listeners
function setupEventListeners() {
  // Close modal buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', closeBookingModal);
  });

  // Sign out
  document.getElementById('btn-sign-out')?.addEventListener('click', async () => {
    try {
      await auth.signOut();
      window.location.href = '/login.html';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  });

  // Dropdown toggle
  const userProfileBtn = document.getElementById('user-profile-btn');
  const userDropdown = document.getElementById('user-dropdown');
  
  if (userProfileBtn && userDropdown) {
    userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
    });
    
    document.addEventListener('click', () => {
      userDropdown.classList.add('hidden');
    });
  }
}

// Generate QR Code for booking
function generateQRCode(bookingId) {
  const qrContainer = document.getElementById(`qr-${bookingId}`);
  if (!qrContainer) return;

  // Use fitbreak.ph URL for QR code
  const qrData = `https://fitbreak.ph/checkin.html?booking=${bookingId}`;
  
  // Use QRCode.js library
  new QRCode(qrContainer, {
    text: qrData,
    width: 100,
    height: 100,
    colorDark: "#D71E49",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

// Show QR Modal
window.showQRModal = async function(bookingId) {
  try {
    const bookingDoc = await getDocs(query(collection(db, 'bookings'), where('__name__', '==', bookingId)));
    let booking = null;

    bookingDoc.forEach(doc => {
      booking = doc.data();
    });

    if (!booking) {
      showToast('Booking not found');
      return;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'qr-modal';
    modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative" data-modal-content>
        <button data-close-modal class="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <div class="text-center">
          <h3 class="text-2xl font-bold text-gray-900 mb-2">Check-In QR Code</h3>
          <p class="text-gray-600 mb-6">${booking.className} - ${booking.classDay} ${formatTime(booking.classTime || booking.startTime || '00:00')}</p>
          <div class="bg-white p-6 rounded-lg border-4 border-pink-500 inline-block mb-6">
            <div id="qr-modal-code"></div>
          </div>
          <p class="text-sm text-gray-600 mb-6">Show this code to staff when you arrive</p>
          <div class="flex gap-3">
            <button data-close-modal class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors font-medium">
              Close
            </button>
            <button data-download-qr class="flex-1 px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 active:bg-pink-800 transition-colors font-medium">
              Download
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close modal function
    const closeModal = () => modal.remove();

    // Attach event listeners (both click and touch for iPad/tablet support)
    modal.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', closeModal);
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        closeModal();
      });
    });

    // Download button
    const downloadBtn = modal.querySelector('[data-download-qr]');
    if (downloadBtn) {
      const handleDownload = () => window.downloadQR(bookingId);
      downloadBtn.addEventListener('click', handleDownload);
      downloadBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        handleDownload();
      });
    }

    // Close on background click/touch
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    modal.addEventListener('touchend', (e) => {
      if (e.target === modal) {
        e.preventDefault();
        closeModal();
      }
    });

    // Generate large QR code
    setTimeout(() => {
      new QRCode(document.getElementById('qr-modal-code'), {
        text: `https://fitbreak.ph/checkin.html?booking=${bookingId}`,
        width: 256,
        height: 256,
        colorDark: "#D71E49",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    }, 100);

  } catch (error) {
    console.error('Error showing QR modal:', error);
    showToast('Error loading QR code');
  }
};

// Download QR Code
window.downloadQR = function(bookingId) {
  const qrCanvas = document.querySelector('#qr-modal-code canvas');
  if (qrCanvas) {
    const link = document.createElement('a');
    link.download = `fitbreak-booking-${bookingId}.png`;
    link.href = qrCanvas.toDataURL();
    link.click();
    showToast('QR code downloaded');
  }
};

// Export functions
window.bookingModule = {
  bookClass,
  cancelBooking,
  loadUserBookings,
  generateQRCode
};
