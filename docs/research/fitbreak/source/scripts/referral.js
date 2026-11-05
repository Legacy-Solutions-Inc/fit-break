// Referral System for FitBreak
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  limit,
  increment,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js';
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase (use existing app if already initialized)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, 'asia-db');
const functions = getFunctions(app, 'asia-east2');

// Cloud Function for secure referral credit awards
const awardReferralCreditsFn = httpsCallable(functions, 'awardReferralCredits');

let currentUser = null;
let qrCodeInstance = null;

// Initialize auth state listener
onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  // Update profile page stats if elements exist
  if (user) {
    try {
      const stats = await getReferralStats(user.uid);
      const profileCount = document.getElementById('profile-referral-count');
      const profileRewards = document.getElementById('profile-referral-rewards');
      if (profileCount) profileCount.textContent = stats.count;
      if (profileRewards) profileRewards.textContent = stats.rewards;
    } catch (error) {
      console.error('Error loading referral stats:', error);
    }
  }
});

// Generate a unique referral code for a user
function generateReferralCode(userId, userName) {
  // Create a short, memorable code from user ID and name
  const namePrefix = userName ? userName.substring(0, 3).toUpperCase() : 'FIT';
  const idSuffix = userId.substring(0, 6).toUpperCase();
  return `${namePrefix}${idSuffix}`;
}

// Get or create referral code for current user
async function getUserReferralCode(user) {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    let referralCode;

    if (userDoc.exists() && userDoc.data().referralCode) {
      referralCode = userDoc.data().referralCode;
    } else {
      // Generate new referral code
      const userName = user.displayName || user.email.split('@')[0];
      referralCode = generateReferralCode(user.uid, userName);

      // Save to user document
      await setDoc(userRef, {
        referralCode: referralCode,
        referralCount: 0,
        referralRewards: 0
      }, { merge: true });
    }

    return referralCode;
  } catch (error) {
    console.error('Error getting referral code:', error);
    throw error;
  }
}

// Get referral stats
async function getReferralStats(userId) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return {
        count: userDoc.data().referralCount || 0,
        rewards: userDoc.data().referralRewards || 0
      };
    }

    return { count: 0, rewards: 0 };
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return { count: 0, rewards: 0 };
  }
}

