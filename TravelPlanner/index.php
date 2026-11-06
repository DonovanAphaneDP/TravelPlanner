<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Travel Planner Dashboard</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <!-- Mobile Sidebar Overlay -->
  <div class="sidebar-overlay" id="sidebarOverlay"></div>

  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="logo"><i class="fas fa-globe-americas"></i></div>
      <h2>Donovan's Travel Planner</h2>
    </div>
    <nav class="sidebar-nav">
      <a href="#" class="nav-item active" data-section="dashboard">
        <i class="fas fa-th-large"></i> Dashboard
      </a>
      <a href="#" class="nav-item" data-section="trips">
        <i class="fas fa-suitcase-rolling"></i> My Trips
      </a>
      <a href="#" class="nav-item" data-section="trips">
        <i class="fas fa-map-marked-alt"></i> Destinations
      </a>
      <a href="#" class="nav-item" data-section="trips">
        <i class="fas fa-wallet"></i> Budget
      </a>
      <a href="#" class="nav-item" data-section="trips">
        <i class="fas fa-clipboard-list"></i> Packing Lists
      </a>
      <a href="#" class="nav-item" data-section="trips">
        <i class="fas fa-calendar-alt"></i> Calendar
      </a>
    </nav>
    <div class="sidebar-footer">
      <i class="fas fa-info-circle"></i> Travel Planner v1.0
    </div>
  </aside>

  <!-- Main Content -->
  <div class="main-content">
    <!-- Top Header -->
    <header class="top-header">
      <div class="header-left" style="display:flex; align-items:center; gap:12px;">
        <button class="menu-toggle" id="menuToggle">
          <i class="fas fa-bars"></i>
        </button>
        <div>
          <h1>Dashboard</h1>
          <p><u>Plan your next adventure</u></p>
        </div>
      </div>
      <div class="header-right">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" id="searchInput" placeholder="Search trips...">
        </div>
        <button class="btn-icon" title="Notifications">
          <i class="fas fa-bell"></i>
          <span class="badge">2</span>
        </button>
        <div class="user-avatar" title="Traveler">
          <i class="fas fa-user"></i>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="content">
      <!-- Dashboard View -->
      <div class="dashboard-view">
        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon blue"><i class="fas fa-plane"></i></div>
            <div class="stat-info">
              <h3 id="statTotal">0</h3>
              <p>Total Trips</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon purple"><i class="fas fa-calendar-check"></i></div>
            <div class="stat-info">
              <h3 id="statUpcoming">0</h3>
              <p>Upcoming</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green"><i class="fas fa-check-circle"></i></div>
            <div class="stat-info">
              <h3 id="statCompleted">0</h3>
              <p>Completed</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon orange"><i class="fas fa-wallet"></i></div>
            <div class="stat-info">
              <h3 id="statBudget">$0</h3>
              <p>Total Budget</p>
              <div class="trend up"><i class="fas fa-arrow-up"></i> <span id="statSpent">$0</span> spent</div>
            </div>
          </div>
        </div>

        <!-- Trips Section -->
        <div id="trips-section">
          <div class="section-header">
            <h2>My Trips</h2>
            <button class="btn btn-primary" id="btnAddTrip">
              <i class="fas fa-plus"></i> Add New Trip
            </button>
          </div>
          <div class="trips-grid" id="tripsGrid">
            <!-- Trip cards rendered by JS -->
          </div>
        </div>

        <!-- Two Column: Itinerary + Packing -->
        <div class="two-col">
          <div class="card">
            <div class="card-header">
              <h3><i class="fas fa-route" style="margin-right:8px; color:var(--primary);"></i> Upcoming Itinerary</h3>
            </div>
            <div class="card-body" id="recentItinerary">
              <!-- Filled by JS -->
            </div>
          </div>
          <div class="card">
            <div class="card-header">
              <h3><i class="fas fa-suitcase" style="margin-right:8px; color:var(--secondary);"></i> Packing List</h3>
            </div>
            <div class="card-body" id="packingPreview">
              <!-- Filled by JS -->
            </div>
          </div>
        </div>
      </div>

      <!-- Detail View -->
      <div class="detail-view" id="detailView">
        <button class="back-btn" id="backBtn">
          <i class="fas fa-arrow-left"></i> Back to Dashboard
        </button>

        <div class="detail-hero" id="detailHero">
          <div class="detail-hero-overlay">
            <h2 id="detailTitle">Trip Title</h2>
            <div style="display:flex; gap:20px; font-size:0.95rem; opacity:0.9;">
              <span><i class="fas fa-map-marker-alt"></i> <span id="detailDestination"></span></span>
              <span><i class="far fa-calendar"></i> <span id="detailDates"></span></span>
            </div>
          </div>
        </div>

        <div class="detail-grid">
          <!-- Budget Card -->
          <div class="card">
            <div class="card-header">
              <h3>Budget Overview</h3>
            </div>
            <div class="card-body">
              <div class="progress-ring-container">
                <div class="progress-ring">
                  <svg width="140" height="140">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#e9ecef" stroke-width="12"/>
                    <circle id="budgetCircle" cx="70" cy="70" r="54" fill="none" stroke="#0d6efd"
                      stroke-width="12" stroke-linecap="round"
                      stroke-dasharray="339.3" stroke-dashoffset="339.3"/>
                  </svg>
                  <div class="progress-ring-text">
                    <span class="percent" id="budgetPercent">0%</span>
                    <span class="label">spent</span>
                  </div>
                </div>
              </div>
              <div class="budget-summary">
                <div class="budget-row">
                  <span class="budget-label">Total Budget</span>
                  <span class="budget-value" id="detailBudget">$0</span>
                </div>
                <div class="budget-row">
                  <span class="budget-label">Spent</span>
                  <span class="budget-value" id="detailSpent">$0</span>
                </div>
                <div class="budget-row">
                  <span class="budget-label">Remaining</span>
                  <span class="budget-value" style="color:var(--success);" id="detailRemaining">$0</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes Card -->
          <div class="card">
            <div class="card-header">
              <h3>Notes</h3>
            </div>
            <div class="card-body">
              <p id="detailNotes" style="line-height:1.6; color:#495057;"></p>
            </div>
          </div>

          <!-- Itinerary -->
          <div class="card">
            <div class="card-header">
              <h3>Itinerary</h3>
            </div>
            <div class="card-body" id="detailItinerary"></div>
          </div>

          <!-- Packing -->
          <div class="card">
            <div class="card-header">
              <h3>Packing List</h3>
            </div>
            <div class="card-body" id="detailPacking"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Add / Edit Trip Modal -->
  <div class="modal-overlay" id="modalOverlay">
    <div class="modal">
      <div class="modal-header">
        <h3 id="modalTitle">Add New Trip</h3>
        <button class="modal-close" id="modalClose"><i class="fas fa-times"></i></button>
      </div>
      <form id="tripForm">
        <div class="modal-body">
          <input type="hidden" id="tripId">
          <div class="form-group">
            <label for="tripTitle">Trip Title *</label>
            <input type="text" class="form-control" id="tripTitle" placeholder="e.g. Summer in Italy" required>
          </div>
          <div class="form-group">
            <label for="tripDestination">Destination *</label>
            <input type="text" class="form-control" id="tripDestination" placeholder="e.g. Rome, Italy" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="tripStart">Start Date *</label>
              <input type="date" class="form-control" id="tripStart" required>
            </div>
            <div class="form-group">
              <label for="tripEnd">End Date *</label>
              <input type="date" class="form-control" id="tripEnd" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="tripBudget">Budget (USD)</label>
              <input type="number" class="form-control" id="tripBudget" min="0" step="50" placeholder="2500">
            </div>
            <div class="form-group">
              <label for="tripSpent">Spent so far</label>
              <input type="number" class="form-control" id="tripSpent" min="0" step="10" placeholder="0">
            </div>
          </div>
          <div class="form-group">
            <label for="tripStatus">Status</label>
            <select class="form-control" id="tripStatus">
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div class="form-group">
            <label for="tripImage">Cover Image URL</label>
            <input type="url" class="form-control" id="tripImage" placeholder="https://...">
          </div>
          <div class="form-group">
            <label for="tripNotes">Notes</label>
            <textarea class="form-control" id="tripNotes" rows="3" placeholder="Any special notes..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" id="modalCancel">Cancel</button>
          <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Save Trip</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Toast Container -->
  <div class="toast-container" id="toastContainer"></div>

  <script src="js/script.js"></script>
</body>
</html>
