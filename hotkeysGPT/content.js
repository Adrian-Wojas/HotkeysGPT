let hotkeyMappings = {};

async function loadMappings() {
  const result = await chrome.storage.sync.get(['hotkeyMappings']);
  if (result.hotkeyMappings) {
    hotkeyMappings = result.hotkeyMappings;
  }
}

function handleHotkeyPress(event) {
  const isCmdOrCtrl = event.metaKey || event.ctrlKey;
  
  if (isCmdOrCtrl && event.shiftKey) {
    const key = event.key.toLowerCase();
    
    if (hotkeyMappings.hasOwnProperty(key)) {
      event.preventDefault();
      
      const inputElement = document.querySelector('#prompt-textarea') || 
                          document.querySelector('[data-id="root"]') ||
                          document.querySelector('.ProseMirror');
      
      if (inputElement) {
        const existingText = inputElement.textContent || '';
        const spacer = existingText && !existingText.endsWith(' ') ? ' ' : '';
        
        inputElement.textContent = existingText + spacer + hotkeyMappings[key];
        
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
        inputElement.dispatchEvent(new Event('change', { bubbles: true }));
        inputElement.focus();
      }
    }
  }
}

// Initialize content script
loadMappings();
chrome.storage.onChanged.addListener((changes) => {
  if (changes.hotkeyMappings) {
    hotkeyMappings = changes.hotkeyMappings.newValue;
  }
});
document.addEventListener('keydown', handleHotkeyPress);