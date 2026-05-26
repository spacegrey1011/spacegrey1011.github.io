// ========================================
// Enterprise Cosmetics Dashboard — App Logic
// ========================================

// --- Mock Data ---
const TREND_DATA = [
  { rank: 1, hashtag: '#GlassSkin', views: '2.4B', growth: '+342%', status: 'hot', category: 'Skincare' },
  { rank: 2, hashtag: '#SnailMucin', views: '1.8B', growth: '+215%', status: 'hot', category: 'Ingredients' },
  { rank: 3, hashtag: '#NiacinamideGlow', views: '1.2B', growth: '+187%', status: 'rising', category: 'Ingredients' },
  { rank: 4, hashtag: '#SkinBarrier', views: '980M', growth: '+156%', status: 'rising', category: 'Skincare' },
  { rank: 5, hashtag: '#RetinolNight', views: '870M', growth: '+134%', status: 'rising', category: 'Anti-aging' },
  { rank: 6, hashtag: '#CeramideCream', views: '650M', growth: '+98%', status: 'stable', category: 'Moisturizer' },
  { rank: 7, hashtag: '#VitaminCSerum', views: '540M', growth: '+87%', status: 'stable', category: 'Brightening' },
  { rank: 8, hashtag: '#CleanBeauty2026', views: '420M', growth: '+76%', status: 'stable', category: 'Lifestyle' },
];

const INGREDIENTS = [
  { name: 'Niacinamide', inci: 'Niacinamide', safety: 95, trend: 92, function: 'Brightening', source: 'Synthetic / Vitamin B3', color: '#f5d63d' },
  { name: 'Hyaluronic Acid', inci: 'Sodium Hyaluronate', safety: 98, trend: 88, function: 'Hydration', source: 'Bio-fermentation', color: '#2dd4bf' },
  { name: 'Retinol', inci: 'Retinol', safety: 72, trend: 85, function: 'Anti-aging', source: 'Synthetic / Vitamin A', color: '#f472b6' },
  { name: 'Snail Mucin', inci: 'Snail Secretion Filtrate', safety: 90, trend: 94, function: 'Repair', source: 'Natural / Snail', color: '#a78bfa' },
  { name: 'Ceramide NP', inci: 'Ceramide NP', safety: 97, trend: 79, function: 'Barrier Repair', source: 'Synthetic / Bio-identical', color: '#fb923c' },
  { name: 'Centella Asiatica', inci: 'Centella Asiatica Extract', safety: 96, trend: 82, function: 'Soothing', source: 'Natural / Plant', color: '#34d399' },
  { name: 'Vitamin C', inci: 'Ascorbic Acid', safety: 88, trend: 86, function: 'Antioxidant', source: 'Synthetic', color: '#fbbf24' },
  { name: 'Banana Extract', inci: 'Musa Sapientum Fruit Extract', safety: 94, trend: 71, function: 'Nourishing', source: 'Natural / Fruit', color: '#f5d63d' },
  { name: 'Peptide Complex', inci: 'Palmitoyl Tripeptide-1', safety: 93, trend: 77, function: 'Firming', source: 'Synthetic / Peptide', color: '#c084fc' },
  { name: 'Salicylic Acid', inci: 'Salicylic Acid', safety: 82, trend: 74, function: 'Exfoliant', source: 'Synthetic / BHA', color: '#f87171' },
];

