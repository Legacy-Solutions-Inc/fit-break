// Firebase Authentication Module
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  linkWithCredential
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  limit,
  getDocs,
  updateDoc,
  increment,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';
import {
  isPasskeyRequired,
  isPasskeyVerified,
  hasPasskeyRegistered,
  showPasskeyModal,
  showPasskeySetupRequiredModal,
  clearPasskeyVerification
} from './passkey-auth.js';
import { sanitizeHTML, sanitizeDisplayName, getFirebaseErrorMessage, UserFriendlyErrors } from './security-utils.js';

// Initialize Firebase (use existing app if already initialized)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, 'asia-db');
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');
const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Store pending credential for account linking
let pendingCredential = null;
let pendingEmail = null;

// Detect in-app browsers (Messenger, Instagram, Facebook, etc.)
function isInAppBrowser() {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  // Check for common in-app browser indicators
  const inAppPatterns = [
    /FBAN|FBAV/i,           // Facebook App
    /Instagram/i,            // Instagram
    /Messenger/i,            // Facebook Messenger
    /Line/i,                 // LINE
    /KAKAOTALK/i,           // KakaoTalk
    /Twitter/i,              // Twitter
    /Snapchat/i,             // Snapchat
    /WeChat|MicroMessenger/i // WeChat
  ];
  return inAppPatterns.some(pattern => pattern.test(ua));
}

// Show in-app browser warning modal
function showInAppBrowserWarning() {
  const currentUrl = window.location.href;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  let instructions = '';
  if (isIOS) {
    instructions = 'Tap the <strong>···</strong> menu and select <strong>"Open in Safari"</strong>';
  } else if (isAndroid) {
    instructions = 'Tap the <strong>⋮</strong> menu and select <strong>"Open in Chrome"</strong>';
  } else {
    instructions = 'Copy the link and open it in your browser';
  }

  const modal = document.createElement('div');
  modal.id = 'inapp-browser-modal';
  modal.className = 'fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]';
  modal.innerHTML = `
    <div class="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
      <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Open in Browser</h3>
      <p class="text-gray-600 mb-4">Google sign-in doesn't work in this app's browser. Please open FitBreak in Safari or Chrome.</p>
      <p class="text-sm text-gray-500 mb-4">${instructions}</p>
      <div class="space-y-3">
        <button onclick="navigator.clipboard.writeText('${currentUrl}'); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy Link', 2000);" class="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold hover:bg-brand-600 transition">
          Copy Link
        </button>
        <button onclick="document.getElementById('inapp-browser-modal').remove();" class="w-full py-2 text-gray-600 hover:text-gray-800 transition">
          Cancel
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// Google Client ID for One Tap
const GOOGLE_CLIENT_ID = '545418882177-xxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com'; // Will be auto-detected from Firebase config

// UI Elements
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// Toast notification
const toast = (msg, type = 'info') => {
  const toastEl = $('#toast');
  if (!toastEl) return;

  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');

  // Set color based on type
  toastEl.classList.remove('bg-gray-900', 'bg-green-600', 'bg-red-600', 'bg-yellow-600');
  if (type === 'success') {
    toastEl.classList.add('bg-green-600');
  } else if (type === 'error') {
    toastEl.classList.add('bg-red-600');
  } else if (type === 'warning') {
    toastEl.classList.add('bg-yellow-600');
  } else {
    toastEl.classList.add('bg-gray-900');
  }

  setTimeout(() => toastEl.classList.add('hidden'), 3000);
};

// Store current user for later use
let currentUser = null;

// Cache user for instant header display
function cacheUser(user, role = null) {
  if (user) {
    const cached = {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      uid: user.uid
    };
    // Include role if provided
    if (role) {
      cached.role = role;
    }
    localStorage.setItem('fitbreak_user', JSON.stringify(cached));
  } else {
    localStorage.removeItem('fitbreak_user');
  }
}

// Show cached user immediately (before Firebase confirms)
function showCachedUser() {
  const cached = localStorage.getItem('fitbreak_user');
  if (cached) {
    try {
      const user = JSON.parse(cached);
      const authButtons = document.querySelector('#auth-buttons');
      const userProfile = document.querySelector('#user-profile');
      const userName = document.querySelector('#user-name');
      const userEmail = document.querySelector('#user-email');
      const userAvatar = document.querySelector('#user-avatar');

      if (authButtons) authButtons.classList.add('hidden');
      if (userProfile) userProfile.classList.remove('hidden');
      if (userName) userName.textContent = user.displayName || user.email?.split('@')[0] || 'Member';
      if (userEmail) userEmail.textContent = user.email || '';
      if (userAvatar) {
        userAvatar.src = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'User')}&background=E64A8A&color=fff&bold=true`;
      }
    } catch (e) {
      console.warn('Failed to parse cached user');
    }
  }
}

