// Programs page functionality
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  getDocs,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import firebaseConfig from './firebase-config-module.js';

// Initialize Firebase (use existing app if already initialized)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, 'asia-db');

let currentUser = null;
let allPrograms = [];
let userEnrollments = [];

// Toast notification
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  toastMessage.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), duration);
}

// Initialize sidebar immediately if cached user exists
function initSidebarFromCache() {
  const cached = localStorage.getItem('fitbreak_user');
  if (cached && typeof initMemberSidebar === 'function') {
    initMemberSidebar('exercises');
  }
}

// Wait for components to load before checking auth
function initAuth() {
  // Show sidebar immediately from cache
  initSidebarFromCache();

  // Check auth state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      updateUserUI(user);
      await loadUserEnrollments(user.uid);
      // Initialize sidebar (if not already done)
      if (typeof initMemberSidebar === 'function') {
        initMemberSidebar('exercises');
      }
      // Update sidebar user info
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && typeof updateSidebarUser === 'function') {
        updateSidebarUser(user, userDoc.data());
      }
    } else {
      currentUser = null;
      updateGuestUI();
      // Redirect if not logged in
      window.location.href = '/login.html';
    }

    // Load programs after auth check
    await loadPrograms();
  });
}

// Wait for components to be loaded
if (document.readyState === 'loading') {
  document.addEventListener('componentsLoaded', initAuth);
} else {
  // Components might already be loaded
  initAuth();
}

// Update user UI
function updateUserUI(user) {
  const userName = document.getElementById('user-name');
  const userEmail = document.getElementById('user-email');
  const userAvatar = document.getElementById('user-avatar');

  if (userName) {
    userName.textContent = user.displayName || user.email.split('@')[0];
  }

  if (userEmail) {
    userEmail.textContent = user.email;
  }

  if (userAvatar) {
    if (user.photoURL) {
      userAvatar.src = user.photoURL;
    } else {
      userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=E64A8A&color=fff&size=128`;
    }
  }
}

// Update UI for guest users
function updateGuestUI() {
  const userProfileContainer = document.getElementById('user-profile-container');

  if (userProfileContainer) {
    // Replace with sign-in button
    userProfileContainer.innerHTML = `
      <button onclick="window.location.href='/'" class="px-6 py-2 bg-brand-500 text-white font-semibold rounded-full hover:bg-brand-600 transition-colors">
        Sign In
      </button>
    `;
  }
}

// Load all programs
async function loadPrograms() {
  try {
    const programsRef = collection(db, 'programs');
    const programsSnapshot = await getDocs(programsRef);
    
    allPrograms = [];
    programsSnapshot.forEach(doc => {
      allPrograms.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Valid class format IDs
    const validIds = ['total-body-burn', 'tone-and-tighten', 'cardio-crush', 'sculpt-and-strength', 'core-and-balance', 'booty-and-burn'];

    // Filter to only show the 6 valid class formats
    allPrograms = allPrograms.filter(p => validIds.includes(p.id));

    // Sort alphabetically by title since all programs are available daily
    allPrograms.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    
    displayPrograms(allPrograms);
    updateProgramCount(allPrograms.length);
    
    // Load user's enrolled programs if logged in
    if (currentUser) {
      await displayMyPrograms();
    }
  } catch (error) {
    console.error('Error loading programs:', error);
    document.getElementById('programs-grid').innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-red-600">Error loading programs. Please try again later.</p>
      </div>
    `;
  }
}

// Load user enrollments
async function loadUserEnrollments(userId) {
  try {
    const enrollmentsRef = collection(db, 'userPrograms');
    const q = query(enrollmentsRef, where('userId', '==', userId), where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    
    userEnrollments = [];
    snapshot.forEach(doc => {
      userEnrollments.push({
        id: doc.id,
        ...doc.data()
      });
    });
  } catch (error) {
    console.error('Error loading enrollments:', error);
  }
}

// Get appropriate icon for program based on content
function getProgramIcon(program) {
  // If program already has an icon set and it's not the default bicep, use it
  if (program.icon && program.icon !== '💪' && program.icon.trim() !== '') {
    return program.icon;
  }
  
  const title = (program.title || program.name || '').toLowerCase();
  const description = (program.description || '').toLowerCase();
  const goals = (program.goals || []).join(' ').toLowerCase();
  const category = (program.category || '').toLowerCase();
  const combined = `${title} ${description} ${goals} ${category}`;
  
  // Match icons based on program focus - using women-friendly icons
  if (combined.includes('yoga') || combined.includes('flexibility') || combined.includes('stretch') || combined.includes('flow')) {
    return '🧘‍♀️';
  } else if (combined.includes('hiit') || combined.includes('cardio') || combined.includes('fat') || combined.includes('burn') || combined.includes('weight loss')) {
    return '🔥';
  } else if (combined.includes('pilates') || combined.includes('mat')) {
    return '🤸‍♀️';
  } else if (combined.includes('prenatal') || combined.includes('pregnancy') || combined.includes('expecting')) {
    return '🤰';
  } else if (combined.includes('postnatal') || combined.includes('recovery') || combined.includes('mom')) {
    return '👶';
  } else if (combined.includes('glutes') || combined.includes('legs') || combined.includes('booty')) {
    return '🍑';
  } else if (combined.includes('dance') || combined.includes('zumba')) {
    return '💃';
  } else if (combined.includes('beginner') || combined.includes('foundation') || combined.includes('getting started')) {
    return '🌱';
  } else if (combined.includes('wellness') || combined.includes('mindful') || combined.includes('stress')) {
    return '🌸';
  } else if (combined.includes('sculpt') || combined.includes('tone')) {
    return '✨';
  } else if (combined.includes('strength') || combined.includes('muscle') || combined.includes('power') || combined.includes('arms') || combined.includes('core')) {
    return '💪'; // Keep for strength programs but list it last
  }
  
  // Default: use a feminine/empowering icon instead of flexed bicep
  return '🌸';
}

// Get next occurrence of a day of week
function getNextClassDate(dayOfWeek) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const targetDay = days.indexOf(dayOfWeek);

  if (targetDay === -1) return null;

  const currentDay = today.getDay();
  let daysUntil = targetDay - currentDay;

  // If it's the same day but class already passed, or if target is before current day, go to next week
  if (daysUntil <= 0) {
    daysUntil += 7;
  }

  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysUntil);

  return nextDate;
}

