// Schedule Management - Weekly View
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  query,
  where,
  Timestamp,
  increment,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js';
import firebaseConfig from './firebase-config-module.js';
import { sanitizeHTML, RateLimiter } from './security-utils.js';

// Rate limiter for booking operations (5 bookings per minute)
const bookingRateLimiter = new RateLimiter(5, 60000);

// Dynamic import for referral
let awardReferralRewards = null;
import('./referral.js').then(module => {
    awardReferralRewards = module.awardReferralRewards;
}).catch(() => {
    // Referral module not available - this is expected in some deployments
});

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, 'asia-db');
const functions = getFunctions(app, 'asia-east2');

// Cloud Function for secure credit deduction
const deductCreditFn = httpsCallable(functions, 'deductCredit');

let currentUser = null;
let allClasses = [];
let userCredits = 0;
let userCreditsExpiry = null; // Track credit expiry date
let weekDates = {};
let bookingCounts = {}; // Stores booking counts per class instance
let blockedSchedules = {}; // Stores blocked dates/timeslots keyed by date

// Maximum capacity per class (hidden from members)
const MAX_CLASS_CAPACITY = 20;

// All programs available every day
const allPrograms = [
    { id: 'total-body-burn', name: 'Total Body Burn', description: 'Full-body strength & endurance', color: 'from-red-500 to-orange-500' },
    { id: 'tone-and-tighten', name: 'Tone & Tighten', description: 'Lower body & core shaping', color: 'from-pink-500 to-rose-500' },
    { id: 'cardio-crush', name: 'Cardio Crush', description: 'HIIT-style conditioning', color: 'from-purple-500 to-indigo-500' },
    { id: 'sculpt-and-strength', name: 'Sculpt & Strength', description: 'Upper body & posture', color: 'from-blue-500 to-cyan-500' },
    { id: 'core-and-balance', name: 'Core & Balance', description: 'Abs, stability & coordination', color: 'from-green-500 to-emerald-500' },
    { id: 'booty-and-burn', name: 'Booty & Burn', description: 'Glutes & endurance', color: 'from-amber-500 to-yellow-500' }
];

// Legacy mapping for backward compatibility (used in some functions)
const classNamesByDay = {
    'monday': 'Total Body Burn',
    'tuesday': 'Tone & Tighten',
    'wednesday': 'Cardio Crush',
    'thursday': 'Sculpt & Strength',
    'friday': 'Core & Balance',
    'saturday': 'Booty & Burn'
};

// Class anchor IDs for linking to app.html descriptions
const classAnchors = {
    'total-body-burn': 'total-body-burn',
    'tone-and-tighten': 'tone-and-tighten',
    'cardio-crush': 'cardio-crush',
    'sculpt-and-strength': 'sculpt-and-strength',
    'core-and-balance': 'core-and-balance',
    'booty-and-burn': 'booty-and-burn'
};

// Time slots
const timeSlots = ['06:30', '09:00', '16:30', '18:00', '19:30'];

// Initialize sidebar immediately if cached user exists
function initSidebarFromCache() {
    const cached = localStorage.getItem('fitbreak_user');
    if (cached && typeof initMemberSidebar === 'function') {
        initMemberSidebar('schedule');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded for schedule');

    // Show sidebar immediately from cache
    initSidebarFromCache();

    // Calculate week dates
    calculateWeekDates();

    // Check auth state
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            currentUser = user;
            loadUserCredits();
            // Initialize sidebar (if not already done)
            if (typeof initMemberSidebar === 'function') {
                initMemberSidebar('schedule');
            }
            // Update sidebar user info
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && typeof updateSidebarUser === 'function') {
                updateSidebarUser(user, userDoc.data());
            }
        } else {
            currentUser = null;
            const creditsBanner = document.getElementById('credits-banner');
            if (creditsBanner) creditsBanner.style.display = 'none';
        }
        loadClasses();
    });

    // Modal listeners
    document.getElementById('btn-close-modal')?.addEventListener('click', closeBookingModal);
    document.getElementById('btn-cancel-booking')?.addEventListener('click', closeBookingModal);
    document.getElementById('btn-confirm-booking')?.addEventListener('click', confirmBooking);
});

