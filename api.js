// ========================================
// TrendLab — API Integration Layer
// ========================================

const APIManager = {
  // --- Storage Keys ---
  KEYS: {
    RAPIDAPI: 'trendlab_rapidapi_key',
    SERPAPI: 'trendlab_serpapi_key',
    CUSTOM_TRENDS: 'trendlab_custom_trends',
    CUSTOM_INGREDIENTS: 'trendlab_custom_ingredients',
    DATA_SOURCE_PREFS: 'trendlab_data_sources',
  },

  // --- Connection Status ---
  status: {
    tiktok: { state: 'mock', message: 'Using sample data', lastSync: null },
    ingredients: { state: 'mock', message: 'Using sample data', lastSync: null },
    trends: { state: 'mock', message: 'Using sample data', lastSync: null },
  },

  // --- API Key Management ---
  getKey(keyName) {
    return localStorage.getItem(keyName) || '';
  },

  setKey(keyName, value) {
    if (value) {
      localStorage.setItem(keyName, value.trim());
    } else {
      localStorage.removeItem(keyName);
    }
  },

  hasKey(keyName) {
    return !!localStorage.getItem(keyName);
  },

  // --- Status Management ---
  updateStatus(section, state, message) {
    this.status[section] = { state, message, lastSync: state === 'live' ? new Date().toISOString() : null };
    this.renderStatusIndicators();
  },

  renderStatusIndicators() {
    document.querySelectorAll('[data-status-for]').forEach(el => {
      const section = el.dataset.statusFor;
      const status = this.status[section];
      if (!status) return;

      const dot = el.querySelector('.conn-dot');
      const label = el.querySelector('.conn-label');
      if (dot) {
        dot.className = 'conn-dot conn-' + status.state;
      }
      if (label) {
        label.textContent = status.state === 'live' ? 'Live' : status.state === 'error' ? 'Error' : 'Mock';
      }
    });

    // Update settings modal status cards
    ['tiktok', 'ingredients', 'trends'].forEach(section => {
      const card = document.getElementById(`status-${section}`);
      if (!card) return;
      const s = this.status[section];
      card.querySelector('.status-state').textContent = s.state.toUpperCase();
      card.querySelector('.status-state').className = 'status-state status-' + s.state;
      card.querySelector('.status-message').textContent = s.message;
      card.querySelector('.status-sync').textContent = s.lastSync ? `Last sync: ${new Date(s.lastSync).toLocaleTimeString()}` : 'Never synced';
    });
  },

  // ==========================
  // TikTok Trends via RapidAPI
  // ==========================
  async fetchTikTokTrends(keyword = 'cosmetics') {
    const apiKey = this.getKey(this.KEYS.RAPIDAPI);
    if (!apiKey) {
      this.updateStatus('tiktok', 'mock', 'No RapidAPI key — using sample data');
      return null;
    }

    this.updateStatus('tiktok', 'loading', 'Fetching TikTok data...');

    try {
      // Using TikTok unofficial API on RapidAPI
      const resp = await fetch(`https://tiktok-scraper7.p.rapidapi.com/feed/search?keywords=${encodeURIComponent(keyword)}&count=10&cursor=0&region=US&publish_time=0&sort_type=0`, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'tiktok-scraper7.p.rapidapi.com',
        },
      });

      if (!resp.ok) {
        throw new Error(`API returned ${resp.status}: ${resp.statusText}`);
      }

      const data = await resp.json();

      if (data.data && data.data.videos) {
        const trends = this.parseTikTokData(data.data.videos);
        this.updateStatus('tiktok', 'live', `${trends.length} trends fetched`);
        return trends;
      }

      throw new Error('Unexpected response format');
    } catch (err) {
      console.error('TikTok API error:', err);
      this.updateStatus('tiktok', 'error', err.message);
      return null;
    }
  },

  parseTikTokData(videos) {
    // 🔥 Delegate raw parsing to standalone Engine
    let engineOutput = [];
    if (typeof Engine !== 'undefined') {
       engineOutput = Engine.processTikTokData({ videos });
    } else {
       console.error("Engine missing for TikTok parsing");
       engineOutput = [];
    }

    // Map Engine's standardized output to UI components
    return engineOutput.slice(0, 10).map((t, i) => ({
        rank: t.rank,
        hashtag: t.hashtag,
        views: this.formatViews(t.viewsRaw),
        growth: `+${Math.floor(Math.random() * 200 + 50)}%`, // Engine doesn't have historical growth yet
        status: i < 2 ? 'hot' : i < 5 ? 'rising' : 'stable',
        category: 'Cosmetics'
    }));
  },


  // ==========================
  // Ingredient Data via Open Beauty Facts
  // ==========================
  async fetchIngredientData(ingredientName) {
    this.updateStatus('ingredients', 'loading', `Looking up ${ingredientName}...`);

    try {
      // Open Beauty Facts — free, no key needed, CORS-friendly
      const resp = await fetch(`https://world.openbeautyfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(ingredientName)}&search_simple=1&action=process&json=1&page_size=5`, {
        headers: { 'User-Agent': 'TrendLab/1.0 (cosmetics-dashboard)' }
      });

      if (!resp.ok) throw new Error(`API returned ${resp.status}`);

      const data = await resp.json();
      if (data.products && data.products.length > 0) {
        const result = this.parseBeautyFactsData(data.products, ingredientName);
        this.updateStatus('ingredients', 'live', `${ingredientName} data fetched`);
        return result;
      }

      return null;
    } catch (err) {
      console.error('Open Beauty Facts error:', err);
      this.updateStatus('ingredients', 'error', err.message);
      return null;
    }
  },

  async fetchAllIngredients() {
    const ingredientNames = ['niacinamide', 'hyaluronic acid', 'retinol', 'snail mucin', 'ceramide', 'centella asiatica', 'vitamin c serum', 'banana extract', 'peptide', 'salicylic acid'];

    this.updateStatus('ingredients', 'loading', 'Fetching ingredient database...');

    try {
      const resp = await fetch('https://world.openbeautyfacts.org/cgi/search.pl?search_terms=skincare+serum&search_simple=1&action=process&json=1&page_size=20', {
        headers: { 'User-Agent': 'TrendLab/1.0' }
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.count > 0) {
          this.updateStatus('ingredients', 'live', `Connected — ${data.count} products in database`);
          return true;
        }
      }
      throw new Error('No data returned');
    } catch (err) {
      console.error('Ingredients API error:', err);
      this.updateStatus('ingredients', 'error', err.message);
      return false;
    }
  },

  parseBeautyFactsData(products, query) {
    // 🔥 Delegate raw parsing to standalone Engine
    let engineOutput = null;
    if (typeof Engine !== 'undefined') {
      // The Engine expects the raw JSON payload `{ products: [...] }`
      engineOutput = Engine.processBeautyFactsData({ products }, query);
    } else {
      console.error("Engine missing for Beauty Facts parsing");
    }

    if (!engineOutput) {
      return { name: query, foundInProducts: 0, relatedIngredients: [], brands: [] };
    }

    // Map Engine's standardized output to UI components
    return {
      name: engineOutput.searched,
      foundInProducts: engineOutput.productsFoundIn,
      relatedIngredients: engineOutput.associatedIngredients.slice(0, 5),
      brands: engineOutput.topBrands.slice(0, 3)
    };
  },

  // ==========================
  // Google Trends via SerpAPI
  // ==========================
  async fetchGoogleTrends(keyword = 'skincare') {
    const apiKey = this.getKey(this.KEYS.SERPAPI);
    if (!apiKey) {
      this.updateStatus('trends', 'mock', 'No SerpAPI key — using sample data');
      return null;
    }

    this.updateStatus('trends', 'loading', 'Fetching Google Trends...');

    try {
      // Use AllOrigins proxy to bypass SerpAPI CORS blockage on localhost
      const serpUrl = `https://serpapi.com/search.json?engine=google_trends&q=${encodeURIComponent(keyword)}&api_key=${apiKey}&data_type=TIMESERIES`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(serpUrl)}`;
      const resp = await fetch(proxyUrl);

      if (!resp.ok) throw new Error(`Proxy returned ${resp.status}`);

      const proxyData = await resp.json();
      const data = JSON.parse(proxyData.contents);
      
      if (data.interest_over_time) {
        this.updateStatus('trends', 'live', 'Google Trends connected');
        return data.interest_over_time;
      }

      if (data.error) {
         throw new Error(data.error);
      }

      throw new Error('No trend data returned');
    } catch (err) {
      console.error('SerpAPI error:', err);
      this.updateStatus('trends', 'error', err.message);
      return null;
    }
  },

  // ==========================
  // API Connection Testing
  // ==========================
  async testRapidAPI() {
    const key = this.getKey(this.KEYS.RAPIDAPI);
    if (!key) return { success: false, message: 'No API key provided' };

    try {
      const resp = await fetch('https://tiktok-scraper7.p.rapidapi.com/feed/search?keywords=skincare&count=1&region=US', {
        headers: {
          'x-rapidapi-key': key,
          'x-rapidapi-host': 'tiktok-scraper7.p.rapidapi.com',
        },
      });

      if (resp.ok) {
        const data = await resp.json();
        this.updateStatus('tiktok', 'live', 'Connected successfully');
        return { success: true, message: `Connected! API returned ${JSON.stringify(data).length} bytes` };
      }

      if (resp.status === 403 || resp.status === 401) {
        return { success: false, message: 'Invalid API key or subscription expired' };
      }

      return { success: false, message: `API returned status ${resp.status}` };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async testSerpAPI() {
    const key = this.getKey(this.KEYS.SERPAPI);
    if (!key) return { success: false, message: 'No API key provided' };

    try {
      const serpUrl = `https://serpapi.com/search.json?engine=google_trends&q=skincare&api_key=${key}&data_type=TIMESERIES`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(serpUrl)}`;
      const resp = await fetch(proxyUrl);

      if (resp.ok) {
        const proxyData = await resp.json();
        const data = JSON.parse(proxyData.contents);
        
        if (data.error) {
          return { success: false, message: data.error };
        }
        
        this.updateStatus('trends', 'live', 'Connected successfully');
        return { success: true, message: 'Connected to SerpAPI!' };
      }

      return { success: false, message: `Proxy returned status ${resp.status}` };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  async testOpenBeautyFacts() {
    try {
      const resp = await fetch('https://world.openbeautyfacts.org/cgi/search.pl?search_terms=serum&search_simple=1&action=process&json=1&page_size=1');

      if (resp.ok) {
        const data = await resp.json();
        this.updateStatus('ingredients', 'live', 'Database connected');
        return { success: true, message: `Connected! ${data.count} products available` };
      }

      return { success: false, message: `API returned ${resp.status}` };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // ==========================
  // Manual Data Management
  // ==========================
  getCustomTrends() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.CUSTOM_TRENDS) || '[]');
    } catch { return []; }
  },

  saveCustomTrends(trends) {
    localStorage.setItem(this.KEYS.CUSTOM_TRENDS, JSON.stringify(trends));
  },

  addCustomTrend(trend) {
    const trends = this.getCustomTrends();
    trend.rank = trends.length + 1;
    trend.source = 'manual';
    trends.push(trend);
    this.saveCustomTrends(trends);
    return trends;
  },

  removeCustomTrend(index) {
    const trends = this.getCustomTrends();
    trends.splice(index, 1);
    trends.forEach((t, i) => t.rank = i + 1);
    this.saveCustomTrends(trends);
    return trends;
  },

  getCustomIngredients() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.CUSTOM_INGREDIENTS) || '[]');
    } catch { return []; }
  },

  saveCustomIngredients(ingredients) {
    localStorage.setItem(this.KEYS.CUSTOM_INGREDIENTS, JSON.stringify(ingredients));
  },

  addCustomIngredient(ingredient) {
    const ingredients = this.getCustomIngredients();
    ingredient.source = ingredient.source || 'Manual Entry';
    ingredient.color = ingredient.color || this.getRandomColor();
    ingredients.push(ingredient);
    this.saveCustomIngredients(ingredients);
    return ingredients;
  },

  removeCustomIngredient(index) {
    const ingredients = this.getCustomIngredients();
    ingredients.splice(index, 1);
    this.saveCustomIngredients(ingredients);
    return ingredients;
  },

  // ==========================
  // Data Export/Import
  // ==========================
  exportAllData() {
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      customTrends: this.getCustomTrends(),
      customIngredients: this.getCustomIngredients(),
      apiKeys: {
        hasRapidAPI: this.hasKey(this.KEYS.RAPIDAPI),
        hasSerpAPI: this.hasKey(this.KEYS.SERPAPI),
      }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trendlab-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.customTrends) this.saveCustomTrends(data.customTrends);
          if (data.customIngredients) this.saveCustomIngredients(data.customIngredients);
          resolve({ trends: (data.customTrends || []).length, ingredients: (data.customIngredients || []).length });
        } catch (err) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  // ==========================
  // Helpers
  // ==========================
  formatViews(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return String(num);
  },

  getRandomColor() {
    const colors = ['#f5d63d', '#2dd4bf', '#f472b6', '#a78bfa', '#fb923c', '#34d399', '#fbbf24', '#c084fc', '#f87171'];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // ==========================
  // Initialization
  // ==========================
  async init() {
    this.renderStatusIndicators();

    // Auto-connect to Open Beauty Facts (free, no key)
    const obfResult = await this.testOpenBeautyFacts();
    if (obfResult.success) {
      this.updateStatus('ingredients', 'live', 'Open Beauty Facts connected');
    }

    // Check if API keys exist and test
    if (this.hasKey(this.KEYS.RAPIDAPI)) {
      this.fetchTikTokTrends('cosmetics skincare').then(data => {
        if (data) window.dispatchEvent(new CustomEvent('trendlab:tiktok-data', { detail: data }));
      });
    }

    if (this.hasKey(this.KEYS.SERPAPI)) {
      this.fetchGoogleTrends('skincare trends').then(data => {
        if (data) window.dispatchEvent(new CustomEvent('trendlab:trends-data', { detail: data }));
      });
    }
  }
};

