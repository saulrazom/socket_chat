"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const PORT = process.env.PORT || 3000;
const app = (0, express_1.default)();
app.use('', express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
app.get('', (_, res) => {
    res.sendFile(path_1.default.join(__dirname, 'views', 'index.html'));
});
app.get('/chat/:id', (_, res) => {
    res.sendFile(path_1.default.join(__dirname, 'views', 'chat.html'));
});
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
const io = new socket_io_1.Server(server);
const users = {};
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