// Calculate dates from today through end of next month
function calculateWeekDates() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0); // last day of next month

    const allDates = {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: []
    };

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    let currentDate = new Date(today);
    while (currentDate <= endDate) {
        const dayName = dayNames[currentDate.getDay()];
        if (dayName !== 'sunday') {
            allDates[dayName].push(new Date(currentDate));
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Store for use in display
    window.allScheduleDates = allDates;

    // Also set weekDates for compatibility (first date of each day)
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    days.forEach(day => {
        if (allDates[day].length > 0) {
            weekDates[day] = allDates[day][0];
        }
    });

    // Update week range display
    const weekRangeEl = document.getElementById('week-range');
    if (weekRangeEl) {
        const startStr = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        weekRangeEl.textContent = `${startStr} - ${endStr}`;
    }
}

// Format date short (e.g., "Dec 25")
function formatDateShort(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Format date full (e.g., "Wednesday, December 25, 2024")
function formatDateFull(date) {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// Format date to YYYY-MM-DD in LOCAL timezone (not UTC!)
function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format time (24h to 12h)
function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// Load user credits
async function loadUserCredits() {
    try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            userCredits = userData.credits?.remaining || 0;

            // Track credit expiry date
            const expiresAt = userData.credits?.expiresAt;
            if (expiresAt) {
                userCreditsExpiry = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
            } else {
                userCreditsExpiry = null;
            }

            document.getElementById('credits-count').textContent = userCredits;
        } else {
            await setDoc(userDocRef, {
                email: currentUser.email,
                displayName: currentUser.displayName || '',
                createdAt: Timestamp.now(),
                credits: { total: 0, used: 0, remaining: 0 }
            }, { merge: true });
            userCredits = 0;
            userCreditsExpiry = null;
            document.getElementById('credits-count').textContent = 0;
        }
    } catch (error) {
        console.error('Error loading credits:', error);
    }
}

// Load classes from Firestore
// Load booking counts for all upcoming class instances
async function loadBookingCounts() {
    try {
        // Get today's date string for filtering (use local timezone)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = formatDateLocal(today);

        // Query all confirmed bookings
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('status', '==', 'confirmed'));
        const snapshot = await getDocs(q);

        bookingCounts = {};
        snapshot.forEach((docSnap) => {
            const booking = docSnap.data();
            // Get date - some bookings use 'date', others use 'classDate'
            let bookingDate = booking.date;
            if (!bookingDate && booking.classDate) {
                // classDate might be a Firestore Timestamp or string
                if (booking.classDate.toDate) {
                    bookingDate = formatDateLocal(booking.classDate.toDate());
                } else if (typeof booking.classDate === 'string') {
                    bookingDate = booking.classDate;
                }
            }

            // Get classId - generate from old format if not present
            let classId = booking.classId;
            if (!classId && booking.classDay && (booking.classTime || booking.startTime)) {
                const day = booking.classDay.toLowerCase();
                const time = (booking.classTime || booking.startTime).replace(':', '');
                classId = `${day}_${time}`;
            }

            if (bookingDate && classId) {
                // Key format: "classId_date" e.g., "monday_0630_2025-01-06"
                const key = `${classId}_${bookingDate}`;
                bookingCounts[key] = (bookingCounts[key] || 0) + 1;
            }
        });

        console.log('Loaded booking counts:', Object.keys(bookingCounts).length, 'class instances');
    } catch (error) {
        console.error('Error loading booking counts:', error);
    }
}

// Get booking count for a specific class instance
function getBookingCount(classId, dateStr) {
    const key = `${classId}_${dateStr}`;
    return bookingCounts[key] || 0;
}

// Load blocked schedules from Firestore
async function loadBlockedSchedules() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = formatDateLocal(today);

        const blocksRef = collection(db, 'blockedSchedules');
        const q = query(blocksRef,
            where('isActive', '==', true),
            where('endDate', '>=', todayStr)
        );
        const snapshot = await getDocs(q);

        blockedSchedules = {};
        snapshot.forEach(docSnap => {
            const block = { id: docSnap.id, ...docSnap.data() };
            // Expand date range into individual dates
            const start = new Date(block.startDate + 'T00:00:00');
            const end = new Date(block.endDate + 'T00:00:00');

            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateKey = formatDateLocal(d);
                if (!blockedSchedules[dateKey]) {
                    blockedSchedules[dateKey] = [];
                }
                blockedSchedules[dateKey].push(block);
            }
        });

        console.log('Loaded blocked schedules:', Object.keys(blockedSchedules).length, 'dates affected');
    } catch (error) {
        console.error('Error loading blocked schedules:', error);
    }
}

