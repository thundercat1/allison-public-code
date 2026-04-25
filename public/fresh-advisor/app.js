/* Fresh Advisor — app.js */

document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  renderWasteHero();
  renderAlerts();
  renderMarket();
  renderRecommendations();
  renderPlanningData();
  renderStores();
  animateWasteCounter();
});

/* ── Header ── */
function renderHeader() {
  const { retailer, departments } = DATA;

  document.getElementById('retailerName').textContent = retailer.name;
  document.getElementById('headerUser').textContent = `${retailer.buyer} · ${retailer.buyerTitle}`;
  document.getElementById('headerDate').textContent = retailer.reportDate;

  const nav = document.getElementById('deptSwitcher');
  departments.forEach(dept => {
    const btn = document.createElement('button');
    btn.className = 'dept-btn' + (dept.active ? ' dept-btn--active' : ' dept-btn--inactive');
    btn.textContent = dept.label;
    if (!dept.active) btn.title = 'Coming soon';
    nav.appendChild(btn);
  });
}

/* ── Waste Hero ── */
function renderWasteHero() {
  const { waste, salesVsPlan, stockouts, supplierIssues } = DATA.kpis;

  document.getElementById('wasteTarget').textContent = waste.target.toFixed(1) + '%';

  const over = waste.actual > waste.target;
  const diff = Math.abs(waste.actual - waste.target).toFixed(1);
  const pill = document.getElementById('wasteStatusPill');
  pill.textContent = over ? `▲ OVER TARGET +${diff}pts` : `▼ UNDER TARGET −${diff}pts`;
  pill.className = 'waste-status-pill ' + (over ? 'waste-status-pill--over' : 'waste-status-pill--under');

  const container = document.getElementById('secondaryStats');
  const secondaries = [
    { val: salesVsPlan.actual.toFixed(1) + '%', label: 'Sales vs Plan',   trend: salesVsPlan.trend,    cls: salesVsPlan.actual >= 99 ? 'ok' : 'warn' },
    { val: stockouts.actual,                    label: 'Stockout Events', trend: stockouts.trend,       cls: stockouts.actual === 0 ? 'ok' : 'bad'   },
    { val: supplierIssues.actual,               label: 'Supplier Issues', trend: supplierIssues.trend,  cls: supplierIssues.actual === 0 ? 'ok' : 'bad' },
  ];
  secondaries.forEach(s => {
    const div = document.createElement('div');
    div.className = 'secondary-stat';
    div.innerHTML = `
      <div class="secondary-stat-val secondary-stat-val--${s.cls}">${s.val}</div>
      <div class="secondary-stat-label">${s.label}</div>
      <div class="secondary-stat-trend">${s.trend}</div>
    `;
    container.appendChild(div);
  });

  const recos = DATA.recommendations;
  const wasteRecos = recos.filter(r => r.wasteImpact !== null);
  const totalRecovery = wasteRecos.reduce((sum, r) => sum + Math.abs(r.wasteImpact), 0).toFixed(1);
  document.getElementById('recoTeaser').innerHTML =
    `<span class="waste-hero-sub-icon">✦</span>
     <span><strong>${recos.length} AI recommendations</strong> identified — acting on all could recover up to <strong>${totalRecovery}pts</strong> of waste this week.</span>`;
}

