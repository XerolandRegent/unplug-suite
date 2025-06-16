/**
 * File Name: content.js
 * File Path: /tools/chatgpt-scrubber/content.js
 * Description: Content script for ChatGPT Scrubber - Unplug Suite
 * Date Created: June 16, 2025
 * Date Last Updated: June 16, 2025
 * Version History: 1.0.2 - Improved deletion functionality and UI
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
  let archivesPanelOpen = false;
  
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
    
    // Special handling for connection check
    if (message.action === 'checkConnection') {
      sendResponse({
        connected: true,
        url: window.location.href,
        domain: window.location.hostname
      });
      return true;
    }
    
    switch (message.action) {
      case 'checkArchivesStatus':
        const status = checkArchivesStatus();
        sendResponse(status);
        break;
        
      case 'openArchivesPanel':
        // If the panel is already open, don't try to open it again
        if (archivesPanelOpen) {
          sendResponse({ success: true, alreadyOpen: true });
          return true;
        }
        
        openArchivesPanel()
          .then(() => {
            archivesPanelOpen = true;
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
          return true;
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
      archivesPanelOpen = true;
      const rows = archivesPanel.querySelectorAll('tbody > tr');
      return {
        archivesOpen: true,
        count: rows.length
      };
    }
    
    archivesPanelOpen = false;
    return {
      archivesOpen: false,
      count: 0
    };
  }
  
  /**
   * Open the archives panel
   */
  async function openArchivesPanel() {
    // Save current URL to detect if navigation happens
    const startingUrl = window.location.href;
    
    return new Promise((resolve, reject) => {
      // First check if already in settings
      if (window.location.href.includes("#settings")) {
        log("Already in settings");
        lookForArchivesButton();
        return;
      }
      
      // If we're on a specific conversation page, go to home first
      if (window.location.href.includes("/c/")) {
        // Click on the ChatGPT logo or home button to return to the main interface
        const homeButtons = [
          document.querySelector('a[href="/"]'),
          document.querySelector('[aria-label="Home"]'),
          document.querySelector('.logo')
        ];
        
        const homeButton = homeButtons.find(btn => btn !== null);
        
        if (homeButton) {
          log('Navigating to home first');
          homeButton.click();
          
          // Wait for navigation to complete
          setTimeout(() => {
            clickSettingsButton();
          }, 1500);
        } else {
          clickSettingsButton();
        }
      } else {
        clickSettingsButton();
      }
      
      function clickSettingsButton() {
        // Try to find settings navigation
        const settingsBtns = [
          document.querySelector('[aria-label="Settings"]'),
          document.querySelector('nav a[href="#settings"]'),
          document.querySelector('button[data-testid="SettingsButton"]'),
          document.querySelector('button[aria-label="Settings"]')
        ];
        
        let foundButton = settingsBtns.find(btn => btn !== null);
        
        // If no button found, try by text content
        if (!foundButton) {
          log("No settings button found by selector, trying by text");
          const allButtons = Array.from(document.querySelectorAll('button, a'));
          foundButton = allButtons.find(el => 
            el.textContent && el.textContent.toLowerCase().trim() === 'settings'
          );
        }
        
        if (!foundButton) {
          // Try one more method - looking for SVG icons that might be settings
          const svgParents = Array.from(document.querySelectorAll('button svg, a svg'));
          const potentialSettingsButtons = svgParents.map(svg => svg.closest('button') || svg.closest('a')).filter(btn => btn !== null);
          
          // Check for known common settings icon paths
          for (const btn of potentialSettingsButtons) {
            const pathData = btn.querySelector('path')?.getAttribute('d');
            if (pathData && (
              pathData.includes("M12 6V4m0 2a2") || // Common settings gear icon path
              pathData.includes("cog") ||
              btn.getAttribute('aria-label')?.toLowerCase().includes('setting')
            )) {
              foundButton = btn;
              break;
            }
          }
        }
        
        if (!foundButton) {
          reject(new Error('Settings button not found'));
          return;
        }
        
        log('Settings button found, clicking...');
        foundButton.click();
        
        // Wait for settings panel to open
        setTimeout(lookForArchivesButton, 1500);
      }
      
      function lookForArchivesButton() {
        // Check if we navigated away
        if (window.location.href !== startingUrl && !window.location.href.includes("#settings")) {
          log(`Navigation detected: ${window.location.href}`);
          reject(new Error('Page navigation occurred'));
          return;
        }
        
        log('Looking for archives button...');
        
        // Try multiple approaches to find the archives button
        const archiveButtons = [
          document.querySelector('button:has-text("Archived")'),
          document.querySelector('[data-testid="archived-chats-button"]')
        ];
        
        let archiveButton = archiveButtons.find(btn => btn !== null);
        
        // Text content search approach
        if (!archiveButton) {
          const allButtons = Array.from(document.querySelectorAll('button'));
          archiveButton = allButtons.find(button => {
            const text = button.textContent.toLowerCase();
            return text.includes('archive') || text.includes('archived chat');
          });
        }
        
        if (!archiveButton) {
          reject(new Error('Archived chats button not found'));
          return;
        }
        
        log('Archives button found, clicking...');
        archiveButton.click();
        
        // Check if archives panel opened
        setTimeout(() => {
          const archivesPanel = findArchivesPanel();
          
          if (archivesPanel) {
            archivesPanelOpen = true;
            log('Archives panel found');
            
            // Add our custom UI to the archives panel if it doesn't exist
            try {
              addCustomUIToPanel(archivesPanel);
            } catch (e) {
              log(`Error adding UI: ${e.message}`);
            }
            
            resolve();
          } else {
            archivesPanelOpen = false;
            reject(new Error('Archives panel did not open'));
          }
        }, 1500); // Increased timeout for panel to appear
      }
    });
  }
  
  /**
   * Find the archives panel element
   */
  function findArchivesPanel() {
    // Try various strategies to locate the archives panel
    
    // 1. Look for modal with data-testid
    const archivesModal = document.querySelector('[data-testid="modal-archived-conversations"]');
    if (archivesModal) {
      const table = archivesModal.querySelector('table');
      if (table) {
        return table;
      }
    }
    
    // 2. Look for dialog with archived chats heading
    const dialogs = document.querySelectorAll('[role="dialog"]');
    for (const dialog of dialogs) {
      const headings = dialog.querySelectorAll('h1, h2, h3, h4');
      for (const heading of headings) {
        if (heading.textContent.toLowerCase().includes('archive')) {
          const table = dialog.querySelector('table');
          if (table) {
            return table;
          }
          // If no table but we found the heading, return a container element
          return dialog.querySelector('.overflow-y-auto') || dialog;
        }
      }
    }
    
    // 3. Direct search for table in modals or dialogs
    const modals = document.querySelectorAll('.modal, [role="dialog"]');
    for (const modal of modals) {
      if (modal.textContent.toLowerCase().includes('archive')) {
        const table = modal.querySelector('table');
        if (table) {
          return table;
        }
        // Return container if no table
        return modal.querySelector('.overflow-y-auto') || modal;
      }
    }
    
    return null;
  }
  
  /**
   * Add custom UI elements to the archives panel
   */
  function addCustomUIToPanel(panel) {
    // Only add UI if it doesn't already exist
    if (panel.querySelector('.unplug-scrubber-ui')) {
      return;
    }
    
    // Find a good insertion point - the title area
    const dialog = panel.closest('[role="dialog"]');
    if (!dialog) return;
    
    const titleArea = dialog.querySelector('h2') || dialog.querySelector('.modal-header');
    if (!titleArea) return;
    
    // Create a container that fits the ChatGPT interface
    const container = document.createElement('div');
    container.className = 'unplug-scrubber-ui';
    container.style.marginTop = '10px';
    container.style.marginBottom = '15px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'space-between';
    container.style.padding = '0 8px';
    
    // Create a more professional badge
    const badge = document.createElement('div');
    badge.className = 'unplug-badge';
    badge.textContent = 'ChatGPT Scrubber';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = '500';
    badge.style.color = '#8e8ea0'; // ChatGPT muted text color
    badge.style.display = 'flex';
    badge.style.alignItems = 'center';
    badge.style.gap = '6px';
    
    // Add a small icon
    const icon = document.createElement('span');
    icon.innerHTML = '🧹'; // Broom emoji
    icon.style.fontSize = '14px';
    
    badge.prepend(icon);
    
    // Position the badge to avoid the ChatGPT logo
    badge.style.position = 'relative';
    badge.style.left = '24px'; // Move right to avoid overlap
    
    // Insert the badge below the title
    titleArea.parentNode.insertBefore(container, titleArea.nextSibling);
    container.appendChild(badge);
    
    // Add delete all button
    if (!isDeleting) {
      const deleteAllButton = document.createElement('button');
      deleteAllButton.className = 'unplug-delete-all-btn';
      deleteAllButton.textContent = 'Delete All';
      deleteAllButton.style.backgroundColor = '#8e8ea0'; // Match ChatGPT's style
      deleteAllButton.style.color = 'white';
      deleteAllButton.style.border = 'none';
      deleteAllButton.style.borderRadius = '4px';
      deleteAllButton.style.padding = '4px 10px';
      deleteAllButton.style.fontSize = '12px';
      deleteAllButton.style.fontWeight = '500';
      deleteAllButton.style.cursor = 'pointer';
      deleteAllButton.style.transition = 'background-color 0.2s';
      
      // Hover effect
      deleteAllButton.onmouseover = () => {
        deleteAllButton.style.backgroundColor = '#ef4444';
      };
      deleteAllButton.onmouseout = () => {
        deleteAllButton.style.backgroundColor = '#8e8ea0';
      };
      
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
   * Delete all archives with enhanced logging
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
        addLogEntry('Archives panel not found - try opening it first');
        throw new Error('Archives panel not found');
      }
      
      // Log DOM structure to help debugging
      log('Archives panel structure:');
      log(archivesPanel.outerHTML.substring(0, 500) + '...');
      
      // Count total archives
      const rows = archivesPanel.querySelectorAll('tbody > tr');
      totalArchives = rows.length;
      
      if (totalArchives === 0) {
        addLogEntry('No archives found to delete');
        return { deleted: 0, total: 0 };
      }
      
      addLogEntry(`Starting deletion of ${totalArchives} archived conversations`);
      
      // Detailed logging of found rows
      log(`Found ${rows.length} rows in the table`);
      if (rows.length > 0) {
        log(`First row HTML: ${rows[0].outerHTML}`);
      }
      
      // Start deletion process
      const signal = abortController.signal;
      
      // Set up abort handler
      signal.addEventListener('abort', () => {
        addLogEntry('Deletion aborted');
        isDeleting = false;
      });
      
      // Find all delete buttons up front to see what we're working with
      log('Looking for delete buttons...');
      let foundButtons = [];
      
      // Try multiple strategies
      const buttonsByAriaLabel = archivesPanel.querySelectorAll('button[aria-label="Delete conversation"]');
      log(`Found ${buttonsByAriaLabel.length} buttons by aria-label`);
      
      const buttonsByIcon = Array.from(archivesPanel.querySelectorAll('button')).filter(btn => 
        btn.innerHTML.includes('trash') || btn.innerHTML.includes('delete')
      );
      log(`Found ${buttonsByIcon.length} buttons by icon content`);
      
      // Use the most reliable strategy
      foundButtons = buttonsByAriaLabel.length > 0 ? buttonsByAriaLabel : buttonsByIcon;
      
      if (foundButtons.length === 0) {
        // Try looking at the rightmost buttons in each row
        const rows = archivesPanel.querySelectorAll('tbody > tr');
        foundButtons = Array.from(rows).map(row => {
          const buttons = row.querySelectorAll('button');
          return buttons[buttons.length - 1]; // Get the last button
        }).filter(btn => btn !== undefined);
        
        log(`Found ${foundButtons.length} buttons by row position`);
      }
      
      // Delete archives one by one
      for (let i = 0; i < foundButtons.length && isDeleting && !signal.aborted; i++) {
        const button = foundButtons[i];
        
        log(`Attempting to delete archive ${i+1}/${foundButtons.length}`);
        log(`Button HTML: ${button.outerHTML}`);
        
        const success = await deleteConversation(button, options);
        
        if (success) {
          deletedCount++;
          updateProgress(deletedCount, totalArchives, false);
          addLogEntry(`Deleted ${deletedCount}/${totalArchives} archives`);
        } else {
          addLogEntry(`Failed to delete archive ${i+1}`);
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
        // First, check if the button is actually visible
        const buttonRect = deleteButton.getBoundingClientRect();
        if (buttonRect.width === 0 || buttonRect.height === 0) {
          log('Delete button not visible');
          resolve(false);
          return;
        }

        // Get the icon buttons in the row
        const row = deleteButton.closest('tr');
        if (!row) {
          log('Could not find parent row');
          resolve(false);
          return;
        }
        
        // Try to find the delete icon - it's likely the last button in the row
        const iconButtons = row.querySelectorAll('button');
        const trashButton = iconButtons[iconButtons.length - 1]; // Usually the last one is delete
        
        if (trashButton) {
          log('Found trash button, clicking...');
          trashButton.click();
        } else {
          // Fallback to the original button
          log('Using original delete button');
          deleteButton.click();
        }
        
        log('Delete button clicked');
        
        // Wait for confirmation dialog
        await sleep(config.confirmButtonDelay);
        
        // Find confirm button using multiple approaches
        let confirmButton = null;
        
        // First try by text content - most reliable
        const allButtons = Array.from(document.querySelectorAll('button'));
        confirmButton = allButtons.find(btn => {
          const text = (btn.textContent || '').toLowerCase();
          return text.includes('delete') && !text.includes('cancel');
        });
        
        // Then try by class
        if (!confirmButton) {
          confirmButton = document.querySelector('button.btn-danger, button.danger, button[data-testid="confirm-delete-button"]');
        }
        
        // Finally try by color
        if (!confirmButton) {
          confirmButton = Array.from(document.querySelectorAll('button')).find(btn => {
            const style = window.getComputedStyle(btn);
            return style.backgroundColor.includes('rgb(239, 68, 68)') || // Red color
                  style.backgroundColor.includes('rgb(220, 38, 38)') ||
                  style.color.includes('rgb(239, 68, 68)');
          });
        }
        
        if (confirmButton) {
          log('Confirm button found, clicking...');
          confirmButton.click();
          
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
  
  // Notify the background script that we're running
  browser.runtime.sendMessage({
    action: 'contentScriptLoaded',
    url: window.location.href
  }).catch(error => {
    console.error("Error sending message to background:", error);
  });
  
  // Log initialization
  addLogEntry('ChatGPT Scrubber initialized');
})();