// Format date for display
function formatClassDate(date) {
  if (!date) return '';
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Class capacity limit
const MAX_CLASS_CAPACITY = 15;

// Display programs in grid
function displayPrograms(programs) {
  const grid = document.getElementById('programs-grid');

  if (programs.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-gray-600">No programs found matching your filters.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = programs.map(program => {
    const isEnrolled = userEnrollments.some(e => e.programId === program.id);
    const difficultyColors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
      'all levels': 'bg-blue-100 text-blue-800'
    };

    // Safely access program fields with defaults - handle both name formats
    const title = program.title || program.name || 'Untitled Program';
    const description = program.description || 'No description available';
    // Handle both 'difficulty' and 'level' fields
    const rawDifficulty = (program.difficulty || program.level || 'beginner').toLowerCase();
    const difficulty = rawDifficulty.replace(/\s+/g, ' '); // normalize spaces

    // All programs are now available daily
    const dayOfWeek = 'Daily';

    // Hardcode correct gradients by program ID (Firestore data may have invalid values)
    const programGradients = {
      'total-body-burn': 'from-brand-500 to-brand-600',
      'tone-and-tighten': 'from-pink-400 to-pink-600',
      'cardio-crush': 'from-orange-400 to-orange-600',
      'sculpt-and-strength': 'from-purple-400 to-purple-600',
      'core-and-balance': 'from-blue-400 to-blue-600',
      'booty-and-burn': 'from-pink-500 to-rose-600'
    };
    const gradient = programGradients[program.id] || 'from-brand-500 to-brand-600';
    // Get appropriate icon based on program title/goals
    const icon = getProgramIcon(program);
    const rating = program.rating || 5.0;
    const instructorName = program.instructorName || 'FitBreak Coach';
    const goals = program.goals || [];

    return `
      <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer" onclick="window.location.href='/program-detail.html?id=${program.id}'">
        <!-- Program Image -->
        <div class="h-48 bg-gradient-to-br ${gradient} flex items-center justify-center">
          <div class="text-center text-white">
            <div class="text-5xl mb-2">${icon}</div>
            <div class="text-sm font-semibold uppercase tracking-wide">${dayOfWeek}</div>
          </div>
        </div>

        <!-- Program Info -->
        <div class="p-6">
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-xl font-bold text-gray-900">${title}</h3>
            <span class="px-2 py-1 text-xs font-semibold rounded-full uppercase ${difficultyColors[difficulty] || difficultyColors['beginner']}">
              ${difficulty}
            </span>
          </div>

          <p class="text-gray-600 text-sm mb-4 line-clamp-2">${description}</p>

          <!-- Stats -->
          <div class="flex items-center gap-4 mb-4 text-sm text-gray-500">
            <div class="flex items-center gap-1">
              <span>⭐</span>
              <span>${rating}</span>
            </div>
          </div>

          <!-- Created By -->
          <div class="text-sm text-gray-600 mb-4">
            By <span class="font-semibold text-brand-600">${instructorName}</span>
          </div>

          <!-- Goals Tags -->
          ${goals.length > 0 ? `
          <div class="flex flex-wrap gap-2 mb-4">
            ${goals.map(goal => `
              <span class="px-2 py-1 bg-brand-50 text-brand-700 text-xs rounded-full">${goal}</span>
            `).join('')}
          </div>
          ` : ''}

          <!-- CTA -->
          ${isEnrolled ? `
            <button class="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors" onclick="event.stopPropagation(); window.location.href='/my-programs.html'">
              Signed Up - View Progress
            </button>
          ` : `
            <a href="/schedule.html" class="block w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors text-center" onclick="event.stopPropagation();">
              Sign up - see schedule
            </a>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// Display user's enrolled programs
async function displayMyPrograms() {
  if (userEnrollments.length === 0) {
    return;
  }
  
  const section = document.getElementById('my-programs-section');
  const grid = document.getElementById('my-programs-grid');
  
  section.classList.remove('hidden');
  
  const enrolledPrograms = await Promise.all(
    userEnrollments.map(async (enrollment) => {
      const programDoc = await getDoc(doc(db, 'programs', enrollment.programId));
      return {
        enrollment,
        program: { id: programDoc.id, ...programDoc.data() }
      };
    })
  );
  
  grid.innerHTML = enrolledPrograms.map(({ enrollment, program }) => {
    // Parse duration - handle "8 weeks" format or just number
    const durationStr = program.duration || '8';
    const duration = typeof durationStr === 'string' ? parseInt(durationStr) || 8 : durationStr;
    const weeksCompleted = enrollment.completedWeeks?.length || 0;
    const progress = Math.round((weeksCompleted / duration) * 100);
    
    return `
      <div class="bg-white rounded-lg shadow-md p-6 border-2 border-brand-100 hover:border-brand-300 transition-colors cursor-pointer" onclick="window.location.href='/my-programs.html?id=${enrollment.id}'">
        <h3 class="text-lg font-bold text-gray-900 mb-2">${program.title}</h3>
        
        <!-- Progress Bar -->
        <div class="mb-3">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Week ${enrollment.currentWeek} of ${duration}</span>
            <span>${progress}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-brand-500 h-2 rounded-full transition-all duration-300" style="width: ${progress}%"></div>
          </div>
        </div>
        
        <p class="text-sm text-gray-600 mb-4">
          ${weeksCompleted} weeks completed
        </p>
        
        <button class="w-full py-2 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors">
          Continue Program →
        </button>
      </div>
    `;
  }).join('');
}

// Update program count
function updateProgramCount(count) {
  document.getElementById('program-count').textContent = `${count} program${count !== 1 ? 's' : ''} available`;
}

// Filter programs
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active state
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active', 'bg-brand-500', 'text-white');
      b.classList.add('bg-gray-100', 'text-gray-700');
    });
    btn.classList.add('active', 'bg-brand-500', 'text-white');
    btn.classList.remove('bg-gray-100', 'text-gray-700');
    
    // Filter programs
    const filter = btn.dataset.filter;
    let filtered = allPrograms;
    
    if (filter !== 'all') {
      filtered = allPrograms.filter(p => 
        p.goals && p.goals.some(goal => goal.toLowerCase().includes(filter))
      );
    }
    
    displayPrograms(filtered);
    updateProgramCount(filtered.length);
  });
});