// Check if a specific slot is blocked
function isSlotBlocked(dateStr, timeSlot, programId) {
    const blocks = blockedSchedules[dateStr] || [];

    for (const block of blocks) {
        // Studio closed - blocks everything
        if (block.type === 'studio_closed') {
            return { blocked: true, type: 'studio_closed', message: block.publicMessage || 'Studio closed' };
        }

        // Coach unavailable for entire day (no specific timeslot)
        if (block.type === 'coach_unavailable' && !block.timeSlot) {
            return { blocked: true, type: 'coach_unavailable', message: block.publicMessage || 'No classes' };
        }

        // Timeslot-specific block or coach unavailable for specific time
        if (block.type === 'timeslot' || (block.type === 'coach_unavailable' && block.timeSlot)) {
            if (block.timeSlot === timeSlot) {
                // Check if all programs or specific program
                if (!block.programId || block.programId === programId) {
                    return { blocked: true, type: block.type, message: block.publicMessage || 'Unavailable' };
                }
            }
        }
    }

    return { blocked: false };
}

async function loadClasses() {
    const loadingEl = document.getElementById('loading');
    const containerEl = document.getElementById('schedule-container');

    try {
        const classesRef = collection(db, 'classes');
        const snapshot = await getDocs(classesRef);

        allClasses = [];
        snapshot.forEach((docSnap) => {
            const classData = { id: docSnap.id, ...docSnap.data() };
            if (classData.isActive !== false) {
                allClasses.push(classData);
            }
        });

        if (loadingEl) loadingEl.classList.add('hidden');
        if (containerEl) containerEl.classList.remove('hidden');

        if (allClasses.length === 0) {
            containerEl.innerHTML = `
                <div class="text-center py-12 bg-white rounded-xl">
                    <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">No Classes Available Yet</h3>
                    <p class="text-gray-600">We're setting up our class schedule. Check back soon!</p>
                </div>
            `;
            return;
        }

        // Load booking counts (only if signed in) and blocked schedules
        const promises = [loadBlockedSchedules()];
        if (currentUser) promises.push(loadBookingCounts());
        await Promise.all(promises);

        displaySchedule();

    } catch (error) {
        console.error('Error loading classes:', error);
        if (loadingEl) loadingEl.classList.add('hidden');
        if (containerEl) {
            containerEl.classList.remove('hidden');
            containerEl.innerHTML = `
                <div class="text-center py-12 bg-white rounded-xl">
                    <p class="text-red-600">Failed to load schedule. Please refresh the page.</p>
                </div>
            `;
        }
    }
}

