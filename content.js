const INTERESTS = [];
const THRESHOLD = 0.5; // Threshold for number of blurred videos
const API_URL = 'http://localhost:3000/api';

// Load user-defined interests from Chrome storage
chrome.storage.sync.get('keywords', (data) => {
    console.log('Loaded keywords from storage:', data.keywords);
    INTERESTS.push(...(data.keywords || []));
});

// Function to extract video titles
function getVideoTitles() {
    const titles = [];
    document.querySelectorAll('#video-title').forEach(titleElem => {
        titles.push(titleElem.textContent.trim());
    });
    console.log('Extracted video titles:', titles);
    return titles;
}

// Function to blur irrelevant videos
function blurIrrelevantVideos(titles, relevantData) {
    console.log('Blurring irrelevant videos. Relevant data:', relevantData);
    const videos = document.querySelectorAll('ytd-rich-item-renderer, ytd-video-renderer');
    videos.forEach(video => {
        if (!video) return;
        if(video.querySelector('#video-title') == null) return;
        const title = video.querySelector('#video-title').innerText;
        
        if (!relevantData.includes(title)) {
      
            video.style.filter = 'blur(10px)';
            console.log('Blurred video:', title);

        } else {
            video.style.filter = 'none';
            console.log('Unblurred video:', title);
        }
    });
}

// Send video titles to background.js for processing
function sendTitlesToBackground() {
    const titles = getVideoTitles();
    console.log('Sending titles to background:', titles);
    chrome.runtime.sendMessage({ type: 'TITLE_BATCH', titles }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError.message);
        } else {
            console.log('Message sent successfully');
        }
    });
    //send keyword to background.js
    chrome.runtime.sendMessage({ type: 'KEYWORD_BATCH', INTERESTS }, () => {
        if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError.message);
        } else {
            console.log('Message sent successfully');
        }
    });
}

// Show recommendations overlay
function showRecommendations(data) {
    console.log('Showing recommendations:', data);
    const overlay = document.createElement('div');
    overlay.id = 'recommendation-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.right = '0';
    overlay.style.width = '300px';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = '#fff';
    overlay.style.overflowY = 'scroll';
    overlay.style.zIndex = '10000';
    overlay.innerHTML = '<button id="close-overlay">Close</button>';

    const list = document.createElement('ul');
    data.items.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `https://www.youtube.com/watch?v=${item.id.videoId}`;
        a.textContent = item.snippet.title;
        li.appendChild(a);
        list.appendChild(li);
    });

    overlay.appendChild(list);
    document.body.appendChild(overlay);

    document.getElementById('close-overlay').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
}

// Check for blurred videos and show recommendations if needed
function checkAndShowRecommendations() {
    const titles = getVideoTitles();
    const blurredVideos = titles.filter((title, index) => {
        const videoElem = document.querySelectorAll('#video-title')[index].closest('.ytd-rich-grid-media');
        return videoElem && videoElem.style.filter === 'blur(10px)';
    });

    console.log('Number of blurred videos:', blurredVideos.length);
    if (blurredVideos.length / titles.length > THRESHOLD && INTERESTS.length > 0) {
        console.log('Threshold exceeded. Fetching recommendations...');
        fetch(`${API_URL}/youtube?query=${INTERESTS.join(',')}`)
            .then(response => response.json())
            .then(data => showRecommendations(data))
            .catch(error => console.error('Error fetching YouTube recommendations:', error));
    }
}

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message) => {
    console.log('Received message from background:', message);
    if (message.type === 'GEMINI_DATA') {
        const titles = getVideoTitles();
        blurIrrelevantVideos(titles, message.data); // message.data is an array of relevant titles
    }
    if (message.type === 'GEMINI_ERROR') {
        console.error('Gemini API error:', message.error);
        // Implement fallback mechanism if needed
    }
});

// Observe for new videos being loaded and re-check titles
let debounceTimeout;
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                console.log('New nodes added. Re-checking titles...');
                sendTitlesToBackground();
            }, 500); // Debounce interval
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

// Periodically check for recommendations
setInterval(checkAndShowRecommendations, 60000); // Check every minute