// Enroll in program (Sign Up for class)
window.enrollInProgram = async function(programId) {
  if (!currentUser) {
    showToast('Please sign in to sign up for classes');
    setTimeout(() => window.location.href = '/login.html', 1500);
    return;
  }

  try {
    // Check capacity first
    const programDoc = await getDoc(doc(db, 'programs', programId));
    if (programDoc.exists()) {
      const programData = programDoc.data();
      const currentEnrolled = programData.enrolledCount || 0;
      if (currentEnrolled >= MAX_CLASS_CAPACITY) {
        showToast('Sorry, this class is full. Please try another class.');
        return;
      }
    }

    const enrollmentId = `${currentUser.uid}_${programId}`;
    const enrollmentRef = doc(db, 'userPrograms', enrollmentId);

    // Check if already enrolled
    const existingDoc = await getDoc(enrollmentRef);
    if (existingDoc.exists()) {
      showToast('You are already signed up for this class!');
      setTimeout(() => window.location.href = '/my-programs.html', 1500);
      return;
    }

    // Create enrollment
    await setDoc(enrollmentRef, {
      userId: currentUser.uid,
      programId: programId,
      enrolledDate: Timestamp.now(),
      currentWeek: 1,
      status: 'active',
      progress: 0,
      completedWeeks: [],
      completedDays: {}
    });

    // Note: Enrollment count update should be done via Cloud Functions
    // to prevent race conditions and ensure accurate counting

    showToast('Successfully signed up for class!');
    setTimeout(() => window.location.href = '/my-programs.html', 1500);
  } catch (error) {
    console.error('Error signing up:', error);
    showToast('Error signing up for class. Please try again.');
  }
};

