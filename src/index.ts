import express from "express";
import path from "path";
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3000;
const app = express();

app.use('', express.static(path.join(__dirname, '..', 'public')));

app.get('', (_, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/chat/:id', (_, res) => {
    res.sendFile(path.join(__dirname, 'views', 'chat.html'));
});

const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});

const io = new Server(server);

// Objeto para almacenar la información de los usuarios conectados
interface User {
    username: string;
    room: string;
    joinTime: Date;
}

const users: { [key: string]: User } = {};

io.on('connection', (socket) => {
    console.log('Cliente conectado');

    // Cuando el usuario se une a una sala
    socket.on('joinRoom', ({ username, room }) => {
        const joinTime = new Date();
        socket.join(`room-${room}`);
        
        // Guardar el usuario en el objeto users
        users[socket.id] = { username, room, joinTime };

        console.log(`${username} se ha unido a la sala ${room} a las ${joinTime.toLocaleTimeString()}`);

        // Notificar a otros usuarios en la sala que el usuario se ha unido
        socket.to(`room-${room}`).emit('message', {
            username: 'Sistema',
            text: `${username} se ha unido a la conversación [${joinTime.toLocaleTimeString()}]`,
            timestamp: joinTime.toLocaleTimeString(),
        });

        // Enviar un mensaje de bienvenida al usuario que se une
        socket.emit('message', {
            username: 'Sistema',
            text: `Bienvenido a la sala ${room}, ${username}`,
            timestamp: joinTime.toLocaleTimeString(),
        });
    });

    // Cuando el usuario envía un mensaje
    socket.on('sendMessage', (data) => {
        const { username, room, text } = data;
        const messageData = {
            username,
            text,
            timestamp: new Date().toLocaleTimeString(),
        };

        // Emitir el mensaje a todos en la sala, incluyendo al emisor
        io.to(`room-${room}`).emit('getMessage', messageData);
    });

    // Cuando un usuario se desconecta
    socket.on('disconnecting', () => {
        const user = users[socket.id];
        if (user) {
            const { username, room } = user;
            const disconnectTime = new Date();
            
            // Enviar mensaje de desconexión con nombre de usuario y solo la hora de desconexión
            io.to(`room-${room}`).emit('message', {
                username: 'Sistema',
                text: `${username} ha abandonado la conversación [${disconnectTime.toLocaleTimeString()}]`,
                timestamp: disconnectTime.toLocaleTimeString(),
            });
            
            console.log(`${username} se ha desconectado de la sala ${room} a las ${disconnectTime.toLocaleTimeString()}`);
        }
    });

    socket.on('disconnect', () => {
        // Eliminar el usuario de la lista de usuarios conectados
        delete users[socket.id];
        console.log('Cliente desconectado');
    });
});
