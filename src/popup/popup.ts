// Popup script for EMR Parser Extension
import { SimpleUniversalParser } from '../lib/simple-universal-parser';

document.addEventListener('DOMContentLoaded', function() {
  const captureButton = document.getElementById('capture-btn');
  const statusDiv = document.getElementById('status');
  const resultDiv = document.getElementById('result');

  if (captureButton) {
    captureButton.addEventListener('click', async () => {
      try {
        // Get the active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab.id) {
          showStatus('No active tab found', 'error');
          return;
        }

        showStatus('Capturing patient data...', 'info');

        // Execute content script to capture data
        const result = await chrome.tabs.sendMessage(tab.id, { action: 'capture' });
        
        if (result && result.success) {
          showStatus('Data captured successfully!', 'success');
          displayResult(result.data);
        } else {
          showStatus('Failed to capture data', 'error');
        }
      } catch (error) {
        console.error('Capture error:', error);
        showStatus('Error: ' + (error as Error).message, 'error');
      }
    });
  }

  function showStatus(message: string, type: 'info' | 'success' | 'error') {
    if (statusDiv) {
      statusDiv.textContent = message;
      statusDiv.className = `status ${type}`;
    }
  }

  function displayResult(data: any) {
    if (resultDiv) {
      resultDiv.innerHTML = `
        <h3>Captured Data:</h3>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `;
    }
  }
}); 