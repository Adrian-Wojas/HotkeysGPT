const DEFAULT_MAPPINGS = {
    'k': 'Keep it concise and straight to the point, answer in maximum two sentences.',
    'l': 'Elaborate on this, add more depth, and structure it with clear headings',
    'p': 'Proofread this text and correct any grammar, punctuation, and structural issues.'
  };
  
  class HotkeyManager {
    constructor() {
      this.hotkeyMappings = {};
      this.hasUnsavedChanges = false;
      this.container = document.getElementById('hotkey-container');
      this.saveStatus = document.getElementById('save-status');
      
      this.init();
    }
  
    async init() {
      await this.loadMappings();
      this.setupEventListeners();
    }
  
    async loadMappings() {
      const result = await chrome.storage.sync.get(['hotkeyMappings']);
      this.hotkeyMappings = result.hotkeyMappings || {...DEFAULT_MAPPINGS};
      this.renderHotkeys();
    }
  
    setupEventListeners() {
      document.getElementById('add-hotkey').addEventListener('click', () => {
        this.hotkeyMappings[''] = '';
        this.hasUnsavedChanges = true;
        this.renderHotkeys();
      });
  
      document.getElementById('save-changes').addEventListener('click', () => this.saveChanges());
  
      window.addEventListener('beforeunload', (e) => {
        if (this.hasUnsavedChanges) {
          e.preventDefault();
          e.returnValue = '';
        }
      });
    }
  
    createHotkeyRow(key, template) {
      const row = document.createElement('div');
      row.className = 'hotkey-row';
  
      const keyInput = this.createInput('key-input', key, 'Key', 1);
      const templateInput = this.createInput('template-input', template, 'Template text');
      const deleteBtn = this.createDeleteButton();
  
      this.setupRowEventListeners(keyInput, templateInput, deleteBtn, key);
  
      row.append(keyInput, templateInput, deleteBtn);
      return row;
    }
  
    createInput(className, value, placeholder, maxLength = null) {
      const input = document.createElement('input');
      input.className = className;
      input.value = value;
      input.placeholder = placeholder;
      input.type = 'text';
      if (maxLength) input.maxLength = maxLength;
      return input;
    }
  
    createDeleteButton() {
      const btn = document.createElement('button');
      btn.className = 'delete-btn';
      btn.innerHTML = '&times;';
      return btn;
    }
  
    setupRowEventListeners(keyInput, templateInput, deleteBtn, originalKey) {
      keyInput.addEventListener('input', (e) => {
        const newKey = e.target.value.toLowerCase();
        this.updateMapping(originalKey, newKey, templateInput.value);
        this.hasUnsavedChanges = true;
      });
  
      templateInput.addEventListener('input', (e) => {
        this.updateMapping(originalKey, keyInput.value.toLowerCase(), e.target.value);
        this.hasUnsavedChanges = true;
      });
  
      deleteBtn.addEventListener('click', () => {
        delete this.hotkeyMappings[originalKey];
        this.hasUnsavedChanges = true;
        this.renderHotkeys();
      });
    }
  
    updateMapping(oldKey, newKey, template) {
      if (oldKey !== newKey) {
        delete this.hotkeyMappings[oldKey];
      }
      if (newKey.trim()) {
        this.hotkeyMappings[newKey] = template;
      }
    }
  
    renderHotkeys() {
      this.container.innerHTML = '';
  
      if (Object.keys(this.hotkeyMappings).length === 0) {
        this.container.innerHTML = '<div class="empty-state">No hotkeys configured. Click "Add New Hotkey" to get started.</div>';
        return;
      }
  
      Object.entries(this.hotkeyMappings).forEach(([key, template]) => {
        this.container.appendChild(this.createHotkeyRow(key, template));
      });
    }
  
    async saveChanges() {
      const cleanMappings = {};
      Object.entries(this.hotkeyMappings).forEach(([key, template]) => {
        if (key.trim() && template.trim()) {
          cleanMappings[key.toLowerCase()] = template;
        }
      });
  
      await chrome.storage.sync.set({ hotkeyMappings: cleanMappings });
      this.hotkeyMappings = cleanMappings;
      this.hasUnsavedChanges = false;
      this.showSaveStatus();
      this.renderHotkeys();
    }
  
    showSaveStatus() {
      this.saveStatus.style.display = 'block';
      setTimeout(() => {
        this.saveStatus.style.display = 'none';
      }, 2000);
    }
  }
  
  // Initialize the manager
  new HotkeyManager();