/* ── Animated Waste Counter ── */
function animateWasteCounter() {
  const target = DATA.kpis.waste.actual;
  const el = document.getElementById('wasteNumber');
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (eased * target).toFixed(1);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── Alerts ── */
function renderAlerts() {
  const strip = document.getElementById('alertsStrip');
  DATA.alerts.forEach((alert, i) => {
    const chip = document.createElement('div');
    chip.className = `alert-chip alert-chip--${alert.severity} fade-up fade-up-${Math.min(i+1,6)}`;
    chip.innerHTML = `
      <span class="alert-chip-icon">${alert.icon}</span>
      <div class="alert-chip-body">
        <div class="alert-chip-title">${alert.title}</div>
        <div class="alert-chip-detail">${alert.detail}</div>
      </div>
    `;
    strip.appendChild(chip);
  });

  // Collapse to 3 rows with "see all" if needed
  requestAnimationFrame(() => {
    const chips = strip.querySelectorAll('.alert-chip');
    if (!chips.length) return;
    const rowHeight = chips[0].offsetHeight + 10; // chip height + gap
    const threeRowsMax = rowHeight * 3 - 10;
    if (strip.scrollHeight <= threeRowsMax + 4) return;

    strip.style.maxHeight = threeRowsMax + 'px';

    const btn = document.createElement('button');
    btn.className = 'alerts-see-all';
    btn.textContent = `See all ${chips.length} signals`;
    btn.onclick = () => {
      strip.style.maxHeight = 'none';
      btn.remove();
    };
    strip.parentElement.appendChild(btn);
  });
}

/* ── Market ── */
function renderMarket() {
  const grid = document.getElementById('marketGrid');
  DATA.market.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = `market-card market-card--${item.severity} fade-up fade-up-${Math.min(i+1,6)}`;
    card.innerHTML = `
      <div class="market-icon">${item.icon}</div>
      <div class="market-title">${item.title}</div>
      <div class="market-detail">${item.detail}</div>
      <div class="market-impact">${item.impact}</div>
      <div class="market-source">${item.source}</div>
    `;
    grid.appendChild(card);
  });
}

/* ── Recommendations ── */
function renderRecommendations() {
  const wasteRecos = DATA.recommendations.filter(r => r.wasteImpact !== null);
  const totalWaste = wasteRecos.reduce((s, r) => s + Math.abs(r.wasteImpact), 0).toFixed(1);
  const totalRev = DATA.recommendations.reduce((s, r) => s + (r.revenueImpact || 0), 0);
  document.getElementById('recoSubtitle').textContent =
    `Up to ${totalWaste}pts waste recovery · $${(totalRev/1000).toFixed(0)}k revenue opportunity`;

  const featured = DATA.recommendations.find(r => r.featured);
  const rest = DATA.recommendations.filter(r => !r.featured);

  if (featured) {
    document.getElementById('featuredReco').appendChild(buildRecoCard(featured, true));
  }

  const grid = document.getElementById('recommendationsGrid');
  rest.forEach((reco, i) => {
    grid.appendChild(buildRecoCard(reco, false, i));
  });
}

