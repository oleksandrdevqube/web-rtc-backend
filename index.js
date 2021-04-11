const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: {
    origin: "http://localhost:4200", credentials: true
}
});



app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

io.on('connection', (socket) => {
    socket.on('start_share', (roomId) => {
        const roomClients = io.sockets.adapter.rooms.get(roomId) || { size: 0 }
        const numberOfClients = roomClients.size
        console.log(`Start sharing ${roomId} and emitting start_share socket event`)
        // socket.join(roomId)
        socket.emit('start_share', true)
    })

    socket.on('join', (roomId) => {
        const roomClients = io.sockets.adapter.rooms.get(roomId) || { size: 0 }
        const numberOfClients = roomClients.size

        if (numberOfClients == 0) {
            console.log(`Creating room ${roomId} and emitting room_created socket event`)
            socket.join(roomId)
            socket.emit('room_created', roomId)
        } else if (numberOfClients == 1) {
            console.log(`Joining room ${roomId} and emitting room_joined socket event`)
            socket.join(roomId)
            socket.emit('room_joined', roomId)
        } else {
            console.log(`Can't join room ${roomId}, emitting full_room socket event`)
            socket.emit('full_room', roomId)
        }
    })


    socket.on('leave', (roomId) => {
        socket.leave(roomId);
        socket.emit('leave on room', roomId)
    })

    socket.on('start_call', (roomId) => {
        console.log(`Broadcasting start_call event to peers in room ${roomId}`)
        socket.broadcast.to(roomId).emit('start_call')
    })
    socket.on('webrtc_offer', (event) => {
        console.log(`Broadcasting webrtc_offer event to peers in room ${event.roomId}`)
        socket.broadcast.to(event.roomId).emit('webrtc_offer', event.sdp)
    })
    socket.on('webrtc_answer', (event) => {
        console.log(`Broadcasting webrtc_answer event to peers in room ${event.roomId}`)
        socket.broadcast.to(event.roomId).emit('webrtc_answer', event.sdp)
    })
    socket.on('webrtc_ice_candidate', (event) => {
        console.log(`Broadcasting webrtc_ice_candidate event to peers in room ${event.roomId}`)
        socket.broadcast.to(event.roomId).emit('webrtc_ice_candidate', event)
    })
})

server.listen(3000, () => {
    console.log('listening on *:3000');
});
