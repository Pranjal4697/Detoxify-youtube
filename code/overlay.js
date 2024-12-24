document.addEventListener('DOMContentLoaded', () => {
    // Retrieve recommendations from storage
    chrome.storage.local.get(['recommendations'], (result) => {
        const recommendations = result.recommendations || [];
        const list = document.getElementById('recommendation-list');

        recommendations.forEach(video => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `https://www.youtube.com/watch?v=${video.id}`;
            a.textContent = video.title;
            li.appendChild(a);
            list.appendChild(li);
        });
    });

    document.getElementById('close-overlay').addEventListener('click', () => {
        document.getElementById('recommendation-overlay').style.display = 'none';
    });
});
