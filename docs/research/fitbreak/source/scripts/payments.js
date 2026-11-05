// Payments Module
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import firebaseConfig from './firebase-config-module.js';

// Use existing app if already initialized, otherwise initialize
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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await loadPaymentData(user);
  } else {
    window.location.href = '/login.html';
  }
});

// Global data for export
let allUsageHistory = [];
let currentUserId = null;

async function loadPaymentData(user) {
  currentUserId = user.uid;

  const userNameEl = document.getElementById('user-name');
  const userEmailEl = document.getElementById('user-email');
  const userAvatarEl = document.getElementById('user-avatar');

  if (userNameEl) userNameEl.textContent = user.displayName || user.email.split('@')[0];
  if (userEmailEl) userEmailEl.textContent = user.email;
  const avatarUrl = user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email)}&backgroundColor=e64a8a`;
  if (userAvatarEl) userAvatarEl.src = avatarUrl;

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log('User data loaded:', data);

      // Update sidebar
      if (typeof updateSidebarUser === 'function') {
        updateSidebarUser(user, data);
      }

      // Handle credits - can be a number (old format) or object (new format)
      let creditsRemaining = 0;
      let creditsUnlimited = false;
      let expiryDate = null;

      if (typeof data.credits === 'number') {
        // Old format: credits is a plain number
        creditsRemaining = data.credits;
      } else if (typeof data.credits === 'object' && data.credits !== null) {
        // New format: credits is an object
        creditsRemaining = data.credits.remaining || 0;
        creditsUnlimited = data.credits.unlimited || false;
        expiryDate = data.credits.expiryDate;
      }

      // Also check flat fields as fallback
      creditsRemaining = creditsRemaining || data.creditsRemaining || 0;

      document.getElementById('available-credits').textContent = creditsUnlimited ? 'Unlimited' : creditsRemaining;

      // Determine membership status
      let membershipStatus = 'Inactive';
      if (creditsUnlimited) {
        membershipStatus = 'Unlimited';
      } else if (creditsRemaining > 0) {
        membershipStatus = 'Active';
      }
      document.getElementById('membership-status').textContent = membershipStatus;

      // Handle expiry date
      expiryDate = expiryDate || data.creditsExpiry || data.membershipExpiry;
      if (expiryDate) {
        const expiry = expiryDate.toDate ? expiryDate.toDate() : new Date(expiryDate);
        const daysLeft = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
        document.getElementById('credits-expiry').textContent = daysLeft > 0 ? `Expires in ${daysLeft} days` : 'Expired';
      }
    }

    await Promise.all([
      loadPaymentHistory(user.uid),
      loadCreditUsageHistory(user.uid)
    ]);

    // Setup filter listener
    const usageFilter = document.getElementById('usage-filter');
    if (usageFilter) {
      usageFilter.addEventListener('change', () => {
        renderUsageHistory(usageFilter.value);
      });
    }
  } catch (error) {
    console.error('Error loading payment data:', error);
  }
}

async function loadPaymentHistory(userId) {
  try {
    const paymentsRef = collection(db, 'payments');
    // Try with createdAt first (what checkout.js uses), fallback to unordered if no index
    let snapshot;
    try {
      const paymentsQuery = query(paymentsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      snapshot = await getDocs(paymentsQuery);
    } catch (indexError) {
      console.log('Index not available, loading without ordering');
      const paymentsQuery = query(paymentsRef, where('userId', '==', userId));
      snapshot = await getDocs(paymentsQuery);
    }

    const container = document.getElementById('payment-history');
    if (snapshot.empty) {
      container.innerHTML = '<div class="p-8 text-center text-gray-500"><p>No payment history yet</p></div>';
      return;
    }

    container.innerHTML = '';
    snapshot.forEach(docSnap => {
      const payment = docSnap.data();
      const paymentEl = createPaymentElement(payment, docSnap.id);
      container.appendChild(paymentEl);
    });
  } catch (error) {
    console.error('Error loading payment history:', error);
  }
}

function createPaymentElement(payment, paymentId) {
  const div = document.createElement('div');
  div.className = 'p-6 flex items-center justify-between hover:bg-gray-50 transition-colors';

  // Handle both timestamp and createdAt fields
  const paymentDate = payment.timestamp || payment.createdAt || payment.paidAt;
  let date = 'Unknown date';
  let dateObj = new Date();
  if (paymentDate) {
    dateObj = paymentDate.toDate ? paymentDate.toDate() : new Date(paymentDate);
    date = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  const packageName = payment.packageName || payment.planType || 'Credits Purchase';
  const creditsDisplay = payment.unlimited ? 'Unlimited' : `${payment.credits || 0} credits`;

  div.innerHTML = `
    <div class="flex-1">
      <p class="font-semibold text-gray-900">${packageName}</p>
      <p class="text-sm text-gray-500">${date} • ${creditsDisplay}</p>
    </div>
    <div class="flex items-center gap-4">
      <div class="text-right">
        <p class="font-bold text-gray-900">₱${payment.amount?.toLocaleString() || '0'}</p>
        <span class="inline-block px-2 py-1 text-xs font-semibold rounded-full ${
          payment.status === 'completed' ? 'bg-green-100 text-green-700' :
          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-700'
        }">${payment.status || 'pending'}</span>
      </div>
      ${payment.status === 'completed' ? `
        <button onclick="downloadInvoice('${paymentId}', '${packageName.replace(/'/g, "\\'")}', ${payment.amount || 0}, '${date}', ${payment.credits || 0})"
                class="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                title="Download Invoice">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </button>
      ` : ''}
    </div>
  `;

  return div;
}

// Generate and download invoice as PDF-style HTML
window.downloadInvoice = function(paymentId, packageName, amount, date, credits) {
  const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>FitBreak Invoice - ${paymentId}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; background: #f5f5f5; }
    .invoice { max-width: 600px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 3px solid #D71E49; padding-bottom: 20px; }
    .logo { font-size: 28px; font-weight: bold; color: #D71E49; }
    .logo-sub { font-size: 12px; color: #666; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { margin: 0; color: #333; font-size: 24px; }
    .invoice-title p { margin: 5px 0 0; color: #666; font-size: 14px; }
    .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .details-section h3 { margin: 0 0 10px; color: #333; font-size: 14px; text-transform: uppercase; }
    .details-section p { margin: 3px 0; color: #666; font-size: 14px; }
    .items { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items th { text-align: left; padding: 12px; background: #f8f8f8; color: #333; font-size: 14px; border-bottom: 2px solid #ddd; }
    .items td { padding: 12px; border-bottom: 1px solid #eee; color: #333; }
    .items .amount { text-align: right; }
    .total { text-align: right; margin-top: 20px; }
    .total-row { display: flex; justify-content: flex-end; gap: 40px; padding: 8px 0; }
    .total-row.grand { font-size: 18px; font-weight: bold; color: #D71E49; border-top: 2px solid #D71E49; padding-top: 15px; margin-top: 10px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }
    @media print { body { background: white; padding: 0; } .invoice { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <div class="logo">FitBreak</div>
        <div class="logo-sub">Women-Only Fitness Studio</div>
      </div>
      <div class="invoice-title">
        <h1>INVOICE</h1>
        <p>#${paymentId.substring(0, 8).toUpperCase()}</p>
        <p>${date}</p>
      </div>
    </div>

    <div class="details">
      <div class="details-section">
        <h3>From</h3>
        <p><strong>FitBreak Calapan</strong></p>
        <p>2nd Floor Roxas Drive, Brgy Ilaya</p>
        <p>Calapan City, Oriental Mindoro</p>
        <p>calapan1@fitbreak.ph</p>
      </div>
      <div class="details-section">
        <h3>Payment Date</h3>
        <p>${date}</p>
        <p style="margin-top: 15px;"><strong>Status:</strong> <span style="color: #22c55e;">PAID</span></p>
      </div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>Description</th>
          <th>Credits</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${packageName}</td>
          <td>${credits} classes</td>
          <td class="amount">₱${amount.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <div class="total">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>₱${amount.toLocaleString()}</span>
      </div>
      <div class="total-row grand">
        <span>Total Paid:</span>
        <span>₱${amount.toLocaleString()}</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for choosing FitBreak!</p>
      <p>For questions, contact us at calapan1@fitbreak.ph</p>
    </div>
  </div>
  <script>window.print();</script>
</body>
</html>`;

  // Open in new window for printing/saving
  const printWindow = window.open('', '_blank');
  printWindow.document.write(invoiceHtml);
  printWindow.document.close();
}