// Generate referral link
function generateReferralLink(referralCode) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/?ref=${referralCode}`;
}

// Generate QR Code
function generateQRCode(referralLink) {
  const container = document.getElementById('qr-code-container');

  // Clear previous QR code
  container.innerHTML = '';

  // Generate new QR code
  qrCodeInstance = new QRCode(container, {
    text: referralLink,
    width: 200,
    height: 200,
    colorDark: '#D71E49',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  });
}

// Download QR Code
function downloadQRCode() {
  const canvas = document.querySelector('#qr-code-container canvas');
  if (canvas) {
    const link = document.createElement('a');
    link.download = 'fitbreak-referral-qr.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } else {
    // Fallback: try to get image
    const img = document.querySelector('#qr-code-container img');
    if (img) {
      const link = document.createElement('a');
      link.download = 'fitbreak-referral-qr.png';
      link.href = img.src;
      link.click();
    }
  }
}

// Copy referral link to clipboard
async function copyReferralLink() {
  const input = document.getElementById('referral-link-input');
  const successMsg = document.getElementById('copy-success');

  try {
    await navigator.clipboard.writeText(input.value);
    successMsg.classList.remove('hidden');
    setTimeout(() => {
      successMsg.classList.add('hidden');
    }, 3000);
  } catch (error) {
    // Fallback for older browsers
    input.select();
    document.execCommand('copy');
    successMsg.classList.remove('hidden');
    setTimeout(() => {
      successMsg.classList.add('hidden');
    }, 3000);
  }
}

// Open referral modal
async function openReferralModal() {
  const modal = document.getElementById('referral-modal');
  const authModal = document.getElementById('modal-auth');

  // Check if user is logged in
  if (!currentUser) {
    // Show auth modal for guest users
    if (authModal) {
      authModal.classList.remove('hidden');
      authModal.classList.add('flex');
    }
    return;
  }

  try {
    // Get referral code
    const referralCode = await getUserReferralCode(currentUser);
    const referralLink = generateReferralLink(referralCode);

    // Update modal with referral link
    document.getElementById('referral-link-input').value = referralLink;

    // Generate QR code
    generateQRCode(referralLink);

    // Get and display stats
    const stats = await getReferralStats(currentUser.uid);
    document.getElementById('referral-count').textContent = stats.count;
    document.getElementById('referral-rewards').textContent = stats.rewards;

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  } catch (error) {
    console.error('Error opening referral modal:', error);
    alert('Sorry, there was an error loading your referral information. Please try again.');
  }
}

// Close referral modal
function closeReferralModal() {
  const modal = document.getElementById('referral-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

// Check for referral code in URL and track it
async function checkReferralInURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const referralCode = urlParams.get('ref');

  if (referralCode) {
    // Store in sessionStorage to track after sign-up
    sessionStorage.setItem('referralCode', referralCode);

    // Track referral click
    try {
      await addDoc(collection(db, 'referral_clicks'), {
        referralCode: referralCode,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error tracking referral click:', error);
    }
  }
}

// Process referral after successful sign-up
async function processReferralSignup(newUserId) {
  const referralCode = sessionStorage.getItem('referralCode');

  if (!referralCode) return;

  try {
    // Find the referrer
    const usersQuery = query(
      collection(db, 'users'),
      where('referralCode', '==', referralCode),
      limit(1)
    );
    const usersSnapshot = await getDocs(usersQuery);

    if (usersSnapshot.empty) {
      console.log('Referral code not found');
      return;
    }

    const referrerDoc = usersSnapshot.docs[0];
    const referrerId = referrerDoc.id;

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
    await updateDoc(doc(db, 'users', referrerId), {
      referralCount: increment(1)
    });

    // Clear from session
    sessionStorage.removeItem('referralCode');

    console.log('✅ Referral processed successfully');
  } catch (error) {
    console.error('Error processing referral:', error);
  }
}

// Award referral rewards when referred user books first class
async function awardReferralRewards(userId) {
  try {
    // Check if this user was referred
    const referralQuery = query(
      collection(db, 'referrals'),
      where('referredUserId', '==', userId),
      where('status', '==', 'pending'),
      limit(1)
    );
    const referralSnapshot = await getDocs(referralQuery);

    if (referralSnapshot.empty) return;

    const referralDoc = referralSnapshot.docs[0];
    const referralData = referralDoc.data();
    const referrerId = referralData.referrerId;

    // Update referral status first
    await updateDoc(referralDoc.ref, {
      status: 'completed',
      rewardGiven: true,
      completedAt: serverTimestamp()
    });

    // Award credits via secure Cloud Function
    // This handles credit updates for both users and creates audit logs
    await awardReferralCreditsFn({
      referrerId: referrerId,
      referredUserId: userId,
      referralId: referralDoc.id
    });

    console.log('✅ Referral rewards awarded');
  } catch (error) {
    console.error('Error awarding referral rewards:', error);
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Get My Referral Link button
  const getReferralBtn = document.getElementById('get-referral-code');
  if (getReferralBtn) {
    getReferralBtn.addEventListener('click', openReferralModal);
  }

  // Close modal button
  const closeModalBtn = document.getElementById('close-referral-modal');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeReferralModal);
  }

  // Click outside modal to close
  const modal = document.getElementById('referral-modal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeReferralModal();
      }
    });
  }

  // Copy referral link button
  const copyBtn = document.getElementById('copy-referral-link');
  if (copyBtn) {
    copyBtn.addEventListener('click', copyReferralLink);
  }

  // Download QR code button
  const downloadBtn = document.getElementById('download-qr-code');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadQRCode);
  }

  // Check for referral in URL on page load
  checkReferralInURL();
});

// Export functions for use in other scripts
export {
  processReferralSignup,
  awardReferralRewards
};
