document.addEventListener('DOMContentLoaded', () => {
    const keywordInput = document.getElementById('keyword-input');
    const addKeywordBtn = document.getElementById('add-keyword-btn');
    const keywordsList = document.getElementById('keywords-list');
    const saveSettingsBtn = document.getElementById('save-settings-btn');

    // Load keywords from storage on popup open
    chrome.storage.sync.get('keywords', (data) => {
        const keywords = data.keywords || [];
        keywords.forEach(addKeywordToList);
    });

    // Add new keyword to list and storage
    addKeywordBtn.addEventListener('click', () => {
        const keyword = keywordInput.value.trim();
        if (keyword) {
            addKeywordToList(keyword);
            updateKeywordsInStorage(keyword);
            keywordInput.value = ''; // Clear the input after adding
        }
    });

    // Add keyword to the display list in popup
    function addKeywordToList(keyword) {
        const listItem = document.createElement('li');
        listItem.textContent = keyword;

        // Add a delete button for each keyword
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'X';
        deleteBtn.classList.add('delete-keyword-btn');
        deleteBtn.addEventListener('click', () => {
            listItem.remove();
            removeKeywordFromStorage(keyword);
        });

        listItem.appendChild(deleteBtn);
        keywordsList.appendChild(listItem);
    }

    // Save the keyword to Chrome storage
    function updateKeywordsInStorage(keyword) {
        chrome.storage.sync.get('keywords', (data) => {
            const keywords = data.keywords || [];
            if (!keywords.includes(keyword)) {
                keywords.push(keyword);
                chrome.storage.sync.set({ keywords });
            }
        });
    }

    // Remove keyword from Chrome storage
    function removeKeywordFromStorage(keyword) {
        chrome.storage.sync.get('keywords', (data) => {
            let keywords = data.keywords || [];
            keywords = keywords.filter(k => k !== keyword);
            chrome.storage.sync.set({ keywords });
        });
    }

    // Save additional settings
    saveSettingsBtn.addEventListener('click', () => {
        alert('Settings have been saved.');
        // Add any additional settings save logic here if needed
    });
});
