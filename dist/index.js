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
app.get('', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'views', 'index.html'));
});
app.get('/chat/:id', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'views', 'chat.html'));
});
const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
const io = new socket_io_1.Server(server);
io.on('connection', (socket) => {
    console.log('Cliente conectado');
    // Cuando el usuario se une a una sala
    socket.on('joinRoom', ({ username, room }) => {
        socket.join(`room-${room}`);
        console.log(`${username} se ha unido a la sala ${room}`);
        // Notificar a otros usuarios en la sala que el usuario se ha unido
        socket.to(`room-${room}`).emit('message', {
            username: 'Sistema',
            text: `${username} se ha unido a la conversación`,
            timestamp: new Date().toLocaleTimeString(),
        });
        // Enviar un mensaje de bienvenida al usuario que se une
        socket.emit('message', {
            username: 'Sistema',
            text: `Bienvenido a la sala ${room}, ${username}`,
            timestamp: new Date().toLocaleTimeString(),
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
        const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
        rooms.forEach(room => {
            io.to(room).emit('message', {
                username: 'Sistema',
                text: `Un usuario ha abandonado la conversación`,
                timestamp: new Date().toLocaleTimeString(),
            });
        });
    });
    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});
