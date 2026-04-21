/**
 * Tags Manager App/Plugin for DA
 * 
 * Features:
 * - View and search tags by category
 * - Select multiple tags
 * - Insert tags as metadata into documents (plugin mode)
 * - Manage tags for your site (app mode)
 */

import DA_SDK from 'https://da.live/nx/utils/sdk.js';

// ============================================
// TAG DATA - Customize these for your site
// ============================================
const TAGS_DATA = {
  'Topics': [
    { name: 'Technology', icon: '💻' },
    { name: 'Business', icon: '💼' },
    { name: 'Marketing', icon: '📢' },
    { name: 'Design', icon: '🎨' },
    { name: 'Development', icon: '⚙️' },
    { name: 'Analytics', icon: '📊' },
    { name: 'Security', icon: '🔒' },
    { name: 'Cloud', icon: '☁️' },
  ],
  'Products': [
    { name: 'Adobe Experience Manager', icon: '🔷' },
    { name: 'Adobe Analytics', icon: '📈' },
    { name: 'Adobe Target', icon: '🎯' },
    { name: 'Adobe Campaign', icon: '📧' },
    { name: 'Adobe Commerce', icon: '🛒' },
    { name: 'Creative Cloud', icon: '🎨' },
    { name: 'Document Cloud', icon: '📄' },
  ],
  'Content Type': [
    { name: 'Article', icon: '📝' },
    { name: 'Tutorial', icon: '📚' },
    { name: 'Case Study', icon: '📋' },
    { name: 'White Paper', icon: '📑' },
    { name: 'Video', icon: '🎬' },
    { name: 'Webinar', icon: '🎙️' },
    { name: 'Blog Post', icon: '✍️' },
  ],
  'Audience': [
    { name: 'Developers', icon: '👨‍💻' },
    { name: 'Marketers', icon: '👩‍💼' },
    { name: 'Designers', icon: '👨‍🎨' },
    { name: 'Executives', icon: '👔' },
    { name: 'IT Professionals', icon: '🖥️' },
    { name: 'Small Business', icon: '🏪' },
    { name: 'Enterprise', icon: '🏢' },
  ],
  'Region': [
    { name: 'North America', icon: '🌎' },
    { name: 'Europe', icon: '🌍' },
    { name: 'Asia Pacific', icon: '🌏' },
    { name: 'Latin America', icon: '🌎' },
    { name: 'Global', icon: '🌐' },
  ],
};

// ============================================
// APP STATE
// ============================================
let state = {
  context: null,
  actions: null,
  token: null,
  selectedCategory: 'All',
  selectedTags: [],
  searchQuery: '',
  isPluginMode: false,
};

// ============================================
// INITIALIZATION
// ============================================
(async function init() {
  const app = document.getElementById('app');
  
  try {
    const { context, token, actions } = await DA_SDK;
    
    state.context = context;
    state.token = token;
    state.actions = actions;
    state.isPluginMode = context && Object.keys(context).length > 0;
    
    console.log('Tags App Initialized');
    console.log('Mode:', state.isPluginMode ? 'Plugin' : 'Standalone App');
    console.log('Context:', context);
    
    render();
    
  } catch (error) {
    console.error('SDK Error:', error);
    app.innerHTML = `
      <div class="loading">
        <p>Error loading Tags Manager</p>
        <p style="font-size: 12px; color: #999;">${error.message}</p>
      </div>
    `;
  }
}());

