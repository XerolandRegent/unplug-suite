/**
 * File Name: popup.js
 * File Path: /tools/chatgpt-scrubber/popup/popup.js
 * Description: Popup script for ChatGPT Scrubber - Unplug Suite
 * Date Created: June 16, 2025
 * Date Last Updated: June 16, 2025
 * Version History: 1.0 - Initial version
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log("Popup opened, checking connection to ChatGPT");
  
  // Elements
  const connectionStatus = document.getElementById('connection-status');
  const statusMessage = document.getElementById('status-message');
  const archivesCount = document.getElementById('archives-count');
  const deletedCount = document.getElementById('deleted-count');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');
  const openArchivesBtn = document.getElementById('open-archives-btn');
  const deleteAllBtn = document.getElementById('delete-all-btn');
  const autoOpenOption = document.getElementById('auto-open-option');
  const confirmationOption = document.getElementById('confirmation-option');
  const logEntries = document.getElementById('log-entries');

  // State
  let isConnected = false;
  let totalArchives = 0;
  let deleteProgress = 0;
  let isDeleting = false;

  // Load saved options
  browser.storage.local.get(['autoOpenArchives', 'confirmBeforeDelete']).then((result) => {
    autoOpenOption.checked = result.autoOpenArchives || false;
    confirmationOption.checked = result.confirmBeforeDelete !== false; // Default to true
  });

  // Save options when changed
  autoOpenOption.addEventListener('change', () => {
    browser.storage.local.set({ autoOpenArchives: autoOpenOption.checked });
  });

  confirmationOption.addEventListener('change', () => {
    browser.storage.local.set({ confirmBeforeDelete: confirmationOption.checked });
  });

  // Add log entry to UI
  function addLogEntry(message) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = message;
    
    // Add to the top of the log
    if (logEntries.firstChild) {
      logEntries.insertBefore(entry, logEntries.firstChild);
    } else {
      logEntries.appendChild(entry);
    }
    
    // Limit entries to prevent overflow
    while (logEntries.children.length > 20) {
      logEntries.removeChild(logEntries.lastChild);
    }
  }

// Update this function in your popup.js
function checkConnection() {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const currentTab = tabs[0];
    if (!currentTab) return;

    console.log("Current tab URL:", currentTab.url);
    
    // Only proceed if we're on a ChatGPT page
    const url = new URL(currentTab.url);
    if (url.hostname !== 'chat.openai.com' && url.hostname !== 'chatgpt.com') {
      isConnected = false;
      connectionStatus.classList.add('disconnected');
      connectionStatus.classList.remove('connected');
      connectionStatus.querySelector('.status-text').textContent = 'Disconnected';
      statusMessage.textContent = 'Open ChatGPT to use this extension';
      deleteAllBtn.disabled = true;
      addLogEntry('Please navigate to chat.openai.com or chatgpt.com');
      return;
    }
    
    // Try direct connection check
    browser.tabs.sendMessage(currentTab.id, { action: 'checkConnection' })
      .then(response => {
        if (response && response.connected) {
          isConnected = true;
          connectionStatus.classList.remove('disconnected');
          connectionStatus.classList.add('connected');
          connectionStatus.querySelector('.status-text').textContent = 'Connected';
          statusMessage.textContent = 'Connected to ' + response.domain;
          
          // Check if we're already looking at archives
          browser.tabs.sendMessage(currentTab.id, { action: 'checkArchivesStatus' })
            .then(response => {
              if (response && response.archivesOpen) {
                archivesCount.textContent = response.count || '0';
                totalArchives = response.count || 0;
                deleteAllBtn.disabled = totalArchives === 0;
                statusMessage.textContent = 'Archives panel detected';
                addLogEntry(`Found ${totalArchives} archived conversations`);
              }
              
              // Get log entries from content script
              return browser.tabs.sendMessage(currentTab.id, { action: 'getLogEntries' });
            })
            .then(response => {
              if (response && response.entries) {
                // Add entries from newest to oldest
                const entries = response.entries.slice().reverse();
                entries.forEach(entry => {
                  addLogEntry(entry);
                });
              }
            })
            .catch(error => {
              console.error('Error checking archives status:', error);
            });
          
          // Auto-open archives ONLY if configured and not already open
          browser.storage.local.get(['autoOpenArchives']).then((result) => {
            if (result.autoOpenArchives) {
              // First check if archives are already open
              browser.tabs.sendMessage(currentTab.id, { action: 'checkArchivesStatus' })
                .then(response => {
                  if (!response || !response.archivesOpen) {
                    openArchivesBtn.click();
                  }
                });
            }
          });
        }
      })
      .catch(error => {
        console.error("Connection error:", error);
        statusMessage.textContent = 'Error connecting to page';
        addLogEntry('Cannot connect to ChatGPT page. Try reloading.');
      });
  });
}
  
  // Check archives status
  function checkArchivesStatus(tabId) {
    browser.tabs.sendMessage(tabId, { action: 'checkArchivesStatus' })
      .then(response => {
        if (response && response.archivesOpen) {
          archivesCount.textContent = response.count || '0';
          totalArchives = response.count || 0;
          deleteAllBtn.disabled = totalArchives === 0;
          statusMessage.textContent = 'Archives panel detected';
          addLogEntry(`Found ${totalArchives} archived conversations`);
        }
        
        // Get log entries from content script
        return browser.tabs.sendMessage(tabId, { action: 'getLogEntries' });
      })
      .then(response => {
        if (response && response.entries) {
          // Clear existing entries
          logEntries.innerHTML = '';
          
          // Add entries from newest to oldest
          const entries = response.entries.slice().reverse();
          entries.forEach(entry => {
            addLogEntry(entry);
          });
        }
      })
      .catch(error => {
        console.error('Error checking status:', error);
      });
  }

  // Open the archives panel
  openArchivesBtn.addEventListener('click', () => {
    if (!isConnected) return;
    
    statusMessage.textContent = 'Opening archives panel...';
    addLogEntry('Opening archives panel...');
    
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      browser.tabs.sendMessage(tabs[0].id, { action: 'openArchivesPanel' })
        .then(response => {
          if (response && response.success) {
            statusMessage.textContent = 'Archives panel opened';
            addLogEntry('Archives panel opened successfully');
            
            // Recheck after a short delay to get count
            setTimeout(() => {
              browser.tabs.sendMessage(tabs[0].id, { action: 'checkArchivesStatus' })
                .then(response => {
                  if (response && response.archivesOpen) {
                    archivesCount.textContent = response.count || '0';
                    totalArchives = response.count || 0;
                    deleteAllBtn.disabled = totalArchives === 0;
                    addLogEntry(`Found ${totalArchives} archived conversations`);
                  }
                });
            }, 1000);
          } else {
            statusMessage.textContent = 'Failed to open archives panel';
            addLogEntry(`Error: ${response?.error || 'Failed to open archives panel'}`);
          }
        })
        .catch(error => {
          console.error('Error opening archives panel:', error);
          statusMessage.textContent = 'Error opening archives panel';
          addLogEntry(`Error: ${error.message}`);
        });
    });
  });

  // Delete all archives
  deleteAllBtn.addEventListener('click', () => {
    if (!isConnected || totalArchives === 0 || isDeleting) return;
    
    const confirmDelete = !confirmationOption.checked || 
      confirm(`Are you sure you want to delete all ${totalArchives} archived conversations? This action cannot be undone.`);
    
    if (!confirmDelete) {
      addLogEntry('Deletion cancelled by user');
      return;
    }
    
    isDeleting = true;
    statusMessage.textContent = 'Deleting archives...';
    deleteAllBtn.disabled = true;
    openArchivesBtn.disabled = true;
    addLogEntry(`Starting deletion of ${totalArchives} archives...`);
    
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      // Start the deletion process
      browser.tabs.sendMessage(tabs[0].id, { 
        action: 'deleteAllArchives',
        options: {
          confirmBeforeDelete: false // We've already confirmed
        }
      });
      
      // Update UI
      updateProgressBar(0);
    });
  });

  // Listen for messages from content script
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === 'updateDeleteProgress') {
      const { current, total, completed } = message;
      updateProgressBar(current / total * 100);
      deletedCount.textContent = current;
      
      if (completed) {
        statusMessage.textContent = 'Deletion completed';
        addLogEntry(`Deletion completed: ${current}/${total} archives deleted`);
        isDeleting = false;
        
        setTimeout(() => {
          statusMessage.textContent = 'Ready to scrub archives';
          archivesCount.textContent = '0';
          totalArchives = 0;
          deleteAllBtn.disabled = true;
          openArchivesBtn.disabled = false;
        }, 2000);
      }
    } else if (message.action === 'logUpdate') {
      addLogEntry(message.entry);
    }
  });

  // Update progress bar
  function updateProgressBar(percent) {
    progressBar.style.width = `${percent}%`;
    progressText.textContent = `${Math.round(percent)}%`;
  }

  // Initial connection check
  checkConnection();
  
  // Initialize progress bar
  updateProgressBar(0);
  
  // Add initial log entry
  addLogEntry('Extension popup opened');
});