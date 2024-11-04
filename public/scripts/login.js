// login.js

document.addEventListener('DOMContentLoaded', () => {
    let username = localStorage.getItem('username');
    
    if (!username) {
        while (!username) {
            username = prompt('Introduce tu nombre:');
            if (!username) {
                alert('Debes introducir un nombre para unirte al chat.');
            }
        }
        localStorage.setItem('username', username);
    }

    // Redirección a salas
    document.querySelectorAll('a[href^="chat/"]').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const roomId = link.getAttribute('href').split('/').pop();
            window.location.href = `/chat/${roomId}`;
        });
    });

    // logout
    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('username');
        alert('Has cerrado sesión.');
        window.location.href = '/'; 
    });
});