// Create sample programs (only if none exist) - FitBreak's 6 Class Formats
async function createSamplePrograms() {
  const samplePrograms = [
    {
      id: 'total-body-burn',
      title: 'Total Body Burn',
      description: 'Full-body strength and endurance workout. This high-energy Monday class targets all major muscle groups for maximum calorie burn.',
      duration: 1,
      difficulty: 'all levels',
      goals: ['Weight Loss', 'Full Body', 'Strength', 'Endurance'],
      instructorName: 'Coach Iren',
      instructorId: 'coach-iren',
      gradient: 'from-red-400 to-red-600',
      icon: '🔥',
      rating: 5.0,
      enrolledCount: 45,
      price: 0,
      dayOfWeek: 'Monday',
      equipment: ['Kettlebells', 'Battle Ropes', 'Dumbbells'],
      featured: true,
      createdAt: Timestamp.now()
    },
    {
      id: 'tone-and-tighten',
      title: 'Tone & Tighten',
      description: 'Lower body and core toning session. Sculpt your legs, glutes, and core with this targeted Tuesday workout.',
      duration: 1,
      difficulty: 'all levels',
      goals: ['Weight Loss', 'Lower Body', 'Core', 'Toning'],
      instructorName: 'Coach Iren',
      instructorId: 'coach-iren',
      gradient: 'from-pink-400 to-pink-600',
      icon: '✨',
      rating: 4.9,
      enrolledCount: 52,
      price: 0,
      dayOfWeek: 'Tuesday',
      equipment: ['Resistance Bands', 'Medicine Balls'],
      featured: true,
      createdAt: Timestamp.now()
    },
    {
      id: 'cardio-crush',
      title: 'Cardio Crush',
      description: 'High-intensity cardio conditioning. Get your heart pumping and boost your metabolism with this intense Wednesday cardio session.',
      duration: 1,
      difficulty: 'all levels',
      goals: ['Weight Loss', 'Cardio', 'HIIT', 'Fat Burn'],
      instructorName: 'Coach Iren',
      instructorId: 'coach-iren',
      gradient: 'from-orange-400 to-orange-600',
      icon: '💥',
      rating: 4.8,
      enrolledCount: 48,
      price: 0,
      dayOfWeek: 'Wednesday',
      equipment: ['Jump Ropes', 'Steps', 'Battle Ropes'],
      createdAt: Timestamp.now()
    },
    {
      id: 'sculpt-and-strength',
      title: 'Sculpt & Strength',
      description: 'Upper body strength and posture training. Build strong, toned arms and improve your posture every Thursday.',
      duration: 1,
      difficulty: 'all levels',
      goals: ['Weight Loss', 'Upper Body', 'Posture', 'Strength'],
      instructorName: 'Coach Iren',
      instructorId: 'coach-iren',
      gradient: 'from-purple-400 to-purple-600',
      icon: '💪',
      rating: 4.9,
      enrolledCount: 41,
      price: 0,
      dayOfWeek: 'Thursday',
      equipment: ['Dumbbells', 'Resistance Tubes'],
      createdAt: Timestamp.now()
    },
    {
      id: 'core-and-balance',
      title: 'Core & Balance',
      description: 'Core stability and coordination workout. Strengthen your core and improve balance every Friday.',
      duration: 1,
      difficulty: 'all levels',
      goals: ['Weight Loss', 'Core', 'Balance', 'Stability'],
      instructorName: 'Coach Iren',
      instructorId: 'coach-iren',
      gradient: 'from-blue-400 to-blue-600',
      icon: '🧘‍♀️',
      rating: 5.0,
      enrolledCount: 38,
      price: 0,
      dayOfWeek: 'Friday',
      equipment: ['Stability Balls', 'BOSU', 'Mats'],
      createdAt: Timestamp.now()
    },
    {
      id: 'booty-and-burn',
      title: 'Booty & Burn',
      description: 'Glutes-focused endurance training. End your week strong with this Saturday booty-building session!',
      duration: 1,
      difficulty: 'all levels',
      goals: ['Weight Loss', 'Glutes', 'Endurance', 'Lower Body'],
      instructorName: 'Coach Iren',
      instructorId: 'coach-iren',
      gradient: 'from-brand-400 to-brand-600',
      icon: '🍑',
      rating: 5.0,
      enrolledCount: 56,
      price: 0,
      dayOfWeek: 'Saturday',
      equipment: ['Resistance Bands', 'Kettlebells', 'Plyo Boxes'],
      featured: true,
      createdAt: Timestamp.now()
    }
  ];
  
  try {
    for (const program of samplePrograms) {
      await setDoc(doc(db, 'programs', program.id), program);
    }
    console.log('Sample programs created successfully');
  } catch (error) {
    console.error('Error creating sample programs:', error);
  }
}

// User dropdown toggle
const profileBtn = document.getElementById('user-profile-btn');
const dropdown = document.getElementById('user-dropdown');

if (profileBtn && dropdown) {
  profileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.classList.contains('hidden') && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });
}

// Sign out handler
const signOutBtn = document.getElementById('btn-sign-out');
if (signOutBtn) {
  signOutBtn.addEventListener('click', async () => {
    try {
      await auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      showToast('Error signing out. Please try again.');
    }
  });
}
