// Settings Module with Wearable Integration
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js';
import firebaseConfig from './firebase-config-module.js';

// Use existing app if already initialized
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, 'asia-db');
const functions = getFunctions(app, 'asia-east2');

// Wearable OAuth Configuration
// Fitbit: https://dev.fitbit.com/apps
const WEARABLE_CONFIG = {
  fitbit: {
    // Get from: https://dev.fitbit.com/apps
    clientId: '', // Will be loaded from Firestore config
    redirectUri: `${window.location.origin}/settings.html`,
    scopes: ['activity', 'heartrate', 'weight', 'sleep', 'profile']
  }
};

let currentUser = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    await loadSettings(user);
    await loadWearableConfig();
    await loadWearableStatus(user.uid);
    await loadGoals(user.uid);
    handleOAuthCallback();
  } else {
    window.location.href = '/login.html';
  }
});

// Load OAuth client IDs from Firestore config
async function loadWearableConfig() {
  try {
    const configDoc = await getDoc(doc(db, 'config', 'wearables'));
    if (configDoc.exists()) {
      const config = configDoc.data();
      if (config.fitbit?.clientId) {
        WEARABLE_CONFIG.fitbit.clientId = config.fitbit.clientId;
      }

      if (!config.fitbit?.clientId) {
        console.log('Fitbit OAuth not yet configured in Firestore config/wearables');
      }
    }
  } catch (error) {
    console.log('Wearable config not found, using defaults');
  }
}