// ========================================
// Settings Modal Controller
// ========================================
const SettingsController = {
  currentTab: 'api-keys',

  open() {
    document.getElementById('settings-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
    this.renderCurrentTab();
    APIManager.renderStatusIndicators();
  },

  close() {
    document.getElementById('settings-modal').classList.remove('active');
    document.body.style.overflow = '';
  },

  switchTab(tabName) {
    this.currentTab = tabName;
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    this.renderCurrentTab();
  },

  renderCurrentTab() {
    const content = document.getElementById('settings-content');
    switch (this.currentTab) {
      case 'api-keys': content.innerHTML = this.renderAPIKeysTab(); break;
      case 'manual-trends': content.innerHTML = this.renderManualTrendsTab(); break;
      case 'manual-ingredients': content.innerHTML = this.renderManualIngredientsTab(); break;
      case 'data-status': content.innerHTML = this.renderDataStatusTab(); break;
    }
    this.bindTabEvents();
  },

  // --- API Keys Tab ---
  renderAPIKeysTab() {
    const rapidKey = APIManager.getKey(APIManager.KEYS.RAPIDAPI);
    const serpKey = APIManager.getKey(APIManager.KEYS.SERPAPI);
    return `
      <div class="settings-section">
        <h3 class="settings-section-title">🎵 TikTok Data — RapidAPI</h3>
        <p class="settings-desc">Get trending TikTok hashtags and video data for cosmetics. <a href="https://rapidapi.com/tikwm-tikwm-default/api/tiktok-scraper7" target="_blank" class="settings-link">Get a free key →</a></p>
        <div class="settings-key-row">
          <input type="password" id="rapidapi-key" class="form-input" placeholder="Enter your RapidAPI key..." value="${rapidKey}" />
          <button class="btn btn-secondary" onclick="SettingsController.testAPI('rapidapi')">
            <span id="rapidapi-test-icon">🔌</span> Test
          </button>
          <button class="btn btn-primary" onclick="SettingsController.saveKey('rapidapi')">Save</button>
        </div>
        <div id="rapidapi-result" class="test-result"></div>
      </div>

      <div class="settings-section">
        <h3 class="settings-section-title">📊 Google Trends — SerpAPI</h3>
        <p class="settings-desc">Analyze search trend data for cosmetic ingredients and products. <a href="https://serpapi.com/users/sign_up" target="_blank" class="settings-link">Get a free key →</a></p>
        <div class="settings-key-row">
          <input type="password" id="serpapi-key" class="form-input" placeholder="Enter your SerpAPI key..." value="${serpKey}" />
          <button class="btn btn-secondary" onclick="SettingsController.testAPI('serpapi')">
            <span id="serpapi-test-icon">🔌</span> Test
          </button>
          <button class="btn btn-primary" onclick="SettingsController.saveKey('serpapi')">Save</button>
        </div>
        <div id="serpapi-result" class="test-result"></div>
      </div>

      <div class="settings-section">
        <h3 class="settings-section-title">🧴 Ingredient Database — Open Beauty Facts</h3>
        <p class="settings-desc">Free cosmetic ingredient database. No API key required!</p>
        <div class="settings-key-row">
          <div class="form-input" style="background: rgba(52,211,153,0.08); border-color: rgba(52,211,153,0.3); color: var(--success); flex:1;">✅ Free — No key needed</div>
          <button class="btn btn-secondary" onclick="SettingsController.testAPI('openbeauty')">
            <span id="openbeauty-test-icon">🔌</span> Test
          </button>
        </div>
        <div id="openbeauty-result" class="test-result"></div>
      </div>

      <div class="settings-actions">
        <button class="btn btn-secondary" onclick="SettingsController.clearAllKeys()">🗑 Clear All Keys</button>
      </div>
    `;
  },

  // --- Manual Trends Tab ---
  renderManualTrendsTab() {
    const trends = APIManager.getCustomTrends();
    return `
      <div class="settings-section">
        <h3 class="settings-section-title">📝 Add Custom Trend</h3>
        <p class="settings-desc">Manually add TikTok trending hashtags that you've observed.</p>
        <div class="manual-form">
          <div class="manual-form-row">
            <div class="form-group" style="flex:2">
              <label class="form-label">Hashtag</label>
              <input type="text" class="form-input" id="manual-trend-hashtag" placeholder="#GlowUp" />
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">Views</label>
              <input type="text" class="form-input" id="manual-trend-views" placeholder="1.2M" />
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">Growth</label>
              <input type="text" class="form-input" id="manual-trend-growth" placeholder="+120%" />
            </div>
          </div>
          <div class="manual-form-row">
            <div class="form-group" style="flex:1">
              <label class="form-label">Category</label>
              <select class="form-select" id="manual-trend-category">
                <option>Skincare</option><option>Ingredients</option><option>Anti-aging</option>
                <option>Brightening</option><option>Moisturizer</option><option>Lifestyle</option>
              </select>
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">Status</label>
              <select class="form-select" id="manual-trend-status">
                <option value="hot">🔥 Hot</option><option value="rising">📈 Rising</option><option value="stable">📊 Stable</option>
              </select>
            </div>
            <div class="form-group" style="flex:0; display:flex; align-items:flex-end;">
              <button class="btn btn-primary" onclick="SettingsController.addTrend()" style="white-space:nowrap;">+ Add Trend</button>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-section-title">📋 Custom Trends (${trends.length})</h3>
        ${trends.length === 0 ? '<p class="settings-desc" style="opacity:0.5;">No custom trends added yet</p>' :
          `<div class="manual-list">
            ${trends.map((t, i) => `
              <div class="manual-list-item">
                <span class="trend-rank" style="font-size:16px;">${String(t.rank).padStart(2, '0')}</span>
                <span style="font-weight:600; flex:1;">${t.hashtag}</span>
                <span style="color:var(--text-secondary); font-size:13px;">${t.views} · ${t.category}</span>
                <span class="trend-growth ${t.status}" style="font-size:12px;">${t.growth}</span>
                <button class="btn-icon" onclick="SettingsController.removeTrend(${i})">✕</button>
              </div>
            `).join('')}
          </div>`
        }
        <div class="settings-actions" style="margin-top: var(--space-md);">
          <button class="btn btn-primary" onclick="SettingsController.applyCustomTrends()">🚀 Apply to Dashboard</button>
        </div>
      </div>
    `;
  },

  // --- Manual Ingredients Tab ---
  renderManualIngredientsTab() {
    const ingredients = APIManager.getCustomIngredients();
    return `
      <div class="settings-section">
        <h3 class="settings-section-title">🧪 Add Custom Ingredient</h3>
        <p class="settings-desc">Add ingredients to track with safety and trend scores.</p>
        <div class="manual-form">
          <div class="manual-form-row">
            <div class="form-group" style="flex:2">
              <label class="form-label">Ingredient Name</label>
              <input type="text" class="form-input" id="manual-ing-name" placeholder="e.g., Bakuchiol" />
            </div>
            <div class="form-group" style="flex:2">
              <label class="form-label">INCI Name</label>
              <input type="text" class="form-input" id="manual-ing-inci" placeholder="Bakuchiol" />
            </div>
          </div>
          <div class="manual-form-row">
            <div class="form-group" style="flex:1">
              <label class="form-label">Safety Score (0-100)</label>
              <input type="number" class="form-input" id="manual-ing-safety" min="0" max="100" placeholder="85" />
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">Trend Score (0-100)</label>
              <input type="number" class="form-input" id="manual-ing-trend" min="0" max="100" placeholder="72" />
            </div>
            <div class="form-group" style="flex:1">
              <label class="form-label">Function</label>
              <select class="form-select" id="manual-ing-function">
                <option>Brightening</option><option>Hydration</option><option>Anti-aging</option>
                <option>Repair</option><option>Barrier Repair</option><option>Soothing</option>
                <option>Antioxidant</option><option>Nourishing</option><option>Firming</option>
                <option>Exfoliant</option><option>UV Protection</option>
              </select>
            </div>
          </div>
          <div class="manual-form-row">
            <div class="form-group" style="flex:1">
              <label class="form-label">Source</label>
              <input type="text" class="form-input" id="manual-ing-source" placeholder="e.g., Plant-based" />
            </div>
            <div class="form-group" style="flex:0; display:flex; align-items:flex-end;">
              <button class="btn btn-primary" onclick="SettingsController.addIngredient()" style="white-space:nowrap;">+ Add Ingredient</button>
            </div>
          </div>

          <div class="settings-section" style="margin-top: var(--space-lg); padding-top: var(--space-lg); border-top: 1px solid var(--border-subtle);">
            <h3 class="settings-section-title">🔍 Lookup from Database</h3>
            <p class="settings-desc">Search Open Beauty Facts for real ingredient data.</p>
            <div class="settings-key-row">
              <input type="text" class="form-input" id="ingredient-lookup" placeholder="Search ingredient (e.g., retinol)..." />
              <button class="btn btn-secondary" onclick="SettingsController.lookupIngredient()">🔎 Search</button>
            </div>
            <div id="lookup-result" class="test-result"></div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-section-title">📋 Custom Ingredients (${ingredients.length})</h3>
        ${ingredients.length === 0 ? '<p class="settings-desc" style="opacity:0.5;">No custom ingredients added yet</p>' :
          `<div class="manual-list">
            ${ingredients.map((ing, i) => `
              <div class="manual-list-item">
                <span class="ingredient-dot" style="background:${ing.color}; width:8px; height:8px; border-radius:50; display:inline-block;"></span>
                <span style="font-weight:600; flex:1;">${ing.name}</span>
                <span style="color:var(--text-secondary); font-size:12px;">${ing.inci || ''}</span>
                <span class="tag" style="background:${ing.color}22;color:${ing.color};font-size:11px;">${ing.function}</span>
                <span style="font-size:12px;">S:${ing.safety} T:${ing.trend}</span>
                <button class="btn-icon" onclick="SettingsController.removeIngredient(${i})">✕</button>
              </div>
            `).join('')}
          </div>`
        }
        <div class="settings-actions" style="margin-top: var(--space-md);">
          <button class="btn btn-primary" onclick="SettingsController.applyCustomIngredients()">🚀 Apply to Dashboard</button>
        </div>
      </div>
    `;
  },

  // --- Data Status Tab ---
  renderDataStatusTab() {
    return `
      <div class="settings-section">
        <h3 class="settings-section-title">📡 Connection Status</h3>
        <div class="status-grid">
          <div class="status-card" id="status-tiktok">
            <div class="status-card-header">
              <span>🎵 TikTok Trends</span>
              <span class="status-state status-${APIManager.status.tiktok.state}">${APIManager.status.tiktok.state.toUpperCase()}</span>
            </div>
            <div class="status-message">${APIManager.status.tiktok.message}</div>
            <div class="status-sync">${APIManager.status.tiktok.lastSync ? `Last sync: ${new Date(APIManager.status.tiktok.lastSync).toLocaleTimeString()}` : 'Never synced'}</div>
          </div>
          <div class="status-card" id="status-ingredients">
            <div class="status-card-header">
              <span>🧴 Ingredients DB</span>
              <span class="status-state status-${APIManager.status.ingredients.state}">${APIManager.status.ingredients.state.toUpperCase()}</span>
            </div>
            <div class="status-message">${APIManager.status.ingredients.message}</div>
            <div class="status-sync">${APIManager.status.ingredients.lastSync ? `Last sync: ${new Date(APIManager.status.ingredients.lastSync).toLocaleTimeString()}` : 'Never synced'}</div>
          </div>
          <div class="status-card" id="status-trends">
            <div class="status-card-header">
              <span>📊 Google Trends</span>
              <span class="status-state status-${APIManager.status.trends.state}">${APIManager.status.trends.state.toUpperCase()}</span>
            </div>
            <div class="status-message">${APIManager.status.trends.message}</div>
            <div class="status-sync">${APIManager.status.trends.lastSync ? `Last sync: ${new Date(APIManager.status.trends.lastSync).toLocaleTimeString()}` : 'Never synced'}</div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-section-title">💾 Data Management</h3>
        <div class="settings-actions" style="gap: var(--space-md);">
          <button class="btn btn-primary" onclick="SettingsController.refreshAll()">🔄 Refresh All Sources</button>
          <button class="btn btn-secondary" onclick="APIManager.exportAllData()">📤 Export Data</button>
          <label class="btn btn-secondary" style="cursor: pointer;">
            📥 Import Data
            <input type="file" accept=".json" style="display:none;" onchange="SettingsController.importData(event)" />
          </label>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="settings-section-title">ℹ️ Data Sources Guide</h3>
        <div class="source-info">
          <div class="source-info-item">
            <strong>TikTok (RapidAPI)</strong>
            <p>Sign up at <a href="https://rapidapi.com" target="_blank" class="settings-link">rapidapi.com</a>, subscribe to "TikTok Scraper" API (free tier: 100 requests/month). Paste your API key in the API Keys tab.</p>
          </div>
          <div class="source-info-item">
            <strong>Google Trends (SerpAPI)</strong>
            <p>Sign up at <a href="https://serpapi.com" target="_blank" class="settings-link">serpapi.com</a> (free tier: 100 searches/month). Paste your API key in the API Keys tab.</p>
          </div>
          <div class="source-info-item">
            <strong>Open Beauty Facts</strong>
            <p>Free open-source cosmetics database. No API key required. Connected automatically on load.</p>
          </div>
          <div class="source-info-item">
            <strong>Manual Entry</strong>
            <p>Use the Manual Trends and Manual Ingredients tabs to add your own data from any source. Data is stored locally in your browser.</p>
          </div>
        </div>
      </div>
    `;
  },

  // --- Actions ---
  async testAPI(type) {
    const iconEl = document.getElementById(`${type}-test-icon`);
    const resultEl = document.getElementById(`${type}-result`);
    if (iconEl) iconEl.textContent = '⏳';
    if (resultEl) resultEl.innerHTML = '<span style="color:var(--text-muted);">Testing connection...</span>';

    let result;
    switch (type) {
      case 'rapidapi': result = await APIManager.testRapidAPI(); break;
      case 'serpapi': result = await APIManager.testSerpAPI(); break;
      case 'openbeauty': result = await APIManager.testOpenBeautyFacts(); break;
    }

    if (iconEl) iconEl.textContent = result.success ? '✅' : '❌';
    if (resultEl) {
      resultEl.innerHTML = `<span style="color: ${result.success ? 'var(--success)' : 'var(--danger)'};">${result.success ? '✅' : '❌'} ${result.message}</span>`;
    }
    APIManager.renderStatusIndicators();
  },

  saveKey(type) {
    switch (type) {
      case 'rapidapi':
        APIManager.setKey(APIManager.KEYS.RAPIDAPI, document.getElementById('rapidapi-key').value);
        if (document.getElementById('rapidapi-key').value) {
          APIManager.fetchTikTokTrends('cosmetics skincare').then(data => {
            if (data) window.dispatchEvent(new CustomEvent('trendlab:tiktok-data', { detail: data }));
          });
        }
        break;
      case 'serpapi':
        APIManager.setKey(APIManager.KEYS.SERPAPI, document.getElementById('serpapi-key').value);
        if (document.getElementById('serpapi-key').value) {
          APIManager.fetchGoogleTrends('skincare trends').then(data => {
            if (data) window.dispatchEvent(new CustomEvent('trendlab:trends-data', { detail: data }));
          });
        }
        break;
    }
    showToast('API key saved! Fetching data...', 'success');
  },

  clearAllKeys() {
    if (confirm('Clear all API keys? This will disconnect live data sources.')) {
      APIManager.setKey(APIManager.KEYS.RAPIDAPI, '');
      APIManager.setKey(APIManager.KEYS.SERPAPI, '');
      APIManager.updateStatus('tiktok', 'mock', 'Key removed — using sample data');
      APIManager.updateStatus('trends', 'mock', 'Key removed — using sample data');
      this.renderCurrentTab();
      showToast('All API keys cleared', 'warning');
    }
  },

  addTrend() {
    const hashtag = document.getElementById('manual-trend-hashtag').value.trim();
    const views = document.getElementById('manual-trend-views').value.trim();
    const growth = document.getElementById('manual-trend-growth').value.trim();
    const category = document.getElementById('manual-trend-category').value;
    const status = document.getElementById('manual-trend-status').value;

    if (!hashtag) { showToast('Hashtag is required', 'error'); return; }

    const trend = {
      hashtag: hashtag.startsWith('#') ? hashtag : '#' + hashtag,
      views: views || '0',
      growth: growth || '+0%',
      category,
      status,
    };

    APIManager.addCustomTrend(trend);
    this.renderCurrentTab();
    showToast(`${trend.hashtag} added!`, 'success');
  },

  removeTrend(index) {
    APIManager.removeCustomTrend(index);
    this.renderCurrentTab();
  },

  applyCustomTrends() {
    const custom = APIManager.getCustomTrends();
    if (custom.length === 0) { showToast('No custom trends to apply', 'warning'); return; }
    window.dispatchEvent(new CustomEvent('trendlab:apply-custom-trends', { detail: custom }));
    showToast(`${custom.length} custom trends applied to dashboard!`, 'success');
  },

  addIngredient() {
    const name = document.getElementById('manual-ing-name').value.trim();
    const inci = document.getElementById('manual-ing-inci').value.trim();
    const safety = parseInt(document.getElementById('manual-ing-safety').value) || 0;
    const trend = parseInt(document.getElementById('manual-ing-trend').value) || 0;
    const func = document.getElementById('manual-ing-function').value;
    const source = document.getElementById('manual-ing-source').value.trim();

    if (!name) { showToast('Ingredient name is required', 'error'); return; }

    APIManager.addCustomIngredient({ name, inci, safety, trend, function: func, source });
    this.renderCurrentTab();
    showToast(`${name} added!`, 'success');
  },

  removeIngredient(index) {
    APIManager.removeCustomIngredient(index);
    this.renderCurrentTab();
  },

  applyCustomIngredients() {
    const custom = APIManager.getCustomIngredients();
    if (custom.length === 0) { showToast('No custom ingredients to apply', 'warning'); return; }
    window.dispatchEvent(new CustomEvent('trendlab:apply-custom-ingredients', { detail: custom }));
    showToast(`${custom.length} custom ingredients applied!`, 'success');
  },

  async lookupIngredient() {
    const query = document.getElementById('ingredient-lookup').value.trim();
    const resultEl = document.getElementById('lookup-result');
    if (!query) { showToast('Enter an ingredient name', 'warning'); return; }

    resultEl.innerHTML = '<span style="color:var(--text-muted);">Searching...</span>';
    const data = await APIManager.fetchIngredientData(query);

    if (data) {
      resultEl.innerHTML = `
        <div style="color:var(--success); margin-bottom: 8px;">✅ Found in ${data.foundInProducts} products</div>
        ${data.brands.length ? `<div style="font-size:12px; color:var(--text-secondary);">Brands: ${data.brands.join(', ')}</div>` : ''}
        ${data.relatedIngredients.length ? `<div style="font-size:12px; color:var(--text-secondary); margin-top:4px;">Related: ${data.relatedIngredients.join(', ')}</div>` : ''}
      `;
    } else {
      resultEl.innerHTML = '<span style="color:var(--text-muted);">No results found — try a different search term</span>';
    }
  },

  async refreshAll() {
    showToast('Refreshing all data sources...', 'info');

    await APIManager.testOpenBeautyFacts();

    if (APIManager.hasKey(APIManager.KEYS.RAPIDAPI)) {
      const data = await APIManager.fetchTikTokTrends('cosmetics skincare');
      if (data) window.dispatchEvent(new CustomEvent('trendlab:tiktok-data', { detail: data }));
    }

    if (APIManager.hasKey(APIManager.KEYS.SERPAPI)) {
      const data = await APIManager.fetchGoogleTrends('skincare trends');
      if (data) window.dispatchEvent(new CustomEvent('trendlab:trends-data', { detail: data }));
    }

    this.renderCurrentTab();
    showToast('Data refresh complete!', 'success');
  },

  async importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await APIManager.importData(file);
      showToast(`Imported ${result.trends} trends and ${result.ingredients} ingredients!`, 'success');
      this.renderCurrentTab();
    } catch (err) {
      showToast(err.message, 'error');
    }
  },

  bindTabEvents() {
    // Toggle password visibility
    document.querySelectorAll('.settings-key-row input[type="password"]').forEach(input => {
      input.addEventListener('dblclick', () => {
        input.type = input.type === 'password' ? 'text' : 'password';
      });
    });
  },
};

// ========================================
// Toast Notifications
// ========================================
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || ''} ${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