document.getElementById('btn-sign-out')?.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Error signing out:', error);
  }
});

// Load credit usage history (bookings + payments combined)
async function loadCreditUsageHistory(userId) {
  const container = document.getElementById('credit-usage-history');
  if (!container) return;

  try {
    // Load payments (credits added)
    const paymentsRef = collection(db, 'payments');
    const paymentsQuery = query(paymentsRef, where('userId', '==', userId));
    const paymentsSnapshot = await getDocs(paymentsQuery);

    // Load bookings (credits used)
    const bookingsRef = collection(db, 'bookings');
    const bookingsQuery = query(bookingsRef, where('userId', '==', userId));
    const bookingsSnapshot = await getDocs(bookingsQuery);

    // Build unified history
    allUsageHistory = [];

    // Add payments as credit additions
    let totalPurchased = 0;
    paymentsSnapshot.forEach(doc => {
      const payment = doc.data();
      if (payment.status === 'completed') {
        totalPurchased += payment.credits || 0;
        const date = payment.createdAt?.toDate?.() || payment.timestamp?.toDate?.() || new Date();
        allUsageHistory.push({
          type: 'credit_added',
          date,
          credits: payment.credits || 0,
          description: payment.packageName || payment.planType || 'Credits Purchase',
          amount: payment.amount || 0,
          icon: 'plus',
          color: 'green'
        });
      }
    });

    // Add bookings as credit usage
    let totalUsed = 0;
    let classesAttended = 0;
    bookingsSnapshot.forEach(doc => {
      const booking = doc.data();
      const dateField = booking.createdAt || booking.classDate || booking.bookingDate;
      const date = dateField?.toDate?.() || (typeof dateField === 'string' ? new Date(dateField) : new Date());

      if (booking.status === 'checked_in' || booking.status === 'confirmed' || booking.status === 'completed') {
        totalUsed++;
        if (booking.status === 'checked_in' || booking.status === 'completed') {
          classesAttended++;
        }
        allUsageHistory.push({
          type: 'credit_used',
          date,
          credits: -1,
          description: booking.className || 'Class Booking',
          classTime: booking.classTime || '',
          status: booking.status,
          icon: 'minus',
          color: booking.status === 'checked_in' ? 'brand' : 'blue'
        });
      } else if (booking.status === 'cancelled') {
        allUsageHistory.push({
          type: 'credit_refunded',
          date,
          credits: 1,
          description: `Cancelled: ${booking.className || 'Class'}`,
          icon: 'refresh',
          color: 'yellow'
        });
      }
    });

    // Sort by date descending
    allUsageHistory.sort((a, b) => b.date - a.date);

    // Update summary stats
    const creditsPurchasedEl = document.getElementById('credits-purchased');
    const creditsUsedEl = document.getElementById('credits-used');
    const classesAttendedEl = document.getElementById('classes-attended');
    const avgClassesWeekEl = document.getElementById('avg-classes-week');

    if (creditsPurchasedEl) creditsPurchasedEl.textContent = totalPurchased;
    if (creditsUsedEl) creditsUsedEl.textContent = totalUsed;
    if (classesAttendedEl) classesAttendedEl.textContent = classesAttended;

    // Calculate avg classes per week
    if (avgClassesWeekEl && allUsageHistory.length > 0) {
      const firstDate = allUsageHistory[allUsageHistory.length - 1].date;
      const weeks = Math.max(1, Math.ceil((new Date() - firstDate) / (7 * 24 * 60 * 60 * 1000)));
      const avg = (classesAttended / weeks).toFixed(1);
      avgClassesWeekEl.textContent = avg;
    }

    // Render history
    renderUsageHistory('all');

  } catch (error) {
    console.error('Error loading credit usage history:', error);
    container.innerHTML = '<div class="p-8 text-center text-gray-500"><p>Error loading history</p></div>';
  }
}