async function loadSettings(user) {
  // Update user info in sidebar
  const userName = document.getElementById('user-name');
  const userEmail = document.getElementById('user-email');
  const userAvatar = document.getElementById('user-avatar');
  const currentEmail = document.getElementById('current-email');

  if (userName) userName.textContent = user.displayName || user.email.split('@')[0];
  if (userEmail) userEmail.textContent = user.email;
  if (currentEmail) currentEmail.textContent = user.email;

  const avatarUrl = user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email)}&backgroundColor=e64a8a`;
  if (userAvatar) userAvatar.src = avatarUrl;

  if (user.metadata.lastSignInTime) {
    const lastLogin = new Date(user.metadata.lastSignInTime);
    const lastLoginEl = document.getElementById('last-login');
    if (lastLoginEl) lastLoginEl.textContent = lastLogin.toLocaleString();
  }

  // Load user data for sidebar
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && typeof updateSidebarUser === 'function') {
      updateSidebarUser(user, userDoc.data());
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  }

  // Load notification settings
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', user.uid));
    if (settingsDoc.exists()) {
      const settings = settingsDoc.data();
      const emailNotif = document.getElementById('email-notifications');
      const classRemind = document.getElementById('class-reminders');
      const marketingEmails = document.getElementById('marketing-emails');

      if (emailNotif) emailNotif.checked = settings.emailNotifications !== false;
      if (classRemind) classRemind.checked = settings.classReminders !== false;
      if (marketingEmails) marketingEmails.checked = settings.marketingEmails === true;
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
}

// Load fitness goals
async function loadGoals(userId) {
  try {
    const goalsDoc = await getDoc(doc(db, 'users', userId, 'settings', 'goals'));
    if (goalsDoc.exists()) {
      const goals = goalsDoc.data();
      const weeklyGoal = document.getElementById('weekly-goal');
      const calorieGoal = document.getElementById('calorie-goal');
      const stepsGoal = document.getElementById('steps-goal');
      const waterGoal = document.getElementById('water-goal');

      if (weeklyGoal && goals.weeklyClassesGoal) weeklyGoal.value = goals.weeklyClassesGoal;
      if (calorieGoal && goals.calorieGoal) calorieGoal.value = goals.calorieGoal;
      if (stepsGoal && goals.stepsGoal) stepsGoal.value = goals.stepsGoal;
      if (waterGoal && goals.waterGoal) waterGoal.value = goals.waterGoal;
    }
  } catch (error) {
    console.error('Error loading goals:', error);
  }
}

// Save goals to Firestore
window.saveGoals = async function() {
  if (!currentUser) return;

  const goals = {
    weeklyClassesGoal: parseInt(document.getElementById('weekly-goal')?.value) || 3,
    calorieGoal: parseInt(document.getElementById('calorie-goal')?.value) || 2000,
    stepsGoal: parseInt(document.getElementById('steps-goal')?.value) || 10000,
    waterGoal: parseInt(document.getElementById('water-goal')?.value) || 2000,
    updatedAt: serverTimestamp()
  };

  try {
    await setDoc(doc(db, 'users', currentUser.uid, 'settings', 'goals'), goals, { merge: true });
    showToast('Goals saved!');
  } catch (error) {
    console.error('Error saving goals:', error);
    showToast('Error saving goals');
  }
};

// ============================================
// WEARABLE CONNECTION STATUS
// ============================================

async function loadWearableStatus(userId) {
  try {
    const wearablesDoc = await getDoc(doc(db, 'users', userId, 'settings', 'wearables'));

    if (wearablesDoc.exists()) {
      const wearables = wearablesDoc.data();

      // Update Fitbit status
      if (wearables.fitbit?.connected) {
        updateWearableCard('fitbit', true, wearables.fitbit.connectedAt);
      }

      // Update last sync time
      if (wearables.lastSyncAt) {
        const lastSync = wearables.lastSyncAt.toDate ? wearables.lastSyncAt.toDate() : new Date(wearables.lastSyncAt);
        const lastSyncEl = document.getElementById('last-sync-time');
        if (lastSyncEl) {
          lastSyncEl.textContent = `Last synced: ${formatTimeAgo(lastSync)}`;
        }
      }
    }
  } catch (error) {
    console.error('Error loading wearable status:', error);
  }
}

function updateWearableCard(provider, connected, connectedAt) {
  const statusEl = document.getElementById(`${provider}-status`);
  const btnEl = document.getElementById(`${provider}-btn`);
  const cardEl = document.getElementById(`${provider}-card`);

  if (connected) {
    if (statusEl) {
      const date = connectedAt?.toDate ? connectedAt.toDate() : new Date(connectedAt);
      statusEl.textContent = `Connected ${formatTimeAgo(date)}`;
      statusEl.className = 'text-sm text-green-600';
    }
    if (btnEl) {
      btnEl.textContent = 'Disconnect';
      btnEl.className = 'px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-all';
    }
    if (cardEl) {
      cardEl.classList.add('border-green-200', 'bg-green-50');
    }
  } else {
    if (statusEl) {
      statusEl.textContent = 'Not connected';
      statusEl.className = 'text-sm text-gray-500';
    }
    if (btnEl) {
      btnEl.textContent = 'Connect';
      btnEl.className = 'px-4 py-2 bg-brand-500 text-white font-medium rounded-xl hover:bg-brand-600 transition-all';
    }
    if (cardEl) {
      cardEl.classList.remove('border-green-200', 'bg-green-50');
    }
  }
}

function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// ============================================
// FITBIT OAUTH
// ============================================

window.toggleFitbit = async function() {
  if (!currentUser) return;

  // Check if already connected
  const wearablesDoc = await getDoc(doc(db, 'users', currentUser.uid, 'settings', 'wearables'));
  const isConnected = wearablesDoc.exists() && wearablesDoc.data().fitbit?.connected;

  if (isConnected) {
    // Disconnect
    if (confirm('Disconnect Fitbit? Your synced data will remain.')) {
      await disconnectWearable('fitbit');
      updateWearableCard('fitbit', false);
      showToast('Fitbit disconnected');
    }
  } else {
    // Connect - initiate OAuth
    if (!WEARABLE_CONFIG.fitbit.clientId) {
      showToast('Fitbit not configured. Contact admin.');
      return;
    }
    initiateFitbitAuth();
  }
};

function initiateFitbitAuth() {
  const config = WEARABLE_CONFIG.fitbit;

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state: 'fitbit'
  });

  window.location.href = `https://www.fitbit.com/oauth2/authorize?${params.toString()}`;
}

// ============================================
// OAUTH CALLBACK HANDLER
// ============================================

async function handleOAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');

  if (error) {
    showToast(`Connection failed: ${error}`);
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
  }

  if (!code || !state) return;

  // Clean up URL immediately
  window.history.replaceState({}, document.title, window.location.pathname);

  if (state === 'fitbit') {
    await handleFitbitCallback(code);
  }
}

