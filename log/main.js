if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
}

document.addEventListener('DOMContentLoaded', () => {
    const dbRequest = indexedDB.open('EpisodeDB', 1);
    let db;

    dbRequest.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains('episodes')) {
            db.createObjectStore('episodes', { keyPath: 'id', autoIncrement: true });
        }
    };

    dbRequest.onsuccess = (event) => {
        db = event.target.result;
    };

    function logEpisode(choice, note) {
        const transaction = db.transaction(['episodes'], 'readwrite');
        const store = transaction.objectStore('episodes');
        store.add({ episode: choice, note: note, timestamp: new Date().toISOString() });
        loadHistory();
    }

    function loadHistory() {
        const transaction = db.transaction(['episodes'], 'readonly');
        const store = transaction.objectStore('episodes');
        const request = store.getAll();

        request.onsuccess = () => {
            const historyTable = document.getElementById('historyTable');
            historyTable.innerHTML = '<tr><th>Episode</th><th>Note</th><th>Timestamp</th></tr>' +
                request.result.map(entry => `<tr><td>${entry.episode}</td><td>${entry.note}</td><td>${entry.timestamp}</td></tr>`).join('');
        };
    }

    document.getElementById('logButton').addEventListener('click', () => {
        document.getElementById('logOptions').style.display = 'block';
    });

    document.querySelectorAll('.optionButton').forEach(button => {
        button.addEventListener('click', () => {
            const choice = button.dataset.episode;
            const noteInput = document.getElementById('noteInput');
            const saveNoteButton = document.getElementById('saveNote');
            noteInput.style.display = 'block';
            saveNoteButton.style.display = 'block';
            saveNoteButton.onclick = () => {
                logEpisode(choice, noteInput.value || 'No note');
                noteInput.style.display = 'none';
                saveNoteButton.style.display = 'none';
                document.getElementById('logOptions').style.display = 'none';
                noteInput.value = '';
            };
        });
    });

    document.getElementById('viewLogsButton').addEventListener('click', () => {
        document.getElementById('historyContainer').style.display = 'block';
        loadHistory();
    });
});