// chat.js

document.addEventListener('DOMContentLoaded', () => {
    const socket = io('/');
    const messageInput = document.getElementById('message');
    const messagesContainer = document.getElementById('messages');  
    const roomId = window.location.href.split('/').pop();
    const username = localStorage.getItem('username');

    if (!username) {
        alert('Debes introducir un nombre para unirte al chat.');
        window.location.href = '/';  
        return;
    }

    // Evento al unirse a la sala
    socket.emit('joinRoom', { username, room: roomId });

    // Evento de mensajes recibidos
    socket.on('getMessage', (data) => {
        displayMessage(data, data.username === username ? 'mine' : 'other');
    });

    // EVento para mostrar notificaciones
    socket.on('message', (data) => {
        displayNotification(data);
    });

    // Enviar
    document.getElementById('trigger').addEventListener('click', () => {
        const msg = messageInput.value.trim();
        if (!msg) return;  // No mensajes vacíos

        const messageData = {
            username,
            room: roomId,
            text: msg,
            timestamp: new Date().toLocaleTimeString(),
        };

        // Mandar mensaje a la sala
        socket.emit('sendMessage', messageData);

        // Limpiar input
        messageInput.value = '';
    });

    // Mostrar mensajes 
    function displayMessage(data, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);
        messageDiv.innerHTML = `<strong>${data.username}</strong> <span>(${data.timestamp}):</span> ${data.text}`;
        messagesContainer.appendChild(messageDiv);
    }

    // Mostrar notificaciones
    function displayNotification(data) {
        const notificationDiv = document.createElement('div');
        notificationDiv.classList.add('notification');
        notificationDiv.innerHTML = `<em>${data.text}</em>`;
        messagesContainer.appendChild(notificationDiv);
    }
});