const PRODUCT_TYPES = ['Serum', 'Moisturizer', 'Cleanser', 'Toner', 'Mask', 'Eye Cream', 'Sunscreen', 'Oil'];
const TARGET_MARKETS = ['Gen Z (18-24)', 'Millennials (25-34)', 'Gen X (35-50)', 'Premium / Luxury', 'K-Beauty Enthusiasts', 'Clean Beauty'];

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  renderStats();
  renderTrendFeed();
  renderIngredientTable();
  renderCreatorForm();
  initCharts();
  initNavigation();
  initAnimations();
  startLiveCounters();
  renderPipeline();

  // Initialize API integrations
  if (typeof APIManager !== 'undefined') {
    APIManager.init();
  }

  // Listen for live data events
  window.addEventListener('trendlab:tiktok-data', (e) => {
    if (e.detail && e.detail.length > 0) {
      TREND_DATA.length = 0;
      e.detail.forEach(t => TREND_DATA.push(t));
      renderTrendFeed();
      showToast(`🎵 ${e.detail.length} trends loaded from TikTok API`, 'success');
    }
  });

  window.addEventListener('trendlab:trends-data', (e) => {
    if (e.detail) {
      window.trendDataCached = e.detail; // Cache for resize events
      drawTrendChart(e.detail);
      showToast('📊 Google Trends data loaded & rendered', 'success');
    }
  });

  window.addEventListener('trendlab:apply-custom-trends', (e) => {
    if (e.detail && e.detail.length > 0) {
      // Merge custom trends with existing data
      const custom = e.detail;
      const merged = [...custom.map((t, i) => ({
        ...t,
        rank: i + 1,
      })), ...TREND_DATA.map((t, i) => ({
        ...t,
        rank: custom.length + i + 1,
      }))];
      TREND_DATA.length = 0;
      merged.slice(0, 12).forEach(t => TREND_DATA.push(t));
      renderTrendFeed();
    }
  });

  window.addEventListener('trendlab:apply-custom-ingredients', (e) => {
    if (e.detail && e.detail.length > 0) {
      e.detail.forEach(ing => {
        if (!INGREDIENTS.find(i => i.name === ing.name)) {
          INGREDIENTS.push({
            ...ing,
            color: ing.color || '#f5d63d',
          });
        }
      });
      renderIngredientTable();
      renderCreatorForm();
      initCharts();
      const countEl = document.getElementById('ingredient-count');
      if (countEl) countEl.textContent = INGREDIENTS.length;
    }
  });
});


// --- Stats ---
function renderStats() {
  const statsData = [
    { icon: '📈', value: '2.4B', label: 'Total Trend Views', change: '+18.3%', dir: 'up', bg: 'var(--accent-banana-dim)', iconBg: 'var(--accent-banana)' },
    { icon: '🧪', value: '847', label: 'Trending Ingredients', change: '+12.7%', dir: 'up', bg: 'var(--accent-teal-dim)', iconBg: 'var(--accent-teal)' },
    { icon: '🔥', value: '156', label: 'Viral Products', change: '+24.1%', dir: 'up', bg: 'var(--accent-pink-dim)', iconBg: 'var(--accent-pink)' },
    { icon: '🎯', value: '94%', label: 'Trend Accuracy', change: '+2.4%', dir: 'up', bg: 'var(--accent-violet-dim)', iconBg: 'var(--accent-violet)' },
  ];

  const container = document.getElementById('stats-grid');
  container.innerHTML = statsData.map(s => `
    <div class="card stat-card animate-in">
      <div class="stat-icon" style="background: ${s.bg}">${s.icon}</div>
      <div class="stat-value" data-target="${s.value}">${s.value}</div>
      <div class="stat-label">${s.label}</div>
      <div class="stat-change ${s.dir}">
        ${s.dir === 'up' ? '↑' : '↓'} ${s.change} vs last month
      </div>
    </div>
  `).join('');
}

// --- Trend Feed ---
function renderTrendFeed() {
  const listContainer = document.getElementById('trend-list');
  listContainer.innerHTML = TREND_DATA.map(t => `
    <div class="trend-item">
      <div class="trend-rank">${String(t.rank).padStart(2, '0')}</div>
      <div class="trend-info">
        <div class="trend-hashtag">${t.hashtag}</div>
        <div class="trend-views">${t.views} views · ${t.category}</div>
      </div>
      <div class="trend-growth ${t.status}">${t.growth}</div>
    </div>
  `).join('');
}

// --- Ingredient Table ---
function renderIngredientTable() {
  const tbody = document.getElementById('ingredient-tbody');
  tbody.innerHTML = INGREDIENTS.map(ing => `
    <tr>
      <td>
        <div class="ingredient-name">
          <span class="ingredient-dot" style="background: ${ing.color}"></span>
          ${ing.name}
        </div>
      </td>
      <td style="color: var(--text-secondary); font-size: 12px;">${ing.inci}</td>
      <td>
        <div class="score-bar"><div class="score-bar-fill" style="width: ${ing.safety}%; background: ${ing.safety > 90 ? 'var(--success)' : ing.safety > 80 ? 'var(--warning)' : 'var(--danger)'}"></div></div>
        <span style="font-size: 13px; font-weight: 600;">${ing.safety}</span>
      </td>
      <td>
        <div class="score-bar"><div class="score-bar-fill" style="width: ${ing.trend}%; background: var(--accent-pink)"></div></div>
        <span style="font-size: 13px; font-weight: 600;">${ing.trend}</span>
      </td>
      <td><span class="tag" style="background: ${ing.color}22; color: ${ing.color}">${ing.function}</span></td>
      <td style="color: var(--text-secondary); font-size: 13px;">${ing.source}</td>
    </tr>
  `).join('');
}