// Show cached user immediately on script load
showCachedUser();

// Auth State Observer
onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  cacheUser(user); // Cache for next page load
  updateUIForUser(user);

  // Check passkey enforcement for already-signed-in users
  if (user && isPasskeyRequired(user.email) && !isPasskeyVerified()) {
    // Passkey verification required for admin user

    // Check if user has passkey registered
    const hasPasskey = await hasPasskeyRegistered(user.uid);

    if (hasPasskey) {
      // Show passkey verification modal
      showPasskeyModal(
        user.email,
        () => {
          // Passkey verified successfully
        },
        async () => {
          // Cancel - sign out
          await signOut(auth);
          clearPasskeyVerification();
          localStorage.removeItem('fitbreak_user');
          window.location.href = '/index.html';
        }
      );
    } else {
      // No passkey registered - redirect to security page
      showPasskeySetupRequiredModal(
        () => {
          window.location.href = '/admin-security.html';
        },
        async () => {
          await signOut(auth);
          clearPasskeyVerification();
          localStorage.removeItem('fitbreak_user');
          window.location.href = '/index.html';
        }
      );
    }
  }
});

// Re-update UI when components are loaded (header may not exist on first auth check)
document.addEventListener('componentsLoaded', () => {
  showCachedUser(); // Show cached immediately
  if (currentUser !== null) {
    updateUIForUser(currentUser);
  }
});

