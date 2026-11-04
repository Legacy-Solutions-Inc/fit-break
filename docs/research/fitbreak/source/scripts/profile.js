// Profile Page Module
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, updateProfile, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import firebaseConfig from './firebase-config-module.js';

// Use existing app if already initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, 'asia-db');

function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }
}

// Check auth and load profile
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await loadProfile(user);
  } else {
    window.location.href = '/login.html';
  }
});

async function loadProfile(user) {
  // Update sidebar user info (if exists)
  const userName = document.getElementById('user-name');
  const userEmail = document.getElementById('user-email');
  const userAvatar = document.getElementById('user-avatar');
  const userId = document.getElementById('user-id');
  const profileAvatar = document.getElementById('profile-avatar');

  const displayName = user.displayName || user.email.split('@')[0];
  const avatarUrl = user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=D71E49`;

  if (userName) userName.textContent = displayName;
  if (userEmail) userEmail.textContent = user.email;
  if (userId) userId.textContent = user.uid;
  if (userAvatar) userAvatar.src = avatarUrl;
  if (profileAvatar) profileAvatar.src = avatarUrl;

  // Load form data
  const displayNameInput = document.getElementById('display-name');
  const emailInput = document.getElementById('email');

  if (displayNameInput) displayNameInput.value = user.displayName || '';
  if (emailInput) emailInput.value = user.email;

  // Load additional data from Firestore
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();

      // Update sidebar
      if (typeof updateSidebarUser === 'function') {
        updateSidebarUser(user, data);
      }

      // Contact info
      const phoneInput = document.getElementById('phone');
      const emergencyInput = document.getElementById('emergency-contact');
      if (phoneInput) phoneInput.value = data.phone || '';
      if (emergencyInput) emergencyInput.value = data.emergencyContact || '';

      // Body measurements
      const heightFeetInput = document.getElementById('height-feet');
      const heightInchesInput = document.getElementById('height-inches');
      const weightInput = document.getElementById('weight');
      const birthdayInput = document.getElementById('birthday');
      const genderInput = document.getElementById('gender');

      // Load height in both formats
      const heightCmInput = document.getElementById('height-cm');
      if (data.height) {
        // Set cm value
        if (heightCmInput) heightCmInput.value = data.height;

        // Convert to feet/inches
        if (heightFeetInput && heightInchesInput) {
          const totalInches = data.height / 2.54;
          const feet = Math.floor(totalInches / 12);
          const inches = Math.round(totalInches % 12);
          heightFeetInput.value = feet;
          heightInchesInput.value = inches;
        }
      }
      if (weightInput && data.weight) weightInput.value = data.weight;
      if (birthdayInput && data.birthday) birthdayInput.value = data.birthday;
      if (genderInput && data.gender) genderInput.value = data.gender;

      // Stats
      const totalClasses = document.getElementById('total-classes');
      const currentStreak = document.getElementById('current-streak');
      const creditsRemaining = document.getElementById('credits-remaining');
      const memberSince = document.getElementById('member-since');

      if (totalClasses) totalClasses.textContent = data.classesAttended || 0;
      if (currentStreak) currentStreak.textContent = `${data.activeStreak || 0} days`;

      // Credits
      let credits = 0;
      if (typeof data.credits === 'number') {
        credits = data.credits;
      } else if (data.credits?.remaining) {
        credits = data.credits.remaining;
      } else {
        credits = data.creditsRemaining || 0;
      }
      if (creditsRemaining) creditsRemaining.textContent = credits;

      // Member since
      if (data.createdAt && memberSince) {
        const createdDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
        memberSince.textContent = createdDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        });
      }

      // Check if user is admin and show admin guide
      const isAdmin = data.isAdmin || data.role === 'admin' || data.role === 'super_admin';
      if (isAdmin) {
        const adminGuide = document.getElementById('admin-guide');
        if (adminGuide) {
          adminGuide.classList.remove('hidden');
        }
      } else {
        // Also check admins collection for admin status
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            const adminGuide = document.getElementById('admin-guide');
            if (adminGuide) {
              adminGuide.classList.remove('hidden');
            }
          }
        } catch (adminError) {
          // Not an admin, that's fine
          console.log('User is not an admin');
        }
      }
    }
  } catch (error) {
    console.error('Error loading profile data:', error);
  }
}

// Handle profile form submission
document.getElementById('profile-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return;

  const displayName = document.getElementById('display-name')?.value || '';
  const phone = document.getElementById('phone')?.value || '';
  const emergencyContact = document.getElementById('emergency-contact')?.value || '';

  // Get height - check which unit is active
  let height = null;
  const ftInputVisible = !document.getElementById('height-ft-input')?.classList.contains('hidden');

  if (ftInputVisible) {
    // Convert feet/inches to cm for storage
    const heightFeet = parseInt(document.getElementById('height-feet')?.value) || 0;
    const heightInches = parseInt(document.getElementById('height-inches')?.value) || 0;
    height = (heightFeet > 0 || heightInches > 0)
      ? Math.round((heightFeet * 12 + heightInches) * 2.54)
      : null;
  } else {
    // Use cm directly
    height = parseFloat(document.getElementById('height-cm')?.value) || null;
  }

  const weight = parseFloat(document.getElementById('weight')?.value) || null;
  const birthday = document.getElementById('birthday')?.value || null;
  const gender = document.getElementById('gender')?.value || null;

  try {
    // Update Auth profile
    await updateProfile(user, { displayName });

    // Update Firestore
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    const profileData = {
      displayName,
      phone,
      emergencyContact,
      height,
      weight,
      birthday,
      gender,
      updatedAt: serverTimestamp()
    };

    // Calculate BMI if both height and weight are provided
    if (height && weight) {
      const heightInMeters = height / 100;
      profileData.bmi = Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
    }

    if (userDoc.exists()) {
      await updateDoc(userRef, profileData);
    } else {
      await setDoc(userRef, {
        userId: user.uid,
        email: user.email,
        ...profileData,
        createdAt: serverTimestamp(),
        classesAttended: 0,
        activeStreak: 0,
        creditsRemaining: 0,
        totalCredits: 0,
        membershipStatus: 'Active'
      });
    }

    showToast('Profile updated successfully!');

    // Update avatar if name changed
    const userAvatar = document.getElementById('user-avatar');
    const profileAvatar = document.getElementById('profile-avatar');
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=D71E49`;
    if (userAvatar) userAvatar.src = avatarUrl;
    if (profileAvatar) profileAvatar.src = avatarUrl;

    // Update sidebar name
    const userName = document.getElementById('user-name');
    if (userName) userName.textContent = displayName;

  } catch (error) {
    console.error('Error updating profile:', error);
    showToast('Error updating profile. Please try again.');
  }
});

