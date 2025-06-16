/**
 * File Name: content.js
 * File Path: /tools/chatgpt-scrubber/content.js
 * Description: Content script for ChatGPT Scrubber - Unplug Suite
 * Date Created: June 16, 2025
 * Date Last Updated: June 16, 2025
 * Version History: 1.0 - Initial version
 */

(function() {
  'use strict';
  
  // Configuration
  const config = {
    deleteButtonDelay: 500,    // Time between delete operations
    confirmButtonDelay: 800,   // Time to wait for confirm dialog
    waitBetweenDeletes: 1200,  // Time to wait after each delete
    maxRetries: 3,             // Maximum retries for failed operations
    debug: true                // Enable console logging
  };
  
  // Logging function
  const log = (message) => {
    if (config.debug) {
      console.log(`[Unplug ChatGPT Scrubber] ${message}`);
    }
  };
  
  // Initialize state
  let isDeleting = false;
  let deletedCount = 0;
  let totalArchives = 0;
  let abortController = null;
  let logEntries = [];
  
  // Add log entry and notify popup
  function addLogEntry(message) {
    const timestamp = new Date().toTimeString().split(' ')[0];
    const entry = `${timestamp} - ${message}`;
    logEntries.push(entry);
    
    // Keep only the last 50 entries
    if (logEntries.length > 50) {
      logEntries.shift();
    }
    
    // Send to popup if connected
    browser.runtime.sendMessage({
      action: 'logUpdate',
      entry: entry
    }).catch(() => {
      // Ignore errors when popup is not open
    });
    
    // Log to console
    log(message);
  }
  
  // Event listener for messages from popup
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log(`Received message: ${JSON.stringify(message)}`);
    
    switch (message.action) {
      case 'checkArchivesStatus':
        const status = checkArchivesStatus();
        sendResponse(status);
        break;
        
      case 'openArchivesPanel':
        openArchivesPanel()
          .then(() => {
            addLogEntry('Archives panel opened');
            sendResponse({ success: true });
          })
          .catch((error) => {
            addLogEntry(`Error opening archives: ${error.message}`);
            sendResponse({ success: false, error: error.message });
          });
        break;
        
      case 'deleteAllArchives':
        if (isDeleting) {
          sendResponse({ success: false, error: 'Deletion already in progress' });
          return;
        }
        
        const options = message.options || {};
        deleteAllArchives(options)
          .then((result) => {
            addLogEntry(`Deletion completed: ${result.deleted}/${result.total} archives deleted`);
            sendResponse({ success: true, result });
          })
          .catch((error) => {
            addLogEntry(`Error deleting archives: ${error.message}`);
            sendResponse({ success: false, error: error.message });
          });
        break;
        
      case 'abortDeletion':
        if (abortController) {
          abortController.abort();
          isDeleting = false;
          addLogEntry('Deletion process aborted by user');
          sendResponse({ success: true });
        } else {
          sendResponse({ success: false, error: 'No deletion in progress' });
        }
        break;
        
      case 'getLogEntries':
        sendResponse({ entries: logEntries });
        break;
    }
    
    // Return true to indicate that the response will be sent asynchronously
    return true;
  });
  
  /**
   * Check if archives panel is open and count archives
   */
  function checkArchivesStatus() {
    const archivesPanel = findArchivesPanel();
    
    if (archivesPanel) {
      const rows = archivesPanel.querySelectorAll('tbody > tr');
      return {
        archivesOpen: true,
        count: rows.length
      };
    }
    
    return {
      archivesOpen: false,
      count: 0
    };
  }
  
  /**
   * Open the archives panel
   */
  async function openArchivesPanel() {
    return new Promise((resolve, reject) => {
      // Try to find the settings button
      const settingsButton = document.querySelector('a[href="#settings"]');
      
      if (!settingsButton) {
        reject(new Error('Settings button not found'));
        return;
      }
      
      // Click settings
      settingsButton.click();
      log('Settings clicked');
      
      // Wait for settings panel to open
      setTimeout(() => {
        // Look for archived chats button
        const archivedChatsButton = Array.from(document.querySelectorAll('button')).find(
          button => button.textContent.includes('Archived chats')
        );
        
        if (!archivedChatsButton) {
          reject(new Error('Archived chats button not found'));
          return;
        }
        
        // Click archived chats
        archivedChatsButton.click();
        log('Archived chats clicked');
        
        // Check if archives panel opened
        setTimeout(() => {
          const archivesPanel = findArchivesPanel();
          
          if (archivesPanel) {
            // Add our custom UI to the archives panel if it doesn't exist
            addCustomUIToPanel(archivesPanel);
            resolve();
          } else {
            reject(new Error('Archives panel did not open'));
          }
        }, 1000);
      }, 1000);
    });
  }
  
  /**
   * Add custom UI elements to the archives panel
   */
  function addCustomUIToPanel(panel) {
    // Only add UI if it doesn't already exist
    if (panel.querySelector('.unplug-scrubber-ui')) {
      return;
    }
    
    // Find the header element
    const header = panel.closest('[role="dialog"]').querySelector('h2');
    
    if (!header) {
      return;
    }
    
    // Create the container
    const container = document.createElement('div');
    container.className = 'unplug-scrubber-ui';
    container.style.marginTop = '12px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'space-between';
    
    // Create the badge
    const badge = document.createElement('div');
    badge.className = 'unplug-badge';
    badge.textContent = 'UNPLUG SUITE';
    badge.style.backgroundColor = '#6366f1';
    badge.style.color = 'white';
    badge.style.fontSize = '10px';
    badge.style.fontWeight = 'bold';
    badge.style.padding = '2px 6px';
    badge.style.borderRadius = '4px';
    badge.style.display = 'inline-block';
    
    // Add tooltip to badge
    badge.title = 'ChatGPT Scrubber by Unplug Suite';
    
    // Insert the badge after the header
    header.parentNode.insertBefore(container, header.nextSibling);
    container.appendChild(badge);
    
    // Add custom delete button if we're not in the middle of deletion
    if (!isDeleting) {
      const deleteAllButton = document.createElement('button');
      deleteAllButton.className = 'unplug-delete-all-btn';
      deleteAllButton.textContent = 'Delete All';
      deleteAllButton.style.backgroundColor = '#ef4444';
      deleteAllButton.style.color = 'white';
      deleteAllButton.style.border = 'none';
      deleteAllButton.style.borderRadius = '4px';
      deleteAllButton.style.padding = '4px 8px';
      deleteAllButton.style.fontSize = '12px';
      deleteAllButton.style.fontWeight = 'bold';
      deleteAllButton.style.cursor = 'pointer';
      
      deleteAllButton.addEventListener('click', () => {
        browser.storage.local.get(['confirmBeforeDelete']).then((result) => {
          const shouldConfirm = result.confirmBeforeDelete !== false;
          
          if (!shouldConfirm || confirm('Are you sure you want to delete all archived conversations? This action cannot be undone.')) {
            deleteAllArchives();
          }
        });
      });
      
      container.appendChild(deleteAllButton);
    }
  }
  
  /**
   * Find the archives panel element
   */
  function findArchivesPanel() {
    // Find the archives panel by looking for the heading
    const archivedChatsHeading = Array.from(document.querySelectorAll('h2')).find(
      heading => heading.textContent.includes('Archived Chats')
    );
    
    if (!archivedChatsHeading) {
      return null;
    }
    
    // Get the table in the same modal
    const modal = archivedChatsHeading.closest('[role="dialog"]');
    
    if (!modal) {
      return null;
    }
    
    const table = modal.querySelector('table');
    return table;
  }
  
  /**
   * Delete all archives
   */
  async function deleteAllArchives(options = {}) {
    if (isDeleting) {
      throw new Error('Deletion already in progress');
    }
    
    // Initialize state
    isDeleting = true;
    deletedCount = 0;
    abortController = new AbortController();
    
    try {
      // Find archives panel
      const archivesPanel = findArchivesPanel();
      
      if (!archivesPanel) {
        throw new Error('Archives panel not found');
      }
      
      // Count total archives
      const rows = archivesPanel.querySelectorAll('tbody > tr');
      totalArchives = rows.length;
      
      if (totalArchives === 0) {
        addLogEntry('No archives found to delete');
        return { deleted: 0, total: 0 };
      }
      
      addLogEntry(`Starting deletion of ${totalArchives} archived conversations`);
      
      // Start deletion process
      const signal = abortController.signal;
      
      // Set up abort handler
      signal.addEventListener('abort', () => {
        addLogEntry('Deletion aborted');
        isDeleting = false;
      });
      
      // Delete archives one by one
      while (isDeleting && !signal.aborted) {
        // Get all delete buttons (they change on each iteration)
        const archivesPanel = findArchivesPanel();
        
        if (!archivesPanel) {
          throw new Error('Archives panel closed unexpectedly');
        }
        
        const deleteButtons = archivesPanel.querySelectorAll('button[aria-label="Delete conversation"]');
        
        if (deleteButtons.length === 0) {
          addLogEntry('No more delete buttons found');
          break;
        }
        
        // Always use the first button since the DOM refreshes after each deletion
        const success = await deleteConversation(deleteButtons[0], options);
        
        if (success) {
          deletedCount++;
          updateProgress(deletedCount, totalArchives, false);
          addLogEntry(`Deleted ${deletedCount}/${totalArchives} archives`);
        } else {
          addLogEntry(`Failed to delete archive ${deletedCount + 1}`);
        }
        
        // Check if we've deleted all archives
        if (deletedCount >= totalArchives) {
          break;
        }
        
        // Wait between deletions
        await sleep(config.waitBetweenDeletes);
      }
      
      addLogEntry(`Deletion completed: ${deletedCount}/${totalArchives} archives deleted`);
      updateProgress(deletedCount, totalArchives, true);
      
      return {
        deleted: deletedCount,
        total: totalArchives
      };
    } catch (error) {
      addLogEntry(`Error during deletion: ${error.message}`);
      throw error;
    } finally {
      isDeleting = false;
      abortController = null;
    }
  }
  
  /**
   * Delete a single conversation
   */
  async function deleteConversation(deleteButton, options = {}) {
    return new Promise(async (resolve) => {
      try {
        // Click the delete button
        deleteButton.click();
        log('Delete button clicked');
        
        // Wait for confirmation dialog
        await sleep(config.confirmButtonDelay);
        
        // Find and click the confirm button
        const confirmButtons = document.querySelectorAll('button.btn.relative.btn-danger');
        
        if (confirmButtons.length > 0) {
          log('Confirm button found');
          confirmButtons[0].click();
          log('Confirm button clicked');
          
          // Wait for deletion to complete
          await sleep(config.waitBetweenDeletes);
          resolve(true);
        } else {
          log('Confirm button not found');
          resolve(false);
        }
      } catch (error) {
        log(`Error deleting conversation: ${error.message}`);
        resolve(false);
      }
    });
  }
  
  /**
   * Update deletion progress
   */
  function updateProgress(current, total, completed = false) {
    browser.runtime.sendMessage({
      action: 'updateDeleteProgress',
      current,
      total,
      completed
    }).catch(() => {
      // Ignore errors when popup is not open
    });
  }
  
  /**
   * Sleep function
   */
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Log initialization
  addLogEntry('ChatGPT Scrubber initialized');
})();