// Display schedule grouped by DATE (showing ALL PROGRAMS at each time slot)
function displaySchedule() {
    const container = document.getElementById('schedule-container');
    const allDates = window.allScheduleDates || {};
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // Flatten all dates into a single sorted array
    let allDatesList = [];
    Object.keys(allDates).forEach(day => {
        allDates[day].forEach(date => {
            allDatesList.push({ date, day });
        });
    });

    // Sort by date
    allDatesList.sort((a, b) => a.date - b.date);

    // Filter out past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    allDatesList = allDatesList.filter(item => item.date >= today);

    if (allDatesList.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 bg-white rounded-xl">
                <p class="text-gray-600">No upcoming classes available.</p>
            </div>
        `;
        return;
    }

    let html = '';

    allDatesList.forEach(({ date, day }) => {
        const dateStr = formatDateLocal(date);
        const dateLabel = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

        // Check if the entire day is blocked
        const dayBlocks = blockedSchedules[dateStr] || [];
        const dayBlock = dayBlocks.find(b => b.type === 'studio_closed' || (b.type === 'coach_unavailable' && !b.timeSlot));
        const isCoachUnavailable = dayBlock && dayBlock.type === 'coach_unavailable';
        const isStudioClosed = dayBlock && dayBlock.type === 'studio_closed';

        html += `
            <div class="bg-brand-50 rounded-xl shadow-sm overflow-hidden mb-6 border border-brand-500">
                <!-- Date Header -->
                <div class="bg-gradient-to-r ${isStudioClosed ? 'from-gray-500 to-gray-600' : isCoachUnavailable ? 'from-orange-500 to-orange-600' : 'from-brand-500 to-brand-600'} px-4 py-3 text-white">
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="font-bold text-lg">${dateLabel}</p>
                            <p class="${isStudioClosed ? 'text-gray-200' : isCoachUnavailable ? 'text-orange-100' : 'text-brand-100'} text-sm">${isStudioClosed ? 'Studio closed' : isCoachUnavailable ? 'No classes • Gym open for inquiries' : 'Choose your program • 60 min • Coach Iren'}</p>
                        </div>
                        <div class="text-right">
                            <p class="${isStudioClosed ? 'text-gray-200' : isCoachUnavailable ? 'text-orange-100' : 'text-brand-100'} text-sm">${isStudioClosed ? 'Closed' : isCoachUnavailable ? 'Coach away' : '6 Programs Available'}</p>
                        </div>
                    </div>
                </div>

                <!-- Programs Grid -->
                <div class="p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${allPrograms.map(program => {
                            return `
                                <div class="bg-gradient-to-br ${program.color} rounded-xl p-4 text-white ">
                                    <a href="/app.html#${program.id}" class="block mb-3">
                                        <h3 class="font-bold text-lg">${program.name}</h3>
                                        <p class="text-white/80 text-sm">${program.description}</p>
                                    </a>

                                    <!-- Time Slots for this program -->
                                    <div class="grid grid-cols-2 gap-2 mt-3">
                                        ${timeSlots.map(time => {
                                            // Check if this slot is blocked
                                            const blockStatus = isSlotBlocked(dateStr, time, program.id);

                                            const timeNow = new Date();
                                            const [classHour, classMin] = time.split(':');
                                            const classTime = new Date(date);
                                            classTime.setHours(parseInt(classHour), parseInt(classMin), 0, 0);
                                            const isTimePast = timeNow > classTime;

                                            // Generate classId for this program/day/time combo
                                            const programClassId = `${program.id}_${day}_${time.replace(':', '')}`;

                                            // Get booking count for this specific class instance
                                            const bookedCount = getBookingCount(programClassId, dateStr);
                                            const isFull = bookedCount >= MAX_CLASS_CAPACITY;
                                            const canBook = currentUser && userCredits >= 1 && !isTimePast && !isFull && !blockStatus.blocked;

                                            return `
                                                <div class="text-center">
                                                    ${blockStatus.blocked ? `
                                                        <span class="block px-2 py-2 ${blockStatus.type === 'coach_unavailable' ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'} rounded-lg text-xs">
                                                            ${formatTime(time)}<br><span class="text-[10px]">${blockStatus.message}</span>
                                                        </span>
                                                    ` : isTimePast ? `
                                                        <span class="block px-2 py-2 bg-white/20 text-white/50 rounded-lg text-xs">
                                                            ${formatTime(time)}<br><span class="text-[10px]">Passed</span>
                                                        </span>
                                                    ` : isFull ? `
                                                        <span class="block px-2 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-semibold">
                                                            ${formatTime(time)}<br><span class="text-[10px]">Full (${bookedCount})</span>
                                                        </span>
                                                    ` : canBook ? `
                                                        <button
                                                            onclick="openProgramBookingModal('${program.id}', '${program.name}', '${dateStr}', '${day}', '${time}')"
                                                            class="w-full px-2 py-2 bg-white text-gray-800 rounded-lg text-xs font-semibold hover:bg-gray-100 transition">
                                                            ${formatTime(time)}<br><span class="text-[10px] text-brand-600">${bookedCount > 0 ? bookedCount + ' booked' : 'Available'}</span>
                                                        </button>
                                                    ` : currentUser ? `
                                                        <a href="/pricing.html" class="block px-2 py-2 bg-white/30 text-white rounded-lg text-xs hover:bg-white/40 transition">
                                                            ${formatTime(time)}<br><span class="text-[10px]">Get Credits</span>
                                                        </a>
                                                    ` : `
                                                        <button onclick="document.getElementById('modals-placeholder').querySelector('#login-modal')?.classList.remove('hidden'); document.getElementById('modals-placeholder').querySelector('#login-modal')?.classList.add('flex');"
                                                                class="w-full px-2 py-2 bg-white text-gray-800 rounded-lg text-xs font-semibold hover:bg-gray-100 transition">
                                                            ${formatTime(time)}<br><span class="text-[10px]">Sign In</span>
                                                        </button>
                                                    `}
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Open booking modal for program-based schedule (NEW)
window.openProgramBookingModal = async function(programId, programName, dateStr, dayOfWeek, startTime) {
    const modal = document.getElementById('modal-booking');
    const modalContent = document.getElementById('modal-content');

    const classDate = new Date(dateStr + 'T00:00:00');
    const program = allPrograms.find(p => p.id === programId);

    // Calculate end time (1 hour after start)
    const [hours, mins] = startTime.split(':').map(Number);
    const endHour = hours + 1;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

    modalContent.innerHTML = `
        <div class="bg-gradient-to-br ${program?.color || 'from-brand-500 to-brand-600'} rounded-xl p-4 mb-4 text-white">
            <h3 class="font-bold text-lg">${programName}</h3>
            <p class="text-white/80 text-sm">${program?.description || ''}</p>
            <p class="text-white/90 text-sm mt-1">${formatDateFull(classDate)}</p>
        </div>

        <div class="space-y-2 text-sm">
            <div class="flex justify-between">
                <span class="text-gray-600">Time:</span>
                <span class="font-semibold">${formatTime(startTime)} - ${formatTime(endTime)}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Duration:</span>
                <span class="font-semibold">60 minutes</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Instructor:</span>
                <span class="font-semibold">Coach Iren</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Credits:</span>
                <span class="font-semibold text-brand-600">1 credit</span>
            </div>
        </div>

        <div class="border-t mt-4 pt-4">
            <div class="flex justify-between text-sm">
                <span class="text-gray-600">Your credits:</span>
                <span class="font-semibold">${userCredits}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-600">After booking:</span>
                <span class="font-semibold">${userCredits - 1}</span>
            </div>
        </div>
    `;

    // Store program booking data
    modal.dataset.programId = programId;
    modal.dataset.programName = programName;
    modal.dataset.classDate = dateStr;
    modal.dataset.dayOfWeek = dayOfWeek;
    modal.dataset.startTime = startTime;
    modal.dataset.endTime = endTime;
    modal.dataset.bookingType = 'program'; // Flag to use new booking flow

    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

// Open booking modal (legacy - for backward compatibility)
window.openBookingModal = async function(classId, dateStr) {
    const classData = allClasses.find(c => c.id === classId);
    if (!classData) return;

    const modal = document.getElementById('modal-booking');
    const modalContent = document.getElementById('modal-content');

    const classDate = new Date(dateStr + 'T00:00:00');
    const dayName = classData.dayOfWeek.charAt(0).toUpperCase() + classData.dayOfWeek.slice(1);
    const className = classNamesByDay[classData.dayOfWeek] || classData.name;

    modalContent.innerHTML = `
        <div class="bg-brand-50 rounded-xl p-4 mb-4">
            <h3 class="font-bold text-gray-900 text-lg">${className}</h3>
            <p class="text-gray-600 text-sm">${formatDateFull(classDate)}</p>
        </div>

        <div class="space-y-2 text-sm">
            <div class="flex justify-between">
                <span class="text-gray-600">Time:</span>
                <span class="font-semibold">${formatTime(classData.startTime)} - ${formatTime(classData.endTime)}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Duration:</span>
                <span class="font-semibold">${classData.duration || 60} minutes</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Instructor:</span>
                <span class="font-semibold">${classData.instructor || 'Coach Iren'}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Credits:</span>
                <span class="font-semibold text-brand-600">${classData.creditsRequired || 1} credit</span>
            </div>
        </div>

        <div class="border-t mt-4 pt-4">
            <div class="flex justify-between text-sm">
                <span class="text-gray-600">Your credits:</span>
                <span class="font-semibold">${userCredits}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-600">After booking:</span>
                <span class="font-semibold">${userCredits - (classData.creditsRequired || 1)}</span>
            </div>
        </div>
    `;

    modal.dataset.classId = classId;
    modal.dataset.classDate = dateStr;
    modal.dataset.bookingType = 'legacy'; // Flag for old booking flow

    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

// Close booking modal
function closeBookingModal() {
    const modal = document.getElementById('modal-booking');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Confirm booking (handles both program-based and legacy bookings)
async function confirmBooking() {
    try {
        const modal = document.getElementById('modal-booking');
        const bookingType = modal.dataset.bookingType;

        // Handle new program-based booking
        if (bookingType === 'program') {
            await confirmProgramBooking(modal);
            return;
        }

        // Legacy booking flow
        const classId = modal.dataset.classId;
        const classDate = modal.dataset.classDate;

        const classData = allClasses.find(c => c.id === classId);
        if (!classData) throw new Error('Class not found');

        const creditsRequired = classData.creditsRequired || 1;

        // Disable button immediately to prevent double-click
        const confirmBtn = document.getElementById('btn-confirm-booking');
        if (confirmBtn.disabled) return; // Already processing
        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Checking...';

        // Re-fetch REAL credits from Firestore to prevent race condition
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            showToast('User not found', 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Booking';
            return;
        }
        const freshUserData = userDocSnap.data();
        const actualCredits = freshUserData.credits?.remaining ?? freshUserData.credits ?? 0;
        const actualExpiry = freshUserData.credits?.expiresAt?.toDate?.() || freshUserData.credits?.expiresAt;

        // Check if credits have expired (using fresh data)
        if (actualExpiry && actualExpiry < new Date()) {
            showToast('Your credits have expired. Please purchase a new package.', 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Booking';
            setTimeout(() => {
                window.location.href = '/pricing.html';
            }, 2000);
            return;
        }

        // Check credits using fresh data from Firestore
        if (actualCredits < creditsRequired) {
            showToast('Insufficient credits. Please purchase more.', 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Booking';
            return;
        }

        // Update local cache
        userCredits = actualCredits;
        if (actualExpiry) userCreditsExpiry = actualExpiry;

        // Check current booking count for this class (re-check to prevent race condition)
        // Use generated classId format for consistency
        const targetClassId = `${classData.dayOfWeek}_${classData.startTime.replace(':', '')}`;

        const bookingsRef = collection(db, 'bookings');
        const capacityQuery = query(bookingsRef, where('status', '==', 'confirmed'));
        const capacitySnapshot = await getDocs(capacityQuery);

        // Count bookings that match this slot (handle both old and new formats)
        let currentCount = 0;
        capacitySnapshot.forEach(doc => {
            const b = doc.data();
            const bDate = b.date || (b.classDate?.toDate ? formatDateLocal(b.classDate.toDate()) : null);
            const bClassId = b.classId || (b.classDay && (b.classTime || b.startTime) ?
                `${b.classDay.toLowerCase()}_${(b.classTime || b.startTime).replace(':', '')}` : null);

            if (bDate === classDate && bClassId === targetClassId) {
                currentCount++;
            }
        });

        if (currentCount >= MAX_CLASS_CAPACITY) {
            showToast('Sorry, this class is now full. Please choose another time.', 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Booking';
            closeBookingModal();
            await loadBookingCounts(); // Refresh counts
            displaySchedule();
            return;
        }

        // Check for duplicate booking by this user
        const existingUserBooking = capacitySnapshot.docs.find(doc => {
            const b = doc.data();
            const bDate = b.date || (b.classDate?.toDate ? formatDateLocal(b.classDate.toDate()) : null);
            const bClassId = b.classId || (b.classDay && (b.classTime || b.startTime) ?
                `${b.classDay.toLowerCase()}_${(b.classTime || b.startTime).replace(':', '')}` : null);
            return b.userId === currentUser.uid && bDate === classDate && bClassId === targetClassId;
        });

        if (existingUserBooking) {
            showToast('You already have a booking for this class!', 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Booking';
            closeBookingModal();
            return;
        }

        // Update button text for booking phase
        confirmBtn.textContent = 'Booking...';

        const className = classNamesByDay[classData.dayOfWeek] || classData.name;

        // Generate consistent classId format (dayOfWeek_time)
        const generatedClassId = `${classData.dayOfWeek}_${classData.startTime.replace(':', '')}`;

        // Parse the date string and create a proper Date object in LOCAL timezone
        // Use Date constructor with year, month, day to avoid timezone parsing issues
        const [year, month, day] = classDate.split('-').map(Number);
        const classDateObj = new Date(year, month - 1, day); // month is 0-indexed
        const [hours, mins] = classData.startTime.split(':').map(Number);
        classDateObj.setHours(hours, mins, 0, 0);

        // Calculate end time if not provided
        const endTime = classData.endTime || `${String(hours + 1).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

        // Capitalize day of week for classDay field
        const capitalizedDay = classData.dayOfWeek.charAt(0).toUpperCase() + classData.dayOfWeek.slice(1);

        const creditsBefore = userCredits;
        const booking = {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: currentUser.displayName || currentUser.email.split('@')[0],
            // Class identification (use generated ID for consistency)
            classId: generatedClassId,
            className: className,
            instructor: classData.instructor || 'Coach Iren',
            // Date/Time fields (both formats for compatibility)
            classDate: Timestamp.fromDate(classDateObj),
            date: classDate,
            classDay: capitalizedDay,
            dayOfWeek: classData.dayOfWeek,
            classTime: classData.startTime,
            startTime: classData.startTime,
            endTime: endTime,
            duration: classData.duration || 60,
            // Booking metadata
            creditsUsed: creditsRequired,
            status: 'confirmed',
            createdAt: Timestamp.now()
        };

        const bookingRef = await addDoc(collection(db, 'bookings'), booking);

        // Deduct credit via secure Cloud Function (handles audit logging)
        try {
            await deductCreditFn({
                bookingId: bookingRef.id,
                className: className,
                classDay: capitalizedDay,
                classTime: classData.startTime,
                classDate: classDate,
                creditsRequired: creditsRequired
            });
        } catch (creditError) {
            // If credit deduction fails, delete the booking and show error
            console.error('Credit deduction failed:', creditError);
            await deleteDoc(doc(db, 'bookings', bookingRef.id));
            const errorMsg = creditError.message || 'Failed to deduct credit';
            showToast(errorMsg, 'error');
            closeBookingModal();
            return;
        }

        userCredits -= creditsRequired;
        document.getElementById('credits-count').textContent = userCredits;

        // Award referral rewards if applicable
        if (awardReferralRewards) {
            try {
                await awardReferralRewards(currentUser.uid);
            } catch (e) {
                console.warn('Referral error:', e);
            }
        }

        closeBookingModal();
        showToast('Class booked successfully!', 'success');

        // Refresh booking counts and display
        await loadBookingCounts();
        displaySchedule();

    } catch (error) {
        console.error('Error booking:', error);
        showToast('Failed to book. Please try again.', 'error');

        const confirmBtn = document.getElementById('btn-confirm-booking');
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm';
    }
}

// Confirm program-based booking (NEW)
async function confirmProgramBooking(modal) {
    const programId = modal.dataset.programId;
    const programName = modal.dataset.programName;
    const classDate = modal.dataset.classDate;
    const dayOfWeek = modal.dataset.dayOfWeek;
    const startTime = modal.dataset.startTime;
    const endTime = modal.dataset.endTime;

    const creditsRequired = 1;

    // Disable button immediately to prevent double-click
    const confirmBtn = document.getElementById('btn-confirm-booking');
    if (confirmBtn.disabled) return;
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Checking...';

    try {
        // Re-fetch REAL credits from Firestore to prevent race condition
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            showToast('User not found', 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Booking';
            return;
        }
        const freshUserData = userDocSnap.data();
        const actualCredits = freshUserData.credits?.remaining ?? freshUserData.credits ?? 0;
        const actualExpiry = freshUserData.credits?.expiresAt?.toDate?.() || freshUserData.credits?.expiresAt;

        // Check if credits have expired
        if (actualExpiry && actualExpiry < new Date()) {
            showToast('Your credits have expired. Please purchase a new package.', 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Booking';
            setTimeout(() => {
                window.location.href = '/pricing.html';
            }, 2000);
            return;
        }

        // Check credits
        if (actualCredits < creditsRequired) {
            showToast('Insufficient credits. Please purchase more.', 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Booking';
            return;
        }

        // Update local cache
        userCredits = actualCredits;
        if (actualExpiry) userCreditsExpiry = actualExpiry;

        // Generate classId for this program/day/time combo
        const programClassId = `${programId}_${dayOfWeek}_${startTime.replace(':', '')}`;

        // Check current booking count (re-check to prevent race condition)
        const bookingsRef = collection(db, 'bookings');
        const capacityQuery = query(bookingsRef, where('status', '==', 'confirmed'));
        const capacitySnapshot = await getDocs(capacityQuery);

        // Count bookings for this specific class instance
        let currentCount = 0;
        capacitySnapshot.forEach(docSnap => {
            const b = docSnap.data();
            const bDate = b.date || (b.classDate?.toDate ? formatDateLocal(b.classDate.toDate()) : null);
            const bClassId = b.classId;

            if (bDate === classDate && bClassId === programClassId) {
                currentCount++;
            }
        });

        if (currentCount >= MAX_CLASS_CAPACITY) {
            showToast('Sorry, this class is now full. Please choose another time.', 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Booking';
            closeBookingModal();
            await loadBookingCounts();
            displaySchedule();
            return;
        }

        // Check for duplicate booking by this user
        const existingUserBooking = capacitySnapshot.docs.find(docSnap => {
            const b = docSnap.data();
            const bDate = b.date || (b.classDate?.toDate ? formatDateLocal(b.classDate.toDate()) : null);
            return b.userId === currentUser.uid && bDate === classDate && b.classId === programClassId;
        });

        if (existingUserBooking) {
            showToast('You already have a booking for this class!', 'error');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Confirm Booking';
            closeBookingModal();
            return;
        }

        // Update button text for booking phase
        confirmBtn.textContent = 'Booking...';

        // Parse the date and create proper Date object
        const [year, month, day] = classDate.split('-').map(Number);
        const classDateObj = new Date(year, month - 1, day);
        const [hours, mins] = startTime.split(':').map(Number);
        classDateObj.setHours(hours, mins, 0, 0);

        // Capitalize day of week
        const capitalizedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1);

        const booking = {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: currentUser.displayName || currentUser.email.split('@')[0],
            // Class identification (new program-based format)
            classId: programClassId,
            programId: programId,
            className: programName,
            instructor: 'Coach Iren',
            // Date/Time fields
            classDate: Timestamp.fromDate(classDateObj),
            date: classDate,
            classDay: capitalizedDay,
            dayOfWeek: dayOfWeek,
            classTime: startTime,
            startTime: startTime,
            endTime: endTime,
            duration: 60,
            // Booking metadata
            creditsUsed: creditsRequired,
            status: 'confirmed',
            createdAt: Timestamp.now()
        };

        const bookingRef = await addDoc(collection(db, 'bookings'), booking);

        // Deduct credit via secure Cloud Function
        try {
            await deductCreditFn({
                bookingId: bookingRef.id,
                className: programName,
                classDay: capitalizedDay,
                classTime: startTime,
                classDate: classDate,
                creditsRequired: creditsRequired
            });
        } catch (creditError) {
            console.error('Credit deduction failed:', creditError);
            await deleteDoc(doc(db, 'bookings', bookingRef.id));
            const errorMsg = creditError.message || 'Failed to deduct credit';
            showToast(errorMsg, 'error');
            closeBookingModal();
            return;
        }

        userCredits -= creditsRequired;
        document.getElementById('credits-count').textContent = userCredits;

        // Award referral rewards if applicable
        if (awardReferralRewards) {
            try {
                await awardReferralRewards(currentUser.uid);
            } catch (e) {
                console.warn('Referral error:', e);
            }
        }

        closeBookingModal();
        showToast('Class booked successfully!', 'success');

        // Refresh booking counts and display
        await loadBookingCounts();
        displaySchedule();

    } catch (error) {
        console.error('Error booking:', error);
        showToast('Failed to book. Please try again.', 'error');

        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm';
    }
}

// Show toast
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
        type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
