// Travel Planner Dashboard - Client-side logic

let trips = [];
let currentTripId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadTrips();
  setupEventListeners();
});

// Load trips from PHP endpoint or embedded data
async function loadTrips() {
  try {
    const res = await fetch('api.php?action=get_trips');
    const data = await res.json();
    if (data.success) {
      trips = data.trips;
      renderDashboard();
    } else {
      showToast('Failed to load trips', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('Error connecting to server', 'error');
  }
}

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const section = item.dataset.section;
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      if (section === 'dashboard') {
        showDashboard();
      } else if (section === 'trips') {
        showDashboard();
        document.getElementById('trips-section').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Mobile menu
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  // Add Trip button
  document.getElementById('btnAddTrip')?.addEventListener('click', openAddTripModal);
  document.getElementById('btnAddTripEmpty')?.addEventListener('click', openAddTripModal);

  // Modal close
  document.getElementById('modalClose')?.addEventListener('click', closeModal);
  document.getElementById('modalCancel')?.addEventListener('click', closeModal);
  document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeModal();
  });

  // Form submit
  document.getElementById('tripForm')?.addEventListener('submit', handleTripSubmit);

  // Search
  document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = trips.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.destination.toLowerCase().includes(q)
    );
    renderTripCards(filtered);
  });

  // Back button
  document.getElementById('backBtn')?.addEventListener('click', showDashboard);
}

function renderDashboard() {
  updateStats();
  renderTripCards(trips);
  renderRecentItinerary();
  renderPackingPreview();
}

function updateStats() {
  const total = trips.length;
  const upcoming = trips.filter(t => t.status === 'upcoming').length;
  const completed = trips.filter(t => t.status === 'completed').length;
  const totalBudget = trips.reduce((sum, t) => sum + Number(t.budget), 0);
  const totalSpent = trips.reduce((sum, t) => sum + Number(t.spent), 0);

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statUpcoming').textContent = upcoming;
  document.getElementById('statCompleted').textContent = completed;
  document.getElementById('statBudget').textContent = formatCurrency(totalBudget);
  document.getElementById('statSpent').textContent = formatCurrency(totalSpent);
}

function renderTripCards(list) {
  const container = document.getElementById('tripsGrid');
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <i class="fas fa-plane-slash"></i>
        <h3>No trips found</h3>
        <p>Start planning your next adventure!</p>
        <button class="btn btn-primary" id="btnAddTripEmpty" style="margin-top: 16px;">
          <i class="fas fa-plus"></i> Add New Trip
        </button>
      </div>
    `;
    document.getElementById('btnAddTripEmpty')?.addEventListener('click', openAddTripModal);
    return;
  }

  container.innerHTML = list.map(trip => {
    const spentPercent = trip.budget > 0 ? Math.min(100, (trip.spent / trip.budget) * 100) : 0;
    let barClass = 'safe';
    if (spentPercent > 85) barClass = 'danger';
    else if (spentPercent > 60) barClass = 'warning';

    const start = formatDate(trip.startDate);
    const end = formatDate(trip.endDate);

    return `
      <div class="trip-card" data-id="${trip.id}">
        <div class="trip-image" style="background-image: url('${trip.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}')">
          <span class="trip-status status-${trip.status}">${trip.status}</span>
        </div>
        <div class="trip-body">
          <h3>${escapeHtml(trip.title)}</h3>
          <div class="trip-destination">
            <i class="fas fa-map-marker-alt"></i>
            ${escapeHtml(trip.destination)}
          </div>
          <div class="trip-meta">
            <div class="trip-dates">
              <i class="far fa-calendar"></i>
              ${start} – ${end}
            </div>
          </div>
          <div class="budget-bar">
            <div class="budget-fill ${barClass}" style="width: ${spentPercent}%"></div>
          </div>
          <div class="budget-text">
            <span>${formatCurrency(trip.spent)} spent</span>
            <span>${formatCurrency(trip.budget)} budget</span>
          </div>
          <div class="trip-actions">
            <button class="btn btn-sm btn-outline view-btn" data-id="${trip.id}">
              <i class="fas fa-eye"></i> View
            </button>
            <button class="btn btn-sm btn-outline edit-btn" data-id="${trip.id}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${trip.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach listeners
  container.querySelectorAll('.view-btn, .trip-card').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) return;
      const id = el.dataset.id || el.closest('.trip-card')?.dataset.id;
      if (id) openTripDetail(id);
    });
  });

  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditTripModal(btn.dataset.id);
    });
  });

  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTrip(btn.dataset.id);
    });
  });
}