function buildRecoCard(reco, isFeatured, index = 0) {
  const card = document.createElement('div');
  card.className = [
    'reco-card',
    `reco-card--${reco.priority}`,
    isFeatured ? 'reco-card--featured' : '',
    'fade-up',
    `fade-up-${Math.min(index+1,6)}`,
  ].filter(Boolean).join(' ');

  const wasteVal  = reco.wasteImpact  !== null ? `−${Math.abs(reco.wasteImpact).toFixed(1)}pts waste` : '—';
  const wasteClass = reco.wasteImpact !== null ? 'waste' : 'na';
  const revVal    = reco.revenueImpact !== null ? `+$${reco.revenueImpact.toLocaleString()}` : '—';
  const revClass  = reco.revenueImpact !== null ? 'rev' : 'na';

  const synthHtml = reco.synthesis ? `
    <div class="synthesis-panel">
      <div class="synthesis-cols">
        <div class="synthesis-col synthesis-col--planning">
          <div class="synthesis-label">
            <span class="synthesis-dot synthesis-dot--planning"></span>
            From your planning data
          </div>
          <ul class="synthesis-list">
            ${reco.synthesis.planningData.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
        <div class="synthesis-plus">+</div>
        <div class="synthesis-col synthesis-col--market">
          <div class="synthesis-label">
            <span class="synthesis-dot synthesis-dot--market"></span>
            From market signals
          </div>
          <ul class="synthesis-list">
            ${reco.synthesis.marketSignals.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
      </div>
      ${isFeatured ? `
      <div class="synthesis-conclusion">
        <div class="synthesis-conclusion-label">Together they mean</div>
        <div class="synthesis-conclusion-text">${reco.synthesis.conclusion}</div>
      </div>` : ''}
    </div>
  ` : '';

  const actionsHtml = reco.actions
    .map(a => `<div class="reco-action"><div class="reco-action-check"></div><span>${a}</span></div>`)
    .join('');

  card.innerHTML = `
    <div class="reco-card-top">
      <div class="reco-card-header">
        <span class="reco-priority-badge reco-priority-badge--${reco.priority}">${reco.priority}</span>
        <span class="reco-confidence"><span class="reco-confidence-dot"></span>${reco.confidence} confidence</span>
      </div>
      <div class="reco-title">${reco.title}</div>
      <div class="reco-summary">${reco.summary}</div>
    </div>
    <div class="reco-metrics">
      <div class="reco-metric">
        <div class="reco-metric-val reco-metric-val--${wasteClass}">${wasteVal}</div>
        <div class="reco-metric-label">Waste impact</div>
      </div>
      <div class="reco-metric">
        <div class="reco-metric-val reco-metric-val--${revClass}">${revVal}</div>
        <div class="reco-metric-label">Revenue impact</div>
      </div>
    </div>
    <button class="reco-expand-btn" onclick="toggleReco('${reco.id}')">
      <span>View reasoning & actions</span>
      <span class="reco-chevron" id="chevron-${reco.id}">▼</span>
    </button>
    <div class="reco-details" id="details-${reco.id}">
      ${synthHtml}
      <div class="reco-reasoning">${reco.reasoning}</div>
      <div>
        <div class="reco-actions-label">Recommended actions</div>
        <div class="reco-actions-list">${actionsHtml}</div>
      </div>
    </div>
  `;
  return card;
}

function toggleReco(id) {
  const details = document.getElementById(`details-${id}`);
  const chevron = document.getElementById(`chevron-${id}`);
  const open = details.classList.toggle('reco-details--open');
  chevron.style.transform = open ? 'rotate(180deg)' : '';
}

