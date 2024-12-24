const API_URL = 'http://localhost:3000'; // URL of your proxy server
const BATCH_SIZE = 10; // Number of titles to batch in one API request
let pendingRequests = [];
let keywords = [];  // Store user-defined keywords

// Send a batch request to the server
function sendBatchRequest(titles, keywords) {
    console.log('Sending batch request with titles:', titles);

    // Construct the body for the batch prediction request
    const requestBody = {
        titles,
        keywords
    };

    fetch(`${API_URL}/filter-videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody) // Use the constructed requestBody
    })
    .then(response => response.json())
    .then(data => {
        console.log('Received data from Gemini API:', data);
        // if the response is yes, then push the data into new array
        const relevantData = [];
        data.forEach((result) => {
            if (result.relevance === 'yes') {
                relevantData.push(result.title);
            }
        });

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'GEMINI_DATA', data: relevantData });
            }
        });
        
    })
    .catch(error => {
        console.error('Error with Gemini API request:', error);
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id,{ type: 'GEMINI_ERROR', error: error.message });
            }
        });
    });
}

// Process batches from the pending requests queue
function processPendingRequests() {
    while (pendingRequests.length > 0) {
        const titles = pendingRequests.splice(0, BATCH_SIZE).flat(); // Collect up to BATCH_SIZE
        if (titles.length > 0) sendBatchRequest(titles, keywords);
    }
}

// Add title batch to pending requests
console.log('Initializing message listener in background.js');
chrome.runtime.onMessage.addListener((message) => {
    console.log('Received message:', message);
    if (message.type === 'TITLE_BATCH') {
        pendingRequests.push(...message.titles.map(title => [title])); // Each title as its own batch
        if (pendingRequests.length >= BATCH_SIZE) {
            processPendingRequests();
        }
    }
    if (message.type === 'CLEAR_REQUESTS') {
        console.log('Clearing pending requests');
        pendingRequests = [];
    }
    if (message.type === 'KEYWORD_BATCH') {
        keywords = message.INTERESTS;
    }
});

// Set up dynamic rule for blocking
chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    const ruleId = 1;
    if (!existingRules.find(rule => rule.id === ruleId)) { // Add rule only if it doesn’t exist
        chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [
                {
                    id: ruleId,
                    priority: 1,
                    action: { type: 'block' },
                    condition: {
                        urlFilter: "*://example.com/*",
                        resourceTypes: ["main_frame"]
                    }
                }
            ],
            removeRuleIds: [] // Avoids removing anything unexpectedly
        }, () => {
            console.log('Dynamic rule added');
        });
    } else {
        console.log('Dynamic rule already exists');
    }
});

// Periodic processing of any remaining pending requests
setInterval(() => {
    if (pendingRequests.length > 0) {
        console.log('Processing remaining pending requests');
        processPendingRequests();
    }
}, 10000); // Process every 10 seconds