// --- Product Creator ---
function renderCreatorForm() {
  const formContainer = document.getElementById('creator-form-content');
  formContainer.innerHTML = `
    <div class="form-group">
      <label class="form-label">Product Name</label>
      <input type="text" class="form-input" id="product-name" placeholder="e.g., Glow Serum Pro" />
    </div>
    <div class="form-group">
      <label class="form-label">Product Type</label>
      <select class="form-select" id="product-type">
        <option value="">Select type...</option>
        ${PRODUCT_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Target Market</label>
      <select class="form-select" id="target-market">
        <option value="">Select market...</option>
        ${TARGET_MARKETS.map(m => `<option value="${m}">${m}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Key Ingredients</label>
      <div class="ingredient-chips" id="ingredient-chips">
        ${INGREDIENTS.map(ing => `
          <div class="chip" data-ingredient="${ing.name}" onclick="toggleChip(this)">
            ${ing.name}
          </div>
        `).join('')}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Product Description</label>
      <textarea class="form-textarea" id="product-desc" placeholder="Describe your product concept..."></textarea>
    </div>
    <div style="display: flex; gap: var(--space-md);">
      <button class="btn btn-primary" onclick="generateProduct()">✨ Generate Product</button>
      <button class="btn btn-secondary" onclick="clearForm()">Reset</button>
    </div>
  `;
}

let selectedIngredients = new Set();

function toggleChip(el) {
  const name = el.dataset.ingredient;
  if (selectedIngredients.has(name)) {
    selectedIngredients.delete(name);
    el.classList.remove('selected');
  } else {
    selectedIngredients.add(name);
    el.classList.add('selected');
  }
  updatePreview();
}

function updatePreview() {
  const name = document.getElementById('product-name')?.value || '';
  const type = document.getElementById('product-type')?.value || '';
  const preview = document.getElementById('product-preview');

  if (!name && !type && selectedIngredients.size === 0) {
    preview.innerHTML = `
      <div class="preview-placeholder">
        <div class="preview-icon">🧴</div>
        <p>Configure your product to see a live preview</p>
      </div>
    `;
    return;
  }

  const chips = [...selectedIngredients].map(name => {
    const ing = INGREDIENTS.find(i => i.name === name);
    return `<span class="tag" style="background: ${ing.color}22; color: ${ing.color}">${name}</span>`;
  }).join('');

  preview.innerHTML = `
    <div class="preview-product" style="animation: fadeInUp 0.4s ease;">
      <div style="font-size: 64px; margin-bottom: var(--space-md);">🧴</div>
      <div class="preview-product-name">${name || 'Untitled Product'}</div>
      <div class="preview-product-type">${type || 'Select a type'}</div>
      ${chips ? `
        <div style="font-size: 12px; color: var(--text-muted); margin-top: var(--space-lg); text-transform: uppercase; letter-spacing: 1px;">Key Ingredients</div>
        <div class="preview-ingredients-list">${chips}</div>
      ` : ''}
    </div>
  `;
}

function generateProduct() {
  const name = document.getElementById('product-name')?.value;
  const type = document.getElementById('product-type')?.value;
  const market = document.getElementById('target-market')?.value || '';
  const desc = document.getElementById('product-desc')?.value || '';

  if (!name || !type) {
    if (typeof showToast === 'function') showToast('Please fill in product name and type', 'warning');
    else alert('Please fill in at least the product name and type.');
    return;
  }

  // Build product object
  const ingredientString = [...selectedIngredients].join(', ');
  
  // 🔥 Pass string to the standalone Engine for analysis
  let analysis = { safetyScore: 85, trendScore: 70, warnings: [] }; // Fallback
  if (typeof Engine !== 'undefined') {
    analysis = Engine.analyzeFormulation(ingredientString);
  }

  const product = {
    id: Date.now(),
    name,
    type,
    market,
    description: desc,
    ingredients: [...selectedIngredients], // Original for UI reference
    analysis: {
      safety: analysis.safetyScore,
      trend: analysis.trendScore,
      warnings: analysis.warnings,
      insights: analysis.insights
    },
    createdAt: new Date().toISOString(),
    mockups: generateMockupDesigns(name, type, [...selectedIngredients]),
  };

  // Save to pipeline
  saveProduct(product);

  // Show success + scroll to mockups
  const preview = document.getElementById('product-preview');
  preview.innerHTML = `
    <div class="preview-product" style="animation: fadeInUp 0.4s ease;">
      <div style="font-size: 20px; margin-bottom: var(--space-md); color: var(--accent-banana);">✅ Product Created</div>
      <div class="preview-product-name">${name}</div>
      <div class="preview-product-type">${type}</div>
      
      <!-- Engine Output Box -->
      <div style="margin-top: var(--space-lg); padding: var(--space-md); background: rgba(52,211,153,0.1); border-radius: var(--radius-md); border: 1px solid rgba(52,211,153,0.2); font-size: 13px; color: var(--success);">
        <strong>Engine Validated:</strong>
        <p style="margin: 5px 0;">Safety Score: <span style="font-weight:700; color:var(--text-primary)">${product.analysis.safety}</span> | Trend Score: <span style="font-weight:700; color:var(--text-primary)">${product.analysis.trend}</span></p>
        ${product.analysis.warnings.length ? `<p style="margin: 5px 0; color: var(--danger)">⚠️ ${product.analysis.warnings[0]}</p>` : ''}
        ${product.analysis.insights.length ? `<p style="margin: 5px 0; color: var(--accent-banana)">💡 ${product.analysis.insights[0]}</p>` : ''}
       ✨ ${product.mockups.length} mockups generated below.
      </div>

      ${selectedIngredients.size > 0 ? `
        <div style="font-size: 12px; color: var(--text-muted); margin-top: var(--space-lg); text-transform: uppercase; letter-spacing: 1px;">Formula</div>
        <div class="preview-ingredients-list">
          ${[...selectedIngredients].map(n => {
            const ing = INGREDIENTS.find(i => i.name === n);
            return `<span class="tag" style="background: ${ing?.color || '#f5d63d'}22; color: ${ing?.color || '#f5d63d'}">${n}</span>`;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `;

  if (typeof showToast === 'function') showToast(`${name} created with ${product.mockups.length} mockups!`, 'success');

  // Render pipeline
  renderPipeline();

  // Scroll to pipeline
  setTimeout(() => {
    document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 600);
}

// --- Mockup Design Generator ---
const MOCKUP_STYLES = [
  { shape: 'serum', label: 'Dropper Serum', icon: '💧' },
  { shape: 'tube', label: 'Squeeze Tube', icon: '🧴' },
  { shape: 'jar', label: 'Cream Jar', icon: '🫙' },
  { shape: 'box', label: 'Box Packaging', icon: '📦' },
];

const COLOR_PALETTES = [
  { name: 'Luxe Gold', primary: '#f5d63d', secondary: '#1a1508', accent: '#c9a820', bg: 'linear-gradient(135deg, #2a2005, #1a1508)' },
  { name: 'Rose Petal', primary: '#f472b6', secondary: '#1a0812', accent: '#d64a9a', bg: 'linear-gradient(135deg, #2a0a1a, #1a0812)' },
  { name: 'Ocean Calm', primary: '#2dd4bf', secondary: '#081a17', accent: '#1ab5a0', bg: 'linear-gradient(135deg, #0a2a24, #081a17)' },
  { name: 'Violet Dream', primary: '#a78bfa', secondary: '#120c20', accent: '#8b6fe0', bg: 'linear-gradient(135deg, #1a1030, #120c20)' },
  { name: 'Clean White', primary: '#e8e8f0', secondary: '#fafafa', accent: '#c8c8d8', bg: 'linear-gradient(135deg, #f4f4f8, #e8e8f0)', dark: false },
  { name: 'Coral Sunset', primary: '#fb923c', secondary: '#1a0e05', accent: '#e07825', bg: 'linear-gradient(135deg, #2a1608, #1a0e05)' },
];

function generateMockupDesigns(productName, productType, ingredients) {
  // Pick palette based on first ingredient color or random
  const usedPalettes = new Set();
  const mockups = MOCKUP_STYLES.map((style, i) => {
    let paletteIdx;
    do {
      paletteIdx = (i + Math.floor(Math.random() * COLOR_PALETTES.length)) % COLOR_PALETTES.length;
    } while (usedPalettes.has(paletteIdx) && usedPalettes.size < COLOR_PALETTES.length);
    usedPalettes.add(paletteIdx);

    const palette = COLOR_PALETTES[paletteIdx];
    return {
      id: `mockup-${Date.now()}-${i}`,
      shape: style.shape,
      label: style.label,
      icon: style.icon,
      palette,
      productName,
      productType,
      ingredients: ingredients.slice(0, 3),
    };
  });
  return mockups;
}

function renderMockupCard(mockup) {
  const p = mockup.palette;
  const isDark = p.dark !== false;
  const textColor = isDark ? '#f0f0f5' : '#1a1a2e';
  const subtextColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  // Different SVG shapes for different containers
  let containerSVG = '';
  switch (mockup.shape) {
    case 'serum':
      containerSVG = `
        <svg viewBox="0 0 120 220" width="90" height="170" style="filter: drop-shadow(0 8px 20px rgba(0,0,0,0.3));">
          <defs>
            <linearGradient id="bottle-${mockup.id}" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="${p.primary}" />
              <stop offset="100%" stop-color="${p.accent}" />
            </linearGradient>
            <linearGradient id="cap-${mockup.id}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${isDark ? '#e8e8f0' : '#888'}" />
              <stop offset="100%" stop-color="${isDark ? '#c8c8d0' : '#666'}" />
            </linearGradient>
          </defs>
          <rect x="47" y="5" width="26" height="35" rx="4" fill="url(#cap-${mockup.id})" />
          <rect x="52" y="35" width="16" height="15" fill="url(#cap-${mockup.id})" />
          <rect x="30" y="50" width="60" height="160" rx="12" fill="url(#bottle-${mockup.id})" />
          <rect x="30" y="50" width="60" height="160" rx="12" fill="rgba(255,255,255,0.08)" />
          <rect x="35" y="90" width="50" height="1" fill="rgba(255,255,255,0.2)" />
          <text x="60" y="115" text-anchor="middle" fill="${isDark ? '#fff' : '#111'}" font-family="Inter" font-size="7" font-weight="800" letter-spacing="1.5">${mockup.productName.toUpperCase().slice(0, 12)}</text>
          <text x="60" y="128" text-anchor="middle" fill="${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}" font-family="Inter" font-size="5" letter-spacing="1">${mockup.productType.toUpperCase()}</text>
          <rect x="35" y="135" width="50" height="1" fill="rgba(255,255,255,0.2)" />
          <text x="60" y="155" text-anchor="middle" fill="${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}" font-family="Inter" font-size="4">30ml / 1.0 fl oz</text>
        </svg>`;
      break;
    case 'tube':
      containerSVG = `
        <svg viewBox="0 0 100 220" width="75" height="170" style="filter: drop-shadow(0 8px 20px rgba(0,0,0,0.3));">
          <defs>
            <linearGradient id="tube-${mockup.id}" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="${p.primary}" />
              <stop offset="100%" stop-color="${p.accent}" />
            </linearGradient>
          </defs>
          <rect x="38" y="5" width="24" height="20" rx="4" fill="${isDark ? '#ddd' : '#999'}" />
          <rect x="25" y="25" width="50" height="180" rx="20" fill="url(#tube-${mockup.id})" />
          <rect x="25" y="25" width="50" height="180" rx="20" fill="rgba(255,255,255,0.06)" />
          <rect x="32" y="70" width="36" height="1" fill="rgba(255,255,255,0.25)" />
          <text x="50" y="95" text-anchor="middle" fill="${isDark ? '#fff' : '#111'}" font-family="Inter" font-size="6" font-weight="800" letter-spacing="1.5">${mockup.productName.toUpperCase().slice(0, 10)}</text>
          <text x="50" y="108" text-anchor="middle" fill="${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}" font-family="Inter" font-size="4.5" letter-spacing="0.5">${mockup.productType.toUpperCase()}</text>
          <rect x="32" y="115" width="36" height="1" fill="rgba(255,255,255,0.25)" />
          <text x="50" y="145" text-anchor="middle" fill="${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}" font-family="Inter" font-size="4">50ml / 1.7 fl oz</text>
        </svg>`;
      break;
    case 'jar':
      containerSVG = `
        <svg viewBox="0 0 160 160" width="130" height="130" style="filter: drop-shadow(0 8px 20px rgba(0,0,0,0.3));">
          <defs>
            <linearGradient id="jar-${mockup.id}" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="${p.primary}" />
              <stop offset="100%" stop-color="${p.accent}" />
            </linearGradient>
          </defs>
          <rect x="25" y="8" width="110" height="22" rx="6" fill="${isDark ? '#ddd' : '#999'}" />
          <rect x="20" y="30" width="120" height="120" rx="16" fill="url(#jar-${mockup.id})" />
          <rect x="20" y="30" width="120" height="120" rx="16" fill="rgba(255,255,255,0.06)" />
          <circle cx="80" cy="80" r="32" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
          <text x="80" y="76" text-anchor="middle" fill="${isDark ? '#fff' : '#111'}" font-family="Inter" font-size="7" font-weight="800" letter-spacing="1">${mockup.productName.toUpperCase().slice(0, 12)}</text>
          <text x="80" y="90" text-anchor="middle" fill="${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}" font-family="Inter" font-size="5">${mockup.productType.toUpperCase()}</text>
          <text x="80" y="130" text-anchor="middle" fill="${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}" font-family="Inter" font-size="4">50g / 1.76 oz</text>
        </svg>`;
      break;
    case 'box':
      containerSVG = `
        <svg viewBox="0 0 140 180" width="110" height="140" style="filter: drop-shadow(0 8px 20px rgba(0,0,0,0.3));">
          <defs>
            <linearGradient id="box-${mockup.id}" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="${p.primary}" />
              <stop offset="100%" stop-color="${p.accent}" />
            </linearGradient>
          </defs>
          <rect x="10" y="10" width="120" height="160" rx="6" fill="url(#box-${mockup.id})" />
          <rect x="10" y="10" width="120" height="160" rx="6" fill="rgba(255,255,255,0.05)" />
          <line x1="10" y1="35" x2="130" y2="35" stroke="rgba(255,255,255,0.15)" stroke-width="0.5" />
          <text x="70" y="58" text-anchor="middle" fill="${isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'}" font-family="Inter" font-size="4" letter-spacing="3">PREMIUM SKINCARE</text>
          <text x="70" y="85" text-anchor="middle" fill="${isDark ? '#fff' : '#111'}" font-family="Inter" font-size="10" font-weight="800" letter-spacing="1">${mockup.productName.toUpperCase().slice(0, 12)}</text>
          <text x="70" y="102" text-anchor="middle" fill="${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}" font-family="Inter" font-size="5.5" letter-spacing="1">${mockup.productType.toUpperCase()}</text>
          <line x1="45" y1="115" x2="95" y2="115" stroke="rgba(255,255,255,0.2)" stroke-width="0.5" />
          <text x="70" y="135" text-anchor="middle" fill="${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}" font-family="Inter" font-size="4">30ml / 1.0 fl oz</text>
          <line x1="10" y1="148" x2="130" y2="148" stroke="rgba(255,255,255,0.15)" stroke-width="0.5" />
          <text x="70" y="162" text-anchor="middle" fill="${isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)'}" font-family="Inter" font-size="3.5">Made with care ✦ Eco-conscious</text>
        </svg>`;
      break;
  }

  return `
    <div class="mockup-card" style="animation: fadeInUp 0.5s ease forwards; animation-delay: ${MOCKUP_STYLES.findIndex(s => s.shape === mockup.shape) * 0.1}s; opacity: 0;">
      <div class="mockup-render" style="background: ${p.bg}; border: 1px solid ${borderColor};">
        <div class="mockup-container-svg">${containerSVG}</div>
      </div>
      <div class="mockup-meta">
        <div class="mockup-meta-header">
          <span class="mockup-icon">${mockup.icon}</span>
          <div>
            <div class="mockup-label">${mockup.label}</div>
            <div class="mockup-palette-name" style="color: ${p.primary};">${p.name}</div>
          </div>
        </div>
        ${mockup.ingredients.length > 0 ? `
          <div class="mockup-ingredients">
            ${mockup.ingredients.map(name => {
              const ing = INGREDIENTS.find(i => i.name === name);
              return `<span class="tag" style="background: ${ing?.color || '#f5d63d'}15; color: ${ing?.color || '#f5d63d'}; font-size:10px;">${name}</span>`;
            }).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// --- Product Pipeline (persistent storage) ---
function getProducts() {
  try { return JSON.parse(localStorage.getItem('trendlab_products') || '[]'); }
  catch { return []; }
}

function saveProduct(product) {
  const products = getProducts();
  products.unshift(product);
  localStorage.setItem('trendlab_products', JSON.stringify(products));
}

function deleteProduct(id) {
  const products = getProducts().filter(p => p.id !== id);
  localStorage.setItem('trendlab_products', JSON.stringify(products));
  renderPipeline();
  if (typeof showToast === 'function') showToast('Product removed', 'info');
}

function renderPipeline() {
  const container = document.getElementById('pipeline-grid');
  if (!container) return;
  const products = getProducts();
  const section = document.getElementById('pipeline');

  if (products.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = '';
  document.getElementById('pipeline-count').textContent = products.length;

  container.innerHTML = products.map(product => `
    <div class="pipeline-product">
      <div class="pipeline-product-header">
        <div>
          <div class="pipeline-product-name">${product.name}</div>
          <div class="pipeline-product-type">${product.type} · ${new Date(product.createdAt).toLocaleDateString()}</div>
        </div>
        <button class="btn-icon" onclick="deleteProduct(${product.id})" title="Delete">✕</button>
      </div>
      <div class="mockup-grid">
        ${product.mockups.map(m => renderMockupCard(m)).join('')}
      </div>

      ${product.analysis ? `
        <div style="margin-top: var(--space-md); padding: var(--space-sm); background: rgba(52,211,153,0.05); border-radius: var(--radius-sm); border: 1px solid rgba(52,211,153,0.1); font-size: 12px;">
          <strong style="color:var(--success)">Engine Validated:</strong>
          <span style="margin-left: 10px; color:var(--text-secondary)">Safety: <span style="font-weight:700; color:var(--text-primary)">${product.analysis.safety}</span></span>
          <span style="margin-left: 10px; color:var(--text-secondary)">Trend: <span style="font-weight:700; color:var(--text-primary)">${product.analysis.trend}</span></span>
          ${product.analysis.warnings?.length ? `<div style="margin-top: 5px; color: var(--danger)">⚠️ ${product.analysis.warnings[0]}</div>` : ''}
          ${product.analysis.insights?.length ? `<div style="margin-top: 5px; color: var(--accent-banana)">💡 ${product.analysis.insights[0]}</div>` : ''}
        </div>
      ` : ''}

      ${product.ingredients.length > 0 ? `
        <div style="margin-top: var(--space-md); display:flex; flex-wrap:wrap; gap:4px;">
          ${product.ingredients.map(n => {
            const ing = INGREDIENTS.find(i => i.name === n);
            return `<span class="tag" style="background:${ing?.color || '#f5d63d'}15;color:${ing?.color || '#f5d63d'};font-size:10px;">${n}</span>`;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
}

function clearForm() {
  document.getElementById('product-name').value = '';
  document.getElementById('product-type').value = '';
  document.getElementById('target-market').value = '';
  document.getElementById('product-desc').value = '';

  selectedIngredients.clear();
  document.querySelectorAll('.chip.selected').forEach(c => c.classList.remove('selected'));
  updatePreview();
}

// --- Charts ---
function initCharts() {
  drawTrendChart(window.trendDataCached || null);
  drawIngredientChart();
}

function drawTrendChart(realData = null) {
  const canvas = document.getElementById('trend-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);

  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  
  // Clear previous drawing
  ctx.clearRect(0, 0, w, h);

  let data1, data2;
  let points;

  if (realData && realData.timeline_data && realData.timeline_data.length > 0) {
    // Process real Google Trends Data
    points = realData.timeline_data.length;
    
    // Extract max values for scaling
    const maxVal1 = Math.max(...realData.timeline_data.map(d => parseInt(d.values[0]?.extracted_value || 0)));
    const maxVal2 = Math.max(...realData.timeline_data.map(d => parseInt(d.values[1]?.extracted_value || 0)));
    const absMax = Math.max(maxVal1, maxVal2, 100); // Scale against 100 or actual max

    // Normalize data between 0 and 1 for the chart drawing function
    data1 = realData.timeline_data.map(d => (parseInt(d.values[0]?.extracted_value || 0)) / absMax);
    data2 = realData.timeline_data.map(d => (parseInt(d.values[1]?.extracted_value || 0)) / absMax);
    
    // Update chart title to indicate real data
    const title = document.querySelector('.trend-chart-area .chart-title');
    if (title) title.textContent = 'Google Trends Real-Time (Past 30 Days)';
    
  } else {
    // Generate smooth curve mock data
    points = 30;
    data1 = Array.from({length: points}, (_, i) => {
      return 0.3 + 0.4 * Math.sin(i * 0.3) + 0.15 * Math.sin(i * 0.7) + (i / points) * 0.3;
    });
    data2 = Array.from({length: points}, (_, i) => {
      return 0.2 + 0.3 * Math.cos(i * 0.4) + 0.1 * Math.sin(i * 0.9) + (i / points) * 0.2;
    });
    
    const title = document.querySelector('.trend-chart-area .chart-title');
    if (title) title.textContent = 'Trend Velocity — 30 Day (Mock)';
  }

  function drawLine(data, color, alpha) {
    if (!data || data.length === 0) return;
    ctx.beginPath();
    data.forEach((val, i) => {
      const x = (i / (points - 1)) * w;
      // Subtract value from height (since 0,0 is top left)
      const y = h - val * h * 0.8 - h * 0.1;
      
      if (i === 0) ctx.moveTo(x, y);
      else {
        const prev = data[i - 1];
        const prevX = ((i - 1) / (points - 1)) * w;
        const prevY = h - prev * h * 0.8 - h * 0.1;
        const cpx = (prevX + x) / 2;
        ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
      }
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill gradient
    const lastX = w;
    const lastY = h - data[data.length - 1] * h * 0.8 - h * 0.1;
    ctx.lineTo(lastX, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color.replace('1)', `${alpha})`).replace('rgb', 'rgba'));
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Draw lines
  drawLine(data1, 'rgba(245, 214, 61, 1)', 0.15); // Banana Yellow
  if (data2.some(v => v > 0)) {
     drawLine(data2, 'rgba(244, 114, 182, 1)', 0.1); // Pink
  }
}


function drawIngredientChart() {
  const canvas = document.getElementById('ingredient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;

  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.scale(dpr, dpr);

  const w = canvas.offsetWidth;
  const h = canvas.offsetHeight;
  const padding = { top: 20, bottom: 40, left: 10, right: 10 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const top6 = [...INGREDIENTS].sort((a, b) => b.trend - a.trend).slice(0, 6);
  const barWidth = chartW / top6.length * 0.6;
  const gap = chartW / top6.length * 0.4;

  top6.forEach((ing, i) => {
    const x = padding.left + i * (barWidth + gap) + gap / 2;
    const barH = (ing.trend / 100) * chartH;
    const y = padding.top + chartH - barH;

    // Bar with rounded top
    const radius = 4;
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.arcTo(x, y, x + barWidth, y, radius);
    ctx.arcTo(x + barWidth, y, x + barWidth, y + barH, radius);
    ctx.lineTo(x + barWidth, padding.top + chartH);
    ctx.lineTo(x, padding.top + chartH);
    ctx.closePath();

    const grad = ctx.createLinearGradient(x, y, x, padding.top + chartH);
    grad.addColorStop(0, ing.color);
    grad.addColorStop(1, ing.color + '33');
    ctx.fillStyle = grad;
    ctx.fill();

    // Label
    ctx.fillStyle = '#9a9ab0';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(ing.name.split(' ')[0], x + barWidth / 2, h - 8);

    // Value
    ctx.fillStyle = '#f0f0f5';
    ctx.font = 'bold 11px Inter';
    ctx.fillText(ing.trend, x + barWidth / 2, y - 8);
  });
}

// --- Navigation ---
function initNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('href');
      if (target && target.startsWith('#')) {
        const el = document.querySelector(target);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Active link on scroll
  const sections = document.querySelectorAll('.section');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document.querySelectorAll('.nav-link').forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => observer.observe(s));
}

// --- Scroll Animations ---
function initAnimations() {
  const animElements = document.querySelectorAll('.card, .trend-item, .nano-hero');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  animElements.forEach(el => obs.observe(el));
}

// --- Live Counters (simulate real-time) ---
function startLiveCounters() {
  setInterval(() => {
    const statusEl = document.getElementById('live-time');
    if (statusEl) {
      const now = new Date();
      statusEl.textContent = `Last sync: ${now.toLocaleTimeString()}`;
    }
  }, 1000);
}

// --- Live search for product name preview ---
document.addEventListener('input', (e) => {
  if (e.target.id === 'product-name' || e.target.id === 'product-type') {
    updatePreview();
  }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'product-type' || e.target.id === 'target-market') {
    updatePreview();
  }
});

// --- Resize handler for charts ---
window.addEventListener('resize', () => {
  clearTimeout(window._resizeTimer);
  window._resizeTimer = setTimeout(() => {
    initCharts();
  }, 250);
});