async function handleFitbitCallback(code) {
  showToast('Connecting Fitbit...');

  try {
    // Call Cloud Function to exchange auth code for tokens
    const exchangeFitbitToken = httpsCallable(functions, 'exchangeFitbitToken');
    const result = await exchangeFitbitToken({
      code,
      redirectUri: WEARABLE_CONFIG.fitbit.redirectUri
    });

    if (result.data.success) {
      updateWearableCard('fitbit', true, new Date());
      showToast('Fitbit connected successfully!');

      // Trigger initial sync
      try {
        const syncWearableData = httpsCallable(functions, 'syncWearableData');
        await syncWearableData({ provider: 'fitbit' });
        showToast('Fitbit data synced!');
      } catch (syncError) {
        console.log('Initial sync skipped:', syncError.message);
      }
    } else {
      throw new Error(result.data.error || 'Token exchange failed');
    }

  } catch (error) {
    console.error('Error connecting Fitbit:', error);
    showToast('Failed to connect Fitbit: ' + (error.message || 'Unknown error'));
  }
}

// ============================================
// DISCONNECT WEARABLE
// ============================================

async function disconnectWearable(provider) {
  if (!currentUser) return;

  try {
    await updateDoc(doc(db, 'users', currentUser.uid, 'settings', 'wearables'), {
      [provider]: {
        connected: false,
        disconnectedAt: serverTimestamp(),
        accessToken: null,
        refreshToken: null,
        authCode: null
      }
    });
  } catch (error) {
    console.error('Error disconnecting wearable:', error);
    throw error;
  }
}

// ============================================
// SYNC ALL DEVICES
// ============================================

window.syncAllDevices = async function() {
  if (!currentUser) return;

  const syncBtn = document.getElementById('sync-btn');
  if (syncBtn) {
    syncBtn.disabled = true;
    syncBtn.innerHTML = `
      <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
      </svg>
      Syncing...
    `;
  }

  try {
    // Check connected devices
    const wearablesDoc = await getDoc(doc(db, 'users', currentUser.uid, 'settings', 'wearables'));

    if (!wearablesDoc.exists()) {
      showToast('No devices connected');
      return;
    }

    const wearables = wearablesDoc.data();
    const syncPromises = [];

    if (wearables.fitbit?.connected) {
      const syncFitbit = httpsCallable(functions, 'syncWearableData');
      syncPromises.push(syncFitbit({ provider: 'fitbit' }).catch(e => ({ error: e })));
    }

    if (syncPromises.length > 0) {
      const results = await Promise.all(syncPromises);
      const successCount = results.filter(r => !r.error).length;

      await updateDoc(doc(db, 'users', currentUser.uid, 'settings', 'wearables'), {
        lastSyncAt: serverTimestamp()
      });

      const lastSyncEl = document.getElementById('last-sync-time');
      if (lastSyncEl) lastSyncEl.textContent = 'Last synced: just now';

      showToast(`Synced ${successCount} device(s)!`);
    } else {
      showToast('No devices to sync');
    }

  } catch (error) {
    console.error('Error syncing devices:', error);
    showToast('Sync failed. Try again later.');
  } finally {
    if (syncBtn) {
      syncBtn.disabled = false;
      syncBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
        </svg>
        Sync Now
      `;
    }
  }
};

// ============================================
// EXISTING SETTINGS FUNCTIONALITY
// ============================================

// Save notification settings on change
async function saveSettings() {
  const user = auth.currentUser;
  if (!user) return;

  const settings = {
    emailNotifications: document.getElementById('email-notifications')?.checked ?? true,
    classReminders: document.getElementById('class-reminders')?.checked ?? true,
    marketingEmails: document.getElementById('marketing-emails')?.checked ?? false,
    updatedAt: new Date()
  };

  try {
    await setDoc(doc(db, 'settings', user.uid), settings);
    showToast('Settings saved');
  } catch (error) {
    console.error('Error saving settings:', error);
    showToast('Error saving settings');
  }
}

// Add change listeners for notification toggles
['email-notifications', 'class-reminders', 'marketing-emails'].forEach(id => {
  document.getElementById(id)?.addEventListener('change', saveSettings);
});

// Sign out handler
document.getElementById('btn-sign-out')?.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Error signing out:', error);
  }
});

// Change Password - sends password reset email
window.changePassword = async function() {
  const user = auth.currentUser;
  if (!user || !user.email) {
    showToast('Please sign in to change your password');
    return;
  }

  try {
    await sendPasswordResetEmail(auth, user.email);
    showToast('Password reset email sent! Check your inbox.');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    if (error.code === 'auth/too-many-requests') {
      showToast('Too many requests. Please try again later.');
    } else {
      showToast('Error sending reset email. Please try again.');
    }
  }
};

console.log('Settings.js loaded with wearable integration');