// Update UI based on auth state
async function updateUIForUser(user) {
  const authButtons = $('#auth-buttons');
  const userProfile = $('#user-profile');
  const userName = $('#user-name');
  const userEmail = $('#user-email');
  const userAvatar = $('#user-avatar');
  const metricsDashboard = $('#metrics-dashboard');

  // Admin link elements
  const adminNavLink = $('#admin-nav-link');
  const adminDropdownLink = $('#admin-dropdown-link');
  const mobileAdminLink = $('#mobile-admin-link');
  const sidebarAdminLink = $('#sidebar-admin-link'); // Member sidebar dropdown admin link
  const sidebarAdminBtnContainer = $('#sidebar-admin-btn-container'); // Member sidebar prominent admin button
  const mobileDashboardLink = $('#mobile-dashboard-link');
  const mobileBookingsLink = $('#mobile-bookings-link');
  const mobileSigninLink = $('#mobile-signin-link');

  if (user) {
    // User is signed in
    if (authButtons) authButtons.classList.add('hidden');
    if (userProfile) userProfile.classList.remove('hidden');
    if (metricsDashboard) metricsDashboard.classList.remove('hidden');

    // Show mobile user links, hide sign-in link
    if (mobileDashboardLink) mobileDashboardLink.classList.remove('hidden');
    if (mobileBookingsLink) mobileBookingsLink.classList.remove('hidden');
    if (mobileSigninLink) mobileSigninLink.classList.add('hidden');

    if (userName) userName.textContent = user.displayName || user.email.split('@')[0];
    if (userEmail) userEmail.textContent = user.email;

    if (userAvatar) {
      if (user.photoURL) {
        userAvatar.src = user.photoURL;
      } else {
        userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=E64A8A&color=fff&bold=true`;
      }
    }

    // Check for admin claims (from custom claims OR Firestore user document)
    try {
      const idTokenResult = await user.getIdTokenResult();
      const claims = idTokenResult.claims;
      let isAdmin = claims.isSuperAdmin || claims.superAdmin ||
                      claims.role === 'tenant_admin' || claims.role === 'super_admin';

      // Fallback: Check Firestore user document for role if claims don't indicate admin
      let userRole = claims.role || '';
      if (!isAdmin) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            userRole = userData.role || '';
            isAdmin = userRole === 'admin' || userRole === 'super_admin' ||
                      userRole === 'tenant_admin' || userRole === 'gym_assistant' || userData.isAdmin === true;
            // Update cache with role for sidebar permissions
            cacheUser(user, userRole);
          }
        } catch (firestoreError) {
          console.warn('Could not check Firestore for admin role:', firestoreError);
        }
      }

      if (isAdmin) {
        // Show admin links (desktop only for nav, mobile has menu link)
        if (adminNavLink) {
          adminNavLink.classList.remove('hidden');
          adminNavLink.classList.add('hidden', 'md:inline-flex'); // Hidden on mobile, visible on md+
        }
        if (adminDropdownLink) {
          adminDropdownLink.classList.remove('hidden');
          adminDropdownLink.classList.add('flex');
        }
        if (mobileAdminLink) {
          mobileAdminLink.classList.remove('hidden');
          mobileAdminLink.classList.add('block');
        }
        if (sidebarAdminLink) {
          sidebarAdminLink.classList.remove('hidden');
          sidebarAdminLink.classList.add('flex');
        }
        if (sidebarAdminBtnContainer) {
          sidebarAdminBtnContainer.classList.remove('hidden');
        }
      } else {
        // Hide admin links
        if (adminNavLink) adminNavLink.classList.add('hidden');
        if (adminDropdownLink) adminDropdownLink.classList.add('hidden');
        if (mobileAdminLink) mobileAdminLink.classList.add('hidden');
        if (sidebarAdminLink) sidebarAdminLink.classList.add('hidden');
        if (sidebarAdminBtnContainer) sidebarAdminBtnContainer.classList.add('hidden');
      }

      // Update member bottom nav with admin status
      if (typeof window.updateMemberBottomNav === 'function') {
        window.updateMemberBottomNav(isAdmin);
      }
    } catch (error) {
      console.error('Error checking admin claims:', error);
      // Hide admin links on error
      if (adminNavLink) adminNavLink.classList.add('hidden');
      if (adminDropdownLink) adminDropdownLink.classList.add('hidden');
      if (mobileAdminLink) mobileAdminLink.classList.add('hidden');
      if (sidebarAdminLink) sidebarAdminLink.classList.add('hidden');
      if (sidebarAdminBtnContainer) sidebarAdminBtnContainer.classList.add('hidden');
    }

    // Enable booking functionality
    enableBookingFeatures(true);
  } else {
    // User is signed out
    if (authButtons) authButtons.classList.remove('hidden');
    if (userProfile) userProfile.classList.add('hidden');
    if (metricsDashboard) metricsDashboard.classList.add('hidden');

    // Hide admin links
    if (adminNavLink) adminNavLink.classList.add('hidden');
    if (adminDropdownLink) adminDropdownLink.classList.add('hidden');
    if (mobileAdminLink) mobileAdminLink.classList.add('hidden');
    if (sidebarAdminLink) sidebarAdminLink.classList.add('hidden');
    if (sidebarAdminBtnContainer) sidebarAdminBtnContainer.classList.add('hidden');
    if (mobileDashboardLink) mobileDashboardLink.classList.add('hidden');
    if (mobileBookingsLink) mobileBookingsLink.classList.add('hidden');
    if (mobileSigninLink) mobileSigninLink.classList.remove('hidden');

    // Disable booking functionality
    enableBookingFeatures(false);
  }
}

// Enable/disable booking features based on auth state
function enableBookingFeatures(enabled) {
  const bookingForm = $('#booking-form');

  if (bookingForm) {
    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      if (enabled) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Book Now';
      } else {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sign In to Book';
      }
    }
  }
  // Booking buttons are now handled by initBookingButtons() with direct auth checks
}

// Open modal helper
function openModal(selector) {
  const modal = $(selector);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

// Close modal helper
function closeModal(selector) {
  const modal = $(selector);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Scroll to dashboard
function scrollToDashboard() {
  const dashboard = $('#metrics-dashboard');
  if (dashboard) {
    dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Sign Up with Email/Password
export async function signUpWithEmail(email, password, displayName, phone = null) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with display name
    if (displayName) {
      // Sanitize display name before setting
      const safeName = sanitizeDisplayName(displayName);
      await updateProfile(user, { displayName: safeName });
    }

    // Create user document in Firestore (triggers welcome email)
    try {
      // Sanitize user data before storing
      const safeName = sanitizeDisplayName(displayName) || user.email.split('@')[0];
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: safeName,
        name: safeName,
        photoURL: user.photoURL || null,
        credits: 0,
        membershipStatus: 'free',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };

      // Add phone if provided (basic sanitization)
      if (phone && phone.trim()) {
        userData.phone = phone.trim().replace(/[<>]/g, '');
      }

      await setDoc(doc(db, 'users', user.uid), userData);
    } catch (firestoreError) {
      // User document creation failed but user is already created
      // Don't expose internal error details
    }

    toast('Account created successfully! Welcome to FitBreak!', 'success');
    closeModal('#modal-auth');
    return user;
  } catch (error) {
    // Use user-friendly error messages (don't expose internal details)
    const message = getFirebaseErrorMessage(error);
    toast(message, 'error');
    throw error;
  }
}

// Sign In with Email/Password
export async function signInWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    toast(`Welcome back, ${userCredential.user.displayName || 'friend'}! 💪`, 'success');
    closeModal('#modal-auth');
    setTimeout(scrollToDashboard, 300);
    return userCredential.user;
  } catch (error) {
    console.error('Sign in error:', error);
    let message = 'Failed to sign in. ';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message += 'No account found with this email.';
        break;
      case 'auth/wrong-password':
        message += 'Incorrect password.';
        break;
      case 'auth/invalid-email':
        message += 'Invalid email address.';
        break;
      case 'auth/user-disabled':
        message += 'This account has been disabled.';
        break;
      default:
        message += error.message;
    }
    
    toast(message, 'error');
    throw error;
  }
}

// Helper: Create or update user document in Firestore
async function ensureUserDocument(user) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // New user - create document (triggers welcome email)
      // Sanitize display name before storing
      const safeName = sanitizeDisplayName(user.displayName) || user.email?.split('@')[0] || 'User';
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: safeName,
        name: safeName,
        photoURL: user.photoURL || null,
        credits: 0,
        membershipStatus: 'free',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });

      // Process referral if this user was referred
      await processReferral(user.uid);

      return true; // New user
    } else {
      // Existing user - update last login
      await setDoc(userRef, { lastLoginAt: serverTimestamp() }, { merge: true });
      return false; // Existing user
    }
  } catch (error) {
    // Don't expose internal error details
    return false;
  }
}

// Process referral for new user signup
async function processReferral(newUserId) {
  const referralCode = sessionStorage.getItem('referralCode');
  if (!referralCode) {
    return;
  }

  try {
    // Validate referral code format (alphanumeric only)
    if (!/^[a-zA-Z0-9_-]+$/.test(referralCode)) {
      sessionStorage.removeItem('referralCode');
      return;
    }

    // Find the referrer by their referral code
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('referralCode', '==', referralCode), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      sessionStorage.removeItem('referralCode');
      return;
    }

    const referrerDoc = querySnapshot.docs[0];
    const referrerId = referrerDoc.id;

    // Don't allow self-referral
    if (referrerId === newUserId) {
      sessionStorage.removeItem('referralCode');
      return;
    }

    // Create referral record
    await addDoc(collection(db, 'referrals'), {
      referrerId: referrerId,
      referredUserId: newUserId,
      referralCode: referralCode,
      timestamp: serverTimestamp(),
      status: 'pending', // Will become 'completed' after first booking
      rewardGiven: false
    });

    // Update referrer's count
    const referrerRef = doc(db, 'users', referrerId);
    await updateDoc(referrerRef, {
      referralCount: increment(1)
    });

    // Clear from session
    sessionStorage.removeItem('referralCode');
  } catch (error) {
    // Don't expose referral processing errors
  }
}

// Sign In with Google (Popup)
export async function signInWithGoogle() {
  // Check for in-app browser first
  if (isInAppBrowser()) {
    showInAppBrowserWarning();
    return null;
  }

  try {
    // Customize the provider for better UX
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    const result = await signInWithPopup(auth, googleProvider);
    const isNewUser = await ensureUserDocument(result.user);
    const user = result.user;

    // Check if this user requires passkey verification
    if (isPasskeyRequired(user.email)) {
      // Check if already verified this session
      if (!isPasskeyVerified()) {
        // Check if user has passkey registered
        const hasPasskey = await hasPasskeyRegistered(user.uid);

        if (hasPasskey) {
          // Show passkey verification modal
          return new Promise((resolve) => {
            showPasskeyModal(
              user.email,
              () => {
                // Success - passkey verified
                toast(`Welcome${isNewUser ? '' : ' back'}, ${user.displayName}!`, 'success');
                closeModal('#modal-auth');
                setTimeout(scrollToDashboard, 300);
                resolve(user);
              },
              async () => {
                // Cancel - sign out
                await signOut(auth);
                clearPasskeyVerification();
                toast('Passkey verification required for admin access.', 'warning');
                resolve(null);
              }
            );
          });
        } else {
          // No passkey registered - show setup required modal
          return new Promise((resolve) => {
            showPasskeySetupRequiredModal(
              () => {
                // Go to security page to set up passkey
                window.location.href = '/admin-security.html';
                resolve(user);
              },
              async () => {
                // Cancel - sign out
                await signOut(auth);
                clearPasskeyVerification();
                toast('Passkey setup required for admin access.', 'warning');
                resolve(null);
              }
            );
          });
        }
      }
    }

    // Normal flow for non-passkey users or already verified
    toast(`Welcome${isNewUser ? '' : ' back'}, ${user.displayName}!`, 'success');
    closeModal('#modal-auth');
    setTimeout(scrollToDashboard, 300);
    return user;
  } catch (error) {
    console.error('Google sign in error:', error);

    // Handle disallowed_useragent error (in-app browser that wasn't detected)
    if (error.code === 'auth/internal-error' || error.message?.includes('disallowed_useragent')) {
      showInAppBrowserWarning();
      return null;
    }

    if (error.code !== 'auth/popup-closed-by-user') {
      toast('Failed to sign in with Google. Please try again.', 'error');
    }
    throw error;
  }
}

// Sign In with Facebook (Popup)
export async function signInWithFacebook() {
  // Check for in-app browser first
  if (isInAppBrowser()) {
    showInAppBrowserWarning();
    return null;
  }

  try {
    const result = await signInWithPopup(auth, facebookProvider);
    const isNewUser = await ensureUserDocument(result.user);
    // Sanitize display name before showing
    const safeName = sanitizeHTML(result.user.displayName || 'there');
    toast(`Welcome${isNewUser ? '' : ' back'}, ${safeName}!`, 'success');
    closeModal('#modal-auth');
    setTimeout(scrollToDashboard, 300);
    return result.user;
  } catch (error) {

    let message = 'Failed to sign in with Facebook. ';
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        // User closed popup, no need to show error
        break;
      case 'auth/account-exists-with-different-credential':
        // Store the pending credential for linking after sign-in with existing provider
        pendingCredential = FacebookAuthProvider.credentialFromError(error);
        pendingEmail = error.customData?.email;

        if (pendingEmail) {
          // Check which providers are available for this email
          const methods = await fetchSignInMethodsForEmail(auth, pendingEmail);

          if (methods.includes('google.com')) {
            // Check for in-app browser before triggering Google sign-in
            if (isInAppBrowser()) {
              toast('Please open FitBreak in Safari/Chrome, then sign in with Google to link your accounts.', 'error');
              showInAppBrowserWarning();
              break;
            }
            toast('This email is linked to Google. Signing in with Google to link your Facebook account...', 'info');
            // Automatically trigger Google sign-in to link accounts
            try {
              const googleResult = await signInWithPopup(auth, googleProvider);
              // Now link the Facebook credential
              if (pendingCredential) {
                await linkWithCredential(googleResult.user, pendingCredential);
                toast('Facebook account linked successfully! You can now use either to sign in.', 'success');
                pendingCredential = null;
                pendingEmail = null;
                const isNewUser = await ensureUserDocument(googleResult.user);
                closeModal('#modal-auth');
                setTimeout(scrollToDashboard, 300);
                return googleResult.user;
              }
            } catch (linkError) {
              if (linkError.code === 'auth/popup-closed-by-user') {
                toast('Sign-in cancelled. Please try again.', 'error');
              } else {
                toast('Could not link accounts. Please try signing in with Google.', 'error');
              }
            }
          } else if (methods.includes('password')) {
            toast('This email is registered with a password. Please sign in with email/password first.', 'error');
          } else {
            toast('An account already exists with this email. Try a different sign-in method.', 'error');
          }
        } else {
          toast('An account already exists with this email. Try signing in with Google.', 'error');
        }
        break;
      case 'auth/operation-not-allowed':
        toast('Facebook sign-in is not available. Please contact support.', 'error');
        break;
      case 'auth/invalid-oauth-client-id':
        toast('Configuration error. Please contact support.', 'error');
        break;
      case 'auth/unauthorized-domain':
        toast('Sign-in is not available from this location. Please contact support.', 'error');
        break;
      case 'auth/popup-blocked':
        toast('Popup was blocked. Please allow popups for this site.', 'error');
        break;
      default:
        toast(message + (error.message || 'Please try again.'), 'error');
    }
    throw error;
  }
}

// Sign In with Apple (Popup)
export async function signInWithApple() {
  // Check for in-app browser first
  if (isInAppBrowser()) {
    showInAppBrowserWarning();
    return null;
  }

  try {
    const result = await signInWithPopup(auth, appleProvider);
    const isNewUser = await ensureUserDocument(result.user);
    toast(`Welcome${isNewUser ? '' : ' back'}, ${result.user.displayName || 'there'}!`, 'success');
    closeModal('#modal-auth');
    setTimeout(scrollToDashboard, 300);
    return result.user;
  } catch (error) {
    console.error('Apple sign in error:', error);

    // Handle disallowed_useragent error (in-app browser that wasn't detected)
    if (error.code === 'auth/internal-error' || error.message?.includes('disallowed_useragent')) {
      showInAppBrowserWarning();
      return null;
    }

    if (error.code === 'auth/account-exists-with-different-credential') {
      toast('An account already exists with this email. Try signing in with Google or email.', 'error');
    } else if (error.code !== 'auth/popup-closed-by-user') {
      toast('Failed to sign in with Apple. Please try again.', 'error');
    }
    throw error;
  }
}

// Initialize Google One Tap
function initializeGoogleOneTap() {
  // Only show One Tap if user is not already signed in
  if (auth.currentUser) return;
  
  // Check if Google Identity Services is loaded
  if (typeof google === 'undefined' || !google.accounts) {
    console.log('Google Identity Services not loaded yet');
    return;
  }

  try {
    // Construct Client ID from Firebase config
    const clientId = `${firebaseConfig.messagingSenderId}.apps.googleusercontent.com`;
    
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleOneTapResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin'
    });

    // Display One Tap prompt
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('One Tap not displayed:', notification.getNotDisplayedReason());
      }
    });
  } catch (error) {
    console.error('Google One Tap initialization error:', error);
  }
}

// Handle Google One Tap response
async function handleGoogleOneTapResponse(response) {
  try {
    // Get the ID token from the response
    const idToken = response.credential;
    
    // Create a credential from the ID token
    const credential = GoogleAuthProvider.credential(idToken);
    
    // Sign in with the credential
    const result = await signInWithCredential(auth, credential);
    
    toast(`Welcome, ${result.user.displayName}! 🎉`, 'success');
    return result.user;
  } catch (error) {
    console.error('Google One Tap sign in error:', error);
    toast('Failed to sign in with Google. Please try again.', 'error');
    throw error;
  }
}

// Sign Out
export async function signOutUser() {
  try {
    await signOut(auth);
    // Clear cached user data
    localStorage.removeItem('fitbreak_user');
    localStorage.removeItem('cachedUser');
    localStorage.removeItem('cachedUserData');
    sessionStorage.clear();
    toast('Signed out successfully. See you next time! 👋', 'success');
    // Redirect to main page after a brief delay for toast
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 500);
  } catch (error) {
    console.error('Sign out error:', error);
    toast('Failed to sign out. Please try again.', 'error');
    throw error;
  }
}

// Password Reset
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    toast('Password reset email sent! Check your inbox. 📧', 'success');
    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    let message = 'Failed to send reset email. ';
    
    switch (error.code) {
      case 'auth/user-not-found':
        message += 'No account found with this email.';
        break;
      case 'auth/invalid-email':
        message += 'Invalid email address.';
        break;
      default:
        message += error.message;
    }
    
    toast(message, 'error');
    throw error;
  }
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

// Export auth instance
export { auth };

// Initialize auth UI when components are loaded (header, footer, modals)
// The loader.js dispatches 'componentsLoaded' event when all components are ready
document.addEventListener('componentsLoaded', () => {
  initAuthUI();
});

// Fallback: if componentsLoaded already fired or loader.js not used
// Use MutationObserver to detect when profile button appears
function waitForElement(selector, callback, maxAttempts = 50) {
  let attempts = 0;
  const check = () => {
    const element = document.querySelector(selector);
    if (element) {
      callback();
    } else if (attempts < maxAttempts) {
      attempts++;
      setTimeout(check, 100);
    }
  };
  check();
}

// Try to initialize after a delay if components might already be loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    waitForElement('#user-profile-btn', () => {
      const btn = document.querySelector('#user-profile-btn');
      if (btn && !btn._authInitialized) {
        initAuthUI();
      }
    });
  });
} else {
  waitForElement('#user-profile-btn', () => {
    const btn = document.querySelector('#user-profile-btn');
    if (btn && !btn._authInitialized) {
      initAuthUI();
    }
  });
}

// Global delegated event listener as ultimate fallback for profile dropdown
// This ensures dropdown works even if other initialization fails
document.addEventListener('click', (e) => {
  const profileBtn = e.target.closest('#user-profile-btn');
  if (profileBtn) {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown && !profileBtn.dataset.dropdownInit) {
      e.stopPropagation();
      e.preventDefault();
      dropdown.classList.toggle('hidden');
    }
  }
}, true); // Use capture phase

// Initialize Google One Tap after page loads
// DISABLED: One Tap requires proper OAuth client ID configuration
// window.addEventListener('load', () => {
//   setTimeout(initializeGoogleOneTap, 500);
// });

function initAuthUI() {
  console.log('initAuthUI called');

  // Mark as initialized to prevent double init
  const profileBtn = $('#user-profile-btn');
  if (profileBtn) {
    if (profileBtn._authInitialized) {
      console.log('Auth UI already initialized, skipping');
      return;
    }
    profileBtn._authInitialized = true;
    console.log('Profile button found, marking as initialized');
  } else {
    console.log('Profile button NOT found');
  }

  // Sign In button - redirect to login page
  const btnSignIn = $('#btn-sign-in');
  if (btnSignIn) {
    btnSignIn.addEventListener('click', () => {
      window.location.href = '/login.html';
    });
  }

  // Get Started (Sign Up) button - redirect to login page in signup mode
  const btnSignUp = $('#btn-sign-up');
  if (btnSignUp) {
    btnSignUp.addEventListener('click', () => {
      window.location.href = '/login.html?mode=signup';
    });
  }

  // Sign Out button
  const btnSignOut = $('#btn-sign-out');
  if (btnSignOut) {
    btnSignOut.addEventListener('click', signOutUser);
  }

  // Auth modal forms
  const authForm = $('#auth-form');
  if (authForm) {
    authForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(authForm);
      const email = formData.get('auth-email');
      const password = formData.get('auth-password');
      const displayName = formData.get('auth-name');
      const phone = formData.get('auth-phone');
      const isSignUp = $('#auth-mode').value === 'signup';

      if (isSignUp) {
        await signUpWithEmail(email, password, displayName, phone);
      } else {
        await signInWithEmail(email, password);
      }
    });
  }

  // Google Sign In button
  const btnGoogleSignIn = $('#btn-google-signin');
  if (btnGoogleSignIn) {
    btnGoogleSignIn.addEventListener('click', signInWithGoogle);
  }

  // Facebook Sign In button
  const btnFacebookSignIn = $('#btn-facebook-signin');
  if (btnFacebookSignIn) {
    btnFacebookSignIn.addEventListener('click', signInWithFacebook);
  }

  // Apple Sign In button
  const btnAppleSignIn = $('#btn-apple-signin');
  if (btnAppleSignIn) {
    btnAppleSignIn.addEventListener('click', signInWithApple);
  }

  // Toggle between sign in and sign up
  const btnToggleAuthMode = $('#btn-toggle-auth-mode');
  if (btnToggleAuthMode) {
    btnToggleAuthMode.addEventListener('click', toggleAuthMode);
  }

  // Forgot password
  const btnForgotPassword = $('#btn-forgot-password');
  if (btnForgotPassword) {
    btnForgotPassword.addEventListener('click', () => {
      const email = prompt('Enter your email address:');
      if (email) {
        resetPassword(email);
      }
    });
  }

  // Close modals
  $$('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Try multiple selectors to find the modal container
      const modal = btn.closest('.modal') || btn.closest('[id^="modal-"]') || btn.closest('.fixed.inset-0');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex', 'active');
      }
    });
  });

  // Toggle user dropdown
  const userProfileBtn = $('#user-profile-btn');
  const userDropdown = $('#user-dropdown');
  console.log('Setting up dropdown - btn:', !!userProfileBtn, 'dropdown:', !!userDropdown);

  if (userProfileBtn && userDropdown) {
    // Helper to show dropdown (handles both hidden class and opacity/invisible classes)
    const showDropdown = () => {
      userDropdown.classList.remove('hidden', 'opacity-0', 'invisible', 'scale-95');
      userDropdown.classList.add('opacity-100', 'visible', 'scale-100');
    };

    // Helper to hide dropdown
    const hideDropdown = () => {
      // Check which method the dropdown uses
      if (userDropdown.classList.contains('opacity-100') ||
          userDropdown.classList.contains('scale-100') ||
          userDropdown.classList.contains('visible')) {
        // Uses opacity/scale method
        userDropdown.classList.remove('opacity-100', 'visible', 'scale-100');
        userDropdown.classList.add('opacity-0', 'invisible', 'scale-95');
      } else {
        // Uses hidden class method
        userDropdown.classList.add('hidden');
      }
    };

    // Check if dropdown is visible
    const isDropdownVisible = () => {
      return !userDropdown.classList.contains('hidden') &&
             !userDropdown.classList.contains('invisible') &&
             !userDropdown.classList.contains('opacity-0');
    };

    // Direct event listener on button
    userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      console.log('Profile button clicked (direct), toggling dropdown');
      if (isDropdownVisible()) {
        hideDropdown();
      } else {
        showDropdown();
      }
    });

    // Also handle clicks on the avatar image inside the button
    const avatar = userProfileBtn.querySelector('#user-avatar');
    if (avatar) {
      avatar.style.pointerEvents = 'none'; // Let clicks pass through to button
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!userDropdown.contains(e.target) && !userProfileBtn.contains(e.target)) {
        hideDropdown();
      }
    });

    // Mark button as initialized
    userProfileBtn.dataset.dropdownInit = 'true';
    console.log('Dropdown click handler attached');
  } else {
    console.error('Could not set up dropdown - missing elements');
  }

  // Setup notification bell
  const notificationBtn = $('#notification-btn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // For now, show a coming soon message
      // TODO: Implement full notification system with Firestore
      toast('Notifications coming soon! We\'ll notify you about class updates & promos.', 'info');
    });
  }

  // Initialize booking buttons
  initBookingButtons();
}

// Initialize booking button handlers
function initBookingButtons() {
  const bookButtons = $$('[data-plan-select]');
  bookButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (auth.currentUser) {
        // Redirect to payments page to complete purchase
        window.location.href = '/payments.html';
      } else {
        toast('Please sign in to book a class', 'warning');
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 500);
      }
    });
  });
}

function toggleAuthMode() {
  const authMode = $('#auth-mode');
  const authTitle = $('#auth-title');
  const authSubmitBtn = $('#auth-submit-btn');
  const nameField = $('#auth-name-field');
  const phoneField = $('#auth-phone-field');
  const toggleText = $('#toggle-auth-text');

  if (authMode.value === 'signin') {
    authMode.value = 'signup';
    authTitle.textContent = 'Create Account';
    authSubmitBtn.textContent = 'Sign Up';
    nameField.style.display = 'block';
    if (phoneField) phoneField.style.display = 'block';
    toggleText.innerHTML = 'Already have an account? <strong>Sign In</strong>';
  } else {
    authMode.value = 'signin';
    authTitle.textContent = 'Sign In';
    authSubmitBtn.textContent = 'Sign In';
    nameField.style.display = 'none';
    if (phoneField) phoneField.style.display = 'none';
    toggleText.innerHTML = 'Don\'t have an account? <strong>Sign Up</strong>';
  }
}