// Render filtered usage history
function renderUsageHistory(filter) {
  const container = document.getElementById('credit-usage-history');
  if (!container) return;

  // Apply time filter
  let filtered = [...allUsageHistory];
  const now = new Date();

  if (filter === 'week') {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    filtered = filtered.filter(item => item.date >= weekAgo);
  } else if (filter === 'month') {
    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    filtered = filtered.filter(item => item.date >= monthAgo);
  } else if (filter === '3months') {
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    filtered = filtered.filter(item => item.date >= threeMonthsAgo);
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-gray-500">
        <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p>No activity in this period</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.slice(0, 50).map(item => {
    const dateStr = item.date.toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: item.date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
    const timeStr = item.date.toLocaleTimeString('en-PH', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    let icon, bgColor, textColor;
    if (item.type === 'credit_added') {
      icon = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>';
      bgColor = 'bg-green-100';
      textColor = 'text-green-600';
    } else if (item.type === 'credit_used') {
      icon = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>';
      bgColor = item.status === 'checked_in' ? 'bg-brand-100' : 'bg-blue-100';
      textColor = item.status === 'checked_in' ? 'text-brand-600' : 'text-blue-600';
    } else if (item.type === 'credit_refunded') {
      icon = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>';
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-600';
    }

    const creditsDisplay = item.credits > 0 ? `+${item.credits}` : item.credits;
    const creditsColor = item.credits > 0 ? 'text-green-600' : 'text-gray-700';

    return `
      <div class="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
        <div class="p-2 ${bgColor} rounded-lg shrink-0">
          <svg class="w-5 h-5 ${textColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            ${icon}
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-gray-900 truncate">${item.description}</p>
          <p class="text-sm text-gray-500">
            ${dateStr} at ${timeStr}
            ${item.classTime ? ` • ${item.classTime}` : ''}
            ${item.amount ? ` • ₱${item.amount.toLocaleString()}` : ''}
          </p>
        </div>
        <div class="text-right shrink-0">
          <p class="font-bold ${creditsColor}">${creditsDisplay} credit${Math.abs(item.credits) !== 1 ? 's' : ''}</p>
          ${item.status ? `<span class="text-xs ${item.status === 'checked_in' ? 'text-green-600' : 'text-blue-600'}">${item.status === 'checked_in' ? 'Attended' : 'Booked'}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Export usage history as CSV
window.exportUsageHistory = function() {
  if (allUsageHistory.length === 0) {
    showToast('No usage history to export');
    return;
  }

  const headers = ['Date', 'Type', 'Description', 'Credits', 'Amount'];
  const rows = allUsageHistory.map(item => [
    item.date.toISOString().split('T')[0],
    item.type.replace('credit_', '').replace('_', ' '),
    `"${item.description}"`,
    item.credits,
    item.amount || ''
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitbreak-credit-history-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Usage history exported!');
};