// ============================================
// RENDER FUNCTIONS
// ============================================
function render() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    ${renderHeader()}
    ${renderSearchBar()}
    ${renderCategoryTabs()}
    ${state.selectedTags.length > 0 ? renderSelectedTags() : ''}
    ${renderTagsGrid()}
    ${renderAddTagSection()}
    ${renderActions()}
  `;
  
  attachEventListeners();
}

function renderHeader() {
  const modeClass = state.isPluginMode ? 'plugin-mode' : 'app-mode';
  const modeText = state.isPluginMode ? 'Plugin Mode' : 'App Mode';
  
  const contextInfo = state.isPluginMode && state.context.repo 
    ? `<span class="context-info">${state.context.org}/${state.context.repo}${state.context.path || ''}</span>`
    : '';
  
  return `
    <header>
      <div>
        <h1>🏷️ Tags Manager</h1>
        ${contextInfo}
      </div>
      <span class="mode-badge ${modeClass}">${modeText}</span>
    </header>
  `;
}

function renderSearchBar() {
  return `
    <div class="search-bar">
      <input 
        type="text" 
        class="search-input" 
        id="search-input"
        placeholder="Search tags..." 
        value="${state.searchQuery}"
      >
    </div>
  `;
}

function renderCategoryTabs() {
  const categories = ['All', ...Object.keys(TAGS_DATA)];
  
  const tabs = categories.map(cat => `
    <button 
      class="category-tab ${state.selectedCategory === cat ? 'active' : ''}"
      data-category="${cat}"
    >
      ${cat}
    </button>
  `).join('');
  
  return `<div class="category-tabs">${tabs}</div>`;
}

function renderSelectedTags() {
  const tags = state.selectedTags.map(tag => `
    <span class="tag-item selected" data-tag="${tag.name}" data-action="remove">
      <span class="tag-icon">${tag.icon}</span>
      ${tag.name}
      <span style="margin-left: 4px;">✕</span>
    </span>
  `).join('');
  
  return `
    <div class="tags-section selected-section">
      <h2>Selected Tags (${state.selectedTags.length})</h2>
      <div class="tags-grid">${tags}</div>
    </div>
  `;
}

function renderTagsGrid() {
  let tagsToShow = [];
  
  // Get tags based on category filter
  if (state.selectedCategory === 'All') {
    Object.entries(TAGS_DATA).forEach(([category, tags]) => {
      tags.forEach(tag => {
        tagsToShow.push({ ...tag, category });
      });
    });
  } else {
    tagsToShow = (TAGS_DATA[state.selectedCategory] || []).map(tag => ({
      ...tag,
      category: state.selectedCategory
    }));
  }
  
  // Apply search filter
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    tagsToShow = tagsToShow.filter(tag => 
      tag.name.toLowerCase().includes(query) ||
      tag.category.toLowerCase().includes(query)
    );
  }
  
  // Filter out already selected tags
  const selectedNames = state.selectedTags.map(t => t.name);
  tagsToShow = tagsToShow.filter(tag => !selectedNames.includes(tag.name));
  
  if (tagsToShow.length === 0) {
    return `
      <div class="tags-section">
        <h2>Available Tags</h2>
        <p style="color: #666; text-align: center; padding: 20px;">
          ${state.searchQuery ? 'No tags match your search.' : 'All tags have been selected.'}
        </p>
      </div>
    `;
  }
  
  // Group by category if showing all
  if (state.selectedCategory === 'All') {
    const grouped = {};
    tagsToShow.forEach(tag => {
      if (!grouped[tag.category]) grouped[tag.category] = [];
      grouped[tag.category].push(tag);
    });
    
    return Object.entries(grouped).map(([category, tags]) => `
      <div class="tags-section">
        <h2>${category}</h2>
        <div class="tags-grid">
          ${tags.map(tag => renderTagItem(tag)).join('')}
        </div>
      </div>
    `).join('');
  }
  
  return `
    <div class="tags-section">
      <h2>${state.selectedCategory}</h2>
      <div class="tags-grid">
        ${tagsToShow.map(tag => renderTagItem(tag)).join('')}
      </div>
    </div>
  `;
}

function renderTagItem(tag) {
  return `
    <span class="tag-item" data-tag="${tag.name}" data-icon="${tag.icon}" data-action="add">
      <span class="tag-icon">${tag.icon}</span>
      ${tag.name}
    </span>
  `;
}

function renderAddTagSection() {
  const categoryOptions = Object.keys(TAGS_DATA)
    .map(cat => `<option value="${cat}">${cat}</option>`)
    .join('');
  
  return `
    <div class="add-tag-section">
      <h3>➕ Add Custom Tag</h3>
      <div class="add-tag-form">
        <input type="text" id="new-tag-name" placeholder="Tag name">
        <select id="new-tag-category">
          ${categoryOptions}
        </select>
        <button class="btn btn-secondary" id="add-custom-tag">Add</button>
      </div>
    </div>
  `;
}

function renderActions() {
  const hasSelection = state.selectedTags.length > 0;
  
  if (state.isPluginMode) {
    return `
      <div class="actions">
        <button class="btn btn-primary" id="insert-tags" ${!hasSelection ? 'disabled' : ''}>
          Insert Tags (${state.selectedTags.length})
        </button>
        <button class="btn btn-secondary" id="insert-close" ${!hasSelection ? 'disabled' : ''}>
          Insert & Close
        </button>
        <button class="btn btn-secondary" id="clear-selection" ${!hasSelection ? 'disabled' : ''}>
          Clear Selection
        </button>
      </div>
    `;
  }
  
  // App mode - different actions
  return `
    <div class="actions">
      <button class="btn btn-primary" id="copy-tags" ${!hasSelection ? 'disabled' : ''}>
        Copy Tags (${state.selectedTags.length})
      </button>
      <button class="btn btn-secondary" id="export-tags">
        Export All Tags
      </button>
      <button class="btn btn-secondary" id="clear-selection" ${!hasSelection ? 'disabled' : ''}>
        Clear Selection
      </button>
    </div>
  `;
}

// ============================================
// EVENT HANDLERS
// ============================================
function attachEventListeners() {
  // Search
  const searchInput = document.getElementById('search-input');
  searchInput?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    render();
  });
  
  // Category tabs
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      state.selectedCategory = tab.dataset.category;
      render();
    });
  });
  
  // Tag clicks
  document.querySelectorAll('.tag-item').forEach(tag => {
    tag.addEventListener('click', () => {
      const action = tag.dataset.action;
      const name = tag.dataset.tag;
      const icon = tag.dataset.icon || '🏷️';
      
      if (action === 'add') {
        state.selectedTags.push({ name, icon });
      } else if (action === 'remove') {
        state.selectedTags = state.selectedTags.filter(t => t.name !== name);
      }
      render();
    });
  });
  
  // Add custom tag
  document.getElementById('add-custom-tag')?.addEventListener('click', () => {
    const nameInput = document.getElementById('new-tag-name');
    const categorySelect = document.getElementById('new-tag-category');
    const name = nameInput.value.trim();
    const category = categorySelect.value;
    
    if (name) {
      // Add to selected tags
      state.selectedTags.push({ name, icon: '🏷️', category });
      nameInput.value = '';
      showToast(`Added "${name}" to selection`);
      render();
    }
  });
  
  // Action buttons
  document.getElementById('insert-tags')?.addEventListener('click', insertTags);
  document.getElementById('insert-close')?.addEventListener('click', insertTagsAndClose);
  document.getElementById('copy-tags')?.addEventListener('click', copyTags);
  document.getElementById('export-tags')?.addEventListener('click', exportTags);
  document.getElementById('clear-selection')?.addEventListener('click', clearSelection);
}

// ============================================
// ACTIONS
// ============================================
function insertTags() {
  if (!state.actions || state.selectedTags.length === 0) return;
  
  // Create metadata-style HTML for tags
  const tagsHtml = state.selectedTags
    .map(tag => `<span class="tag">${tag.name}</span>`)
    .join(' ');
  
  const html = `<p><strong>Tags:</strong> ${tagsHtml}</p>`;
  
  state.actions.sendHTML(html);
  showToast(`Inserted ${state.selectedTags.length} tags`);
}

function insertTagsAndClose() {
  insertTags();
  if (state.actions) {
    state.actions.closeLibrary();
  }
}

function copyTags() {
  const tagsText = state.selectedTags.map(t => t.name).join(', ');
  navigator.clipboard.writeText(tagsText).then(() => {
    showToast('Tags copied to clipboard!');
  });
}

function exportTags() {
  const exportData = JSON.stringify(TAGS_DATA, null, 2);
  const blob = new Blob([exportData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tags-export.json';
  a.click();
  
  URL.revokeObjectURL(url);
  showToast('Tags exported!');
}

function clearSelection() {
  state.selectedTags = [];
  render();
}

// ============================================
// UTILITIES
// ============================================
function showToast(message, isError = false) {
  // Remove existing toast
  document.querySelector('.toast')?.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : ''}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 3000);
}