/* ── Planning Data Widget ── */
function renderPlanningData() {
  const { retailer, shipments, suppliers, inventory } = DATA;

  document.getElementById('planningSyncLabel').textContent =
    `Synced from ${retailer.planningSystem} · ${retailer.planningSystemSyncedAgo}`;
  document.getElementById('planningLink').href = retailer.planningSystemUrl;
  document.getElementById('planningLink').textContent = `Open in ${retailer.planningSystem} →`;

  const flaggedShipments  = shipments.filter(s => s.status !== 'on-track');
  const flaggedSuppliers  = suppliers.filter(s => s.status !== 'good');
  const criticalInventory = inventory.filter(i => i.status === 'critical');
  const warningInventory  = inventory.filter(i => i.status === 'warning');
  const goodInventory     = inventory.filter(i => i.status === 'good' || i.status === 'watch');

  const widget = document.getElementById('planningWidget');
  widget.className = 'planning-widget';

  // Shipments panel
  const shipmentRows = shipments.map(s => {
    const dotClass = s.status === 'on-track' ? 'good' : s.status === 'watch' ? 'warn' : 'bad';
    const noteHtml = s.note ? `<div class="pw-item-note pw-item-note--${s.status}">${s.note}</div>` : '';
    return `
      <div class="pw-item">
        <div class="pw-item-dot pw-item-dot--${dotClass}"></div>
        <div class="pw-item-body">
          <div class="pw-item-name">${s.items}</div>
          <div class="pw-item-sub">${s.cases} cases · ${s.arriving}</div>
          ${noteHtml}
        </div>
      </div>`;
  }).join('');

  // Suppliers panel
  const supplierRows = suppliers.map(s => `
    <div class="pw-item">
      <div class="pw-item-dot pw-item-dot--${s.status === 'good' ? 'good' : s.status === 'watch' ? 'warn' : 'bad'}"></div>
      <div class="pw-item-body">
        <div class="pw-item-name">${s.name}</div>
        <div class="pw-item-sub">On-time ${s.onTime}% · Quality ${s.quality}%${s.openIssues ? ` · ${s.openIssues} open issue${s.openIssues > 1 ? 's' : ''}` : ''}</div>
      </div>
    </div>`).join('');

  // Inventory summary panel
  const invSummaryHtml = `
    <div class="pw-inv-summary">
      <div class="pw-inv-bucket pw-inv-bucket--critical">
        <div class="pw-inv-count">${criticalInventory.length}</div>
        <div class="pw-inv-label">Critical<br>&lt;3 days</div>
      </div>
      <div class="pw-inv-bucket pw-inv-bucket--warning">
        <div class="pw-inv-count">${warningInventory.length}</div>
        <div class="pw-inv-label">At risk<br>3–5 days</div>
      </div>
      <div class="pw-inv-bucket pw-inv-bucket--good">
        <div class="pw-inv-count">${goodInventory.length}</div>
        <div class="pw-inv-label">Healthy<br>5+ days</div>
      </div>
    </div>
    <div class="pw-inv-flags">
      ${criticalInventory.map(i => `
        <div class="pw-inv-flag">
          <span class="pw-inv-flag-dot"></span>
          <span class="pw-inv-flag-sku">${i.sku}</span>
          <span class="pw-inv-flag-dos">${i.dos.toFixed(1)}d</span>
        </div>`).join('')}
      ${warningInventory.slice(0,2).map(i => `
        <div class="pw-inv-flag pw-inv-flag--warn">
          <span class="pw-inv-flag-dot pw-inv-flag-dot--warn"></span>
          <span class="pw-inv-flag-sku">${i.sku}</span>
          <span class="pw-inv-flag-dos">${i.dos.toFixed(1)}d</span>
        </div>`).join('')}
    </div>
  `;

  widget.innerHTML = `
    <div class="pw-grid">
      <div class="pw-panel">
        <div class="pw-panel-header">
          <span class="pw-panel-title">Shipments this week</span>
          <span class="pw-panel-flag">${flaggedShipments.length} flagged</span>
        </div>
        <div class="pw-items">${shipmentRows}</div>
      </div>
      <div class="pw-divider"></div>
      <div class="pw-panel">
        <div class="pw-panel-header">
          <span class="pw-panel-title">Supplier health</span>
          <span class="pw-panel-flag">${flaggedSuppliers.length} need attention</span>
        </div>
        <div class="pw-items">${supplierRows}</div>
      </div>
      <div class="pw-divider"></div>
      <div class="pw-panel">
        <div class="pw-panel-header">
          <span class="pw-panel-title">Inventory status</span>
          <span class="pw-panel-flag">${criticalInventory.length + warningInventory.length} items flagged</span>
        </div>
        ${invSummaryHtml}
      </div>
    </div>
  `;
}

/* ── Stores ── */
function renderStores() {
  const grid = document.getElementById('storesGrid');
  const maxWaste = Math.max(...DATA.stores.map(s => s.waste));
  DATA.stores.forEach(store => {
    const over = store.waste > store.target;
    const cls = over ? 'over' : 'under';
    const barPct = (store.waste / maxWaste) * 100;
    const trendLabel = store.trend === 'up' ? '↑ trending up' : store.trend === 'down' ? '↓ improving' : '→ steady';
    const card = document.createElement('div');
    card.className = `store-card store-card--${cls}`;
    card.innerHTML = `
      <div class="store-top">
        <span class="store-name">Store #${store.id} · ${store.name}</span>
      </div>
      <div class="store-waste store-waste--${cls}">${store.waste.toFixed(1)}%</div>
      <div class="store-bar-track">
        <div class="store-bar-fill store-bar-fill--${cls}" style="width:${barPct}%"></div>
      </div>
      <div class="store-trend store-trend--${store.trend}">${trendLabel}</div>
    `;
    grid.appendChild(card);
  });
}