// Sign out
document.getElementById('btn-sign-out')?.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Error signing out:', error);
  }
});

// Height unit toggle function
window.setHeightUnit = function(unit) {
  const ftInput = document.getElementById('height-ft-input');
  const cmInput = document.getElementById('height-cm-input');
  const ftBtn = document.getElementById('unit-ft');
  const cmBtn = document.getElementById('unit-cm');

  if (unit === 'cm') {
    // Switch to cm
    ftInput.classList.add('hidden');
    cmInput.classList.remove('hidden');
    ftBtn.classList.remove('bg-white', 'text-gray-900', 'shadow-sm', 'font-medium');
    ftBtn.classList.add('text-gray-500');
    cmBtn.classList.add('bg-white', 'text-gray-900', 'shadow-sm', 'font-medium');
    cmBtn.classList.remove('text-gray-500');

    // Sync value: ft/in → cm
    const feet = parseInt(document.getElementById('height-feet')?.value) || 0;
    const inches = parseInt(document.getElementById('height-inches')?.value) || 0;
    if (feet > 0 || inches > 0) {
      const cm = Math.round((feet * 12 + inches) * 2.54);
      document.getElementById('height-cm').value = cm;
    }
  } else {
    // Switch to ft/in
    ftInput.classList.remove('hidden');
    cmInput.classList.add('hidden');
    ftBtn.classList.add('bg-white', 'text-gray-900', 'shadow-sm', 'font-medium');
    ftBtn.classList.remove('text-gray-500');
    cmBtn.classList.remove('bg-white', 'text-gray-900', 'shadow-sm', 'font-medium');
    cmBtn.classList.add('text-gray-500');

    // Sync value: cm → ft/in
    const cm = parseFloat(document.getElementById('height-cm')?.value) || 0;
    if (cm > 0) {
      const totalInches = cm / 2.54;
      const feet = Math.floor(totalInches / 12);
      const remainingInches = Math.round(totalInches % 12);
      document.getElementById('height-feet').value = feet;
      document.getElementById('height-inches').value = remainingInches;
    }
  }
};

console.log('Profile.js loaded');
