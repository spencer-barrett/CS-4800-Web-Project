let username = null;
let socket;

document.addEventListener('DOMContentLoaded', (key, value) => {


    const chatLog = document.getElementById('chat-log');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');

    const dialog = document.getElementById('nameDialog');
    const form = document.getElementById('nameForm');
    const input = document.getElementById('nameInput');

    const activeUsers = document.getElementById('active-users');


    function initApp() {
        // Establish a WebSocket connection

        const proto = location.protocol === 'https:' ? 'wss' : 'ws';
        socket = new WebSocket(`${proto}://${location.host}/ws?name=${encodeURIComponent(username)}`);

        socket.addEventListener('open', () => console.log('ws open'));
        socket.addEventListener('close', () => console.log('ws closed'));
        socket.addEventListener('error', e => console.log('ws error', e));


        function colorFor(name) {
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = (hash * 31 + name.charCodeAt(i)) | 0;
            }
            const hue = Math.abs(hash) % 360;
            return `hsl(${hue} 70% 70%)`;
        }

// Event listener for incoming messages
        socket.addEventListener("message", function (event) {
            let message;
            try {
                message = JSON.parse(event.data)
            } catch (e) {
                return
            }


            if (message.type === "count" && typeof message.count === "number") {
                activeUsers.textContent = `Active Users: ${message.count}`;
                return;
            }


            const text = message.messageContent ?? message.content;

            if (!message || !message.author || !text) return;

            const p = document.createElement('p');

            if (message.author === 'system') {
                p.className = 'system';
                p.textContent = text;
            } else {
                const who = document.createElement('span');
                who.className = 'author';
                who.textContent = `${message.author}:`;
                who.style.color = colorFor(message.author);
                p.appendChild(who);
                p.append(' ' + text);
                // p.innerHTML = `<span class="author">${message.author}:</span> ${text}`;

            }

            chatLog.appendChild(p);
            chatLog.scrollTop = chatLog.scrollHeight; // Auto-scroll to the bottom
        });

    }

    const saved = sessionStorage.getItem('chatName');

    if (saved && saved !== 'undefined' && saved !== 'null' && saved.trim() !== '') {
        username = saved;
        initApp();
    } else {
        dialog.showModal();
        input.focus();
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = input.value.trim();
        if (!name) return;
        username = name;
        sessionStorage.setItem('chatName', username);
        dialog.close();
        initApp();
    });


// Handle form submission
    messageForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const messageContent = messageInput.value.trim();
        if (!messageContent || !socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({author: username, messageContent}));
        messageInput.value = '';

    });

});