function renderRecentItinerary() {
  const container = document.getElementById('recentItinerary');
  if (!container) return;

  const upcoming = trips.filter(t => t.status === 'upcoming').sort((a, b) =>
    new Date(a.startDate) - new Date(b.startDate)
  )[0];

  if (!upcoming || !upcoming.itinerary || upcoming.itinerary.length === 0) {
    container.innerHTML = `<p style="color:#6c757d; font-size:0.9rem;">No upcoming itinerary yet.</p>`;
    return;
  }

  container.innerHTML = `
    <div style="margin-bottom:12px; font-weight:600; color:#495057;">
      ${escapeHtml(upcoming.title)}
    </div>
    <div class="timeline">
      ${upcoming.itinerary.slice(0, 4).map(item => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="day">Day ${item.day}</div>
            <div class="activity">${escapeHtml(item.activity)}</div>
            <div class="time"><i class="far fa-clock"></i> ${item.time}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderPackingPreview() {
  const container = document.getElementById('packingPreview');
  if (!container) return;

  const upcoming = trips.filter(t => t.status === 'upcoming').sort((a, b) =>
    new Date(a.startDate) - new Date(b.startDate)
  )[0];

  if (!upcoming || !upcoming.packing || upcoming.packing.length === 0) {
    container.innerHTML = `<p style="color:#6c757d; font-size:0.9rem;">No packing list yet.</p>`;
    return;
  }

  const packed = upcoming.packing.filter(p => p.packed).length;
  const total = upcoming.packing.length;

  container.innerHTML = `
    <div style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
      <span style="font-weight:600; color:#495057;">${escapeHtml(upcoming.title)}</span>
      <span style="font-size:0.85rem; color:#6c757d;">${packed}/${total} packed</span>
    </div>
    <ul class="packing-list">
      ${upcoming.packing.map((item, idx) => `
        <li class="packing-item ${item.packed ? 'packed' : ''}">
          <input type="checkbox" id="pack_${idx}" ${item.packed ? 'checked' : ''}
            data-trip="${upcoming.id}" data-idx="${idx}">
          <label for="pack_${idx}">${escapeHtml(item.item)}</label>
        </li>
      `).join('')}
    </ul>
  `;

  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', async (e) => {
      const tripId = e.target.dataset.trip;
      const idx = parseInt(e.target.dataset.idx);
      await togglePackingItem(tripId, idx, e.target.checked);
    });
  });
}

function openTripDetail(id) {
  const trip = trips.find(t => t.id === id);
  if (!trip) return;

  currentTripId = id;
  document.querySelector('.dashboard-view').classList.add('hidden');
  const detail = document.getElementById('detailView');
  detail.classList.add('active');

  // Hero
  document.getElementById('detailHero').style.backgroundImage =
    `url('${trip.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'}')`;
  document.getElementById('detailTitle').textContent = trip.title;
  document.getElementById('detailDestination').textContent = trip.destination;
  document.getElementById('detailDates').textContent =
    `${formatDate(trip.startDate)} – ${formatDate(trip.endDate)}`;

  // Budget ring
  const percent = trip.budget > 0 ? Math.round((trip.spent / trip.budget) * 100) : 0;
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (percent / 100) * circumference;
  document.getElementById('budgetCircle').style.strokeDasharray = circumference;
  document.getElementById('budgetCircle').style.strokeDashoffset = offset;
  document.getElementById('budgetPercent').textContent = `${percent}%`;
  document.getElementById('detailBudget').textContent = formatCurrency(trip.budget);
  document.getElementById('detailSpent').textContent = formatCurrency(trip.spent);
  document.getElementById('detailRemaining').textContent =
    formatCurrency(Math.max(0, trip.budget - trip.spent));

  // Notes
  document.getElementById('detailNotes').textContent = trip.notes || 'No notes yet.';

  // Itinerary
  const itinContainer = document.getElementById('detailItinerary');
  if (trip.itinerary && trip.itinerary.length) {
    itinContainer.innerHTML = `
      <div class="timeline">
        ${trip.itinerary.map(item => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="day">Day ${item.day}</div>
              <div class="activity">${escapeHtml(item.activity)}</div>
              <div class="time"><i class="far fa-clock"></i> ${item.time}</div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    itinContainer.innerHTML = `<p style="color:#6c757d;">No itinerary items yet.</p>`;
  }

  // Packing
  const packContainer = document.getElementById('detailPacking');
  if (trip.packing && trip.packing.length) {
    packContainer.innerHTML = `
      <ul class="packing-list">
        ${trip.packing.map((item, idx) => `
          <li class="packing-item ${item.packed ? 'packed' : ''}">
            <input type="checkbox" id="dpack_${idx}" ${item.packed ? 'checked' : ''}
              data-trip="${trip.id}" data-idx="${idx}">
            <label for="dpack_${idx}">${escapeHtml(item.item)}</label>
          </li>
        `).join('')}
      </ul>
    `;
    packContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', async (e) => {
        await togglePackingItem(e.target.dataset.trip, parseInt(e.target.dataset.idx), e.target.checked);
        // Refresh the item class
        e.target.closest('.packing-item').classList.toggle('packed', e.target.checked);
      });
    });
  } else {
    packContainer.innerHTML = `<p style="color:#6c757d;">No packing list yet.</p>`;
  }
}

function showDashboard() {
  document.querySelector('.dashboard-view').classList.remove('hidden');
  document.getElementById('detailView').classList.remove('active');
  currentTripId = null;
  renderDashboard();
}

function openAddTripModal() {
  document.getElementById('modalTitle').textContent = 'Add New Trip';
  document.getElementById('tripForm').reset();
  document.getElementById('tripId').value = '';
  document.getElementById('modalOverlay').classList.add('show');
}

function openEditTripModal(id) {
  const trip = trips.find(t => t.id === id);
  if (!trip) return;

  document.getElementById('modalTitle').textContent = 'Edit Trip';
  document.getElementById('tripId').value = trip.id;
  document.getElementById('tripTitle').value = trip.title;
  document.getElementById('tripDestination').value = trip.destination;
  document.getElementById('tripStart').value = trip.startDate;
  document.getElementById('tripEnd').value = trip.endDate;
  document.getElementById('tripBudget').value = trip.budget;
  document.getElementById('tripSpent').value = trip.spent;
  document.getElementById('tripStatus').value = trip.status;
  document.getElementById('tripNotes').value = trip.notes || '';
  document.getElementById('tripImage').value = trip.image || '';
  document.getElementById('modalOverlay').classList.add('show');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
}

async function handleTripSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('tripId').value;
  const payload = {
    id: id || undefined,
    title: document.getElementById('tripTitle').value.trim(),
    destination: document.getElementById('tripDestination').value.trim(),
    startDate: document.getElementById('tripStart').value,
    endDate: document.getElementById('tripEnd').value,
    budget: parseFloat(document.getElementById('tripBudget').value) || 0,
    spent: parseFloat(document.getElementById('tripSpent').value) || 0,
    status: document.getElementById('tripStatus').value,
    notes: document.getElementById('tripNotes').value.trim(),
    image: document.getElementById('tripImage').value.trim() ||
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800'
  };

  if (!payload.title || !payload.destination || !payload.startDate || !payload.endDate) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  try {
    const action = id ? 'update_trip' : 'add_trip';
    const res = await fetch(`api.php?action=${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showToast(id ? 'Trip updated successfully' : 'Trip added successfully', 'success');
      closeModal();
      await loadTrips();
      if (currentTripId) openTripDetail(currentTripId);
    } else {
      showToast(data.message || 'Something went wrong', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('Network error', 'error');
  }
}

async function deleteTrip(id) {
  if (!confirm('Are you sure you want to delete this trip?')) return;

  try {
    const res = await fetch('api.php?action=delete_trip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Trip deleted', 'success');
      if (currentTripId === id) showDashboard();
      await loadTrips();
    } else {
      showToast(data.message || 'Delete failed', 'error');
    }
  } catch (err) {
    showToast('Network error', 'error');
  }
}

async function togglePackingItem(tripId, idx, packed) {
  try {
    const res = await fetch('api.php?action=toggle_packing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tripId, index: idx, packed })
    });
    const data = await res.json();
    if (data.success) {
      // Update local state
      const trip = trips.find(t => t.id === tripId);
      if (trip && trip.packing[idx]) {
        trip.packing[idx].packed = packed;
      }
      // Refresh preview if on dashboard
      if (!currentTripId) renderPackingPreview();
    }
  } catch (err) {
    console.error(err);
  }
}

// Helpers
function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(val);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? 'fa-check-circle' :
               type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
