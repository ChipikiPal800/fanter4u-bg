// multiplayer/server/netplay-server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

// ===== CRITICAL: Use PORT from environment (SnapDeploy sets this) =====
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: false
    },
    transports: ['websocket', 'polling']
});

// ===== HEALTH CHECK ENDPOINTS =====
app.get('/', (req, res) => {
    res.json({ 
        status: 'online',
        service: 'fanterOS Netplay Server',
        version: '1.0.0',
        endpoints: ['/health', '/socket.io'],
        timestamp: Date.now()
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        uptime: process.uptime(),
        timestamp: Date.now(),
        rooms: rooms ? rooms.size : 0
    });
});

// ===== IN-MEMORY STORAGE =====
const rooms = new Map();

// ===== CLEAN UP OLD ROOMS EVERY 5 MINUTES =====
setInterval(() => {
    const now = Date.now();
    for (const [roomId, room] of rooms.entries()) {
        // Delete rooms older than 1 hour
        if (now - room.createdAt > 3600000) {
            rooms.delete(roomId);
            console.log(`🧹 Cleaned up old room: ${roomId}`);
        }
    }
}, 300000);

// ===== SOCKET.IO CONNECTION HANDLING =====
io.on('connection', (socket) => {
    console.log('🎮 Player connected:', socket.id);

    socket.on('ping', () => {
        socket.emit('pong');
        
    
    // Create a new game room
    socket.on('create-room', ({ gameName, playerName, gameCore, romId }) => {
        try {
            const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
            rooms.set(roomId, {
                gameName,
                gameCore,
                romId,
                host: socket.id,
                hostName: playerName || 'Host',
                players: [{ id: socket.id, name: playerName || 'Host', isHost: true }],
                createdAt: Date.now()
            });
            socket.join(roomId);
            socket.emit('room-created', { roomId });
            console.log(`✅ Room created: ${roomId} for ${gameName} by ${playerName}`);
        } catch (error) {
            console.error('Error creating room:', error);
            socket.emit('room-error', { message: 'Failed to create room' });
        }
    });
    
    // Join an existing room
    socket.on('join-room', ({ roomId, playerName }) => {
        try {
            const room = rooms.get(roomId);
            if (!room) {
                socket.emit('join-error', 'Room not found or game already ended');
                return;
            }
            
            if (room.players.length >= 4) {
                socket.emit('join-error', 'Room is full (max 4 players)');
                return;
            }
            
            socket.join(roomId);
            room.players.push({ id: socket.id, name: playerName || 'Guest', isHost: false });
            rooms.set(roomId, room);
            
            // Notify host that someone joined
            io.to(room.host).emit('player-joined', { playerName: playerName || 'Guest', playerId: socket.id });
            
            // Send room info to joining player
            socket.emit('room-joined', { 
                roomId, 
                gameName: room.gameName,
                gameCore: room.gameCore,
                romId: room.romId,
                hostName: room.hostName,
                playerCount: room.players.length,
                isHost: false
            });
            
            // Notify all players in room about player count update
            io.to(roomId).emit('room-update', { playerCount: room.players.length });
            
            console.log(`👤 ${playerName || 'Guest'} joined room ${roomId} (${room.players.length}/4 players)`);
        } catch (error) {
            console.error('Error joining room:', error);
            socket.emit('join-error', 'Failed to join room');
        }
    });
    
    // WebRTC signaling
    socket.on('signal', ({ roomId, signal, to }) => {
        try {
            if (to) {
                io.to(to).emit('signal', { signal, from: socket.id });
            } else {
                socket.to(roomId).emit('signal', { signal, from: socket.id });
            }
        } catch (error) {
            console.error('Signaling error:', error);
        }
    });
    
    // Controller input from guest to host
    socket.on('controller-input', ({ roomId, input }) => {
        try {
            const room = rooms.get(roomId);
            if (room && room.host) {
                io.to(room.host).emit('controller-input', { input, playerId: socket.id });
            }
        } catch (error) {
            console.error('Controller input error:', error);
        }
    });
    
    // Leave room
    socket.on('leave-room', ({ roomId }) => {
        try {
            const room = rooms.get(roomId);
            if (room) {
                const wasHost = room.host === socket.id;
                room.players = room.players.filter(p => p.id !== socket.id);
                
                if (room.players.length === 0 || wasHost) {
                    rooms.delete(roomId);
                    console.log(`🗑️ Room deleted: ${roomId}`);
                    io.to(roomId).emit('room-closed', { reason: wasHost ? 'Host left' : 'All players left' });
                } else {
                    if (wasHost && room.players.length > 0) {
                        // Transfer host to next player
                        const newHost = room.players[0];
                        room.host = newHost.id;
                        room.hostName = newHost.name;
                        io.to(newHost.id).emit('become-host', { gameName: room.gameName, roomId });
                    }
                    rooms.set(roomId, room);
                    io.to(room.host).emit('player-left', { playerId: socket.id });
                    io.to(roomId).emit('room-update', { playerCount: room.players.length });
                }
            }
            socket.leave(roomId);
            console.log(`👋 Player left room: ${roomId}`);
        } catch (error) {
            console.error('Error leaving room:', error);
        }
    });
    
    // Get list of active rooms
    socket.on('get-rooms', () => {
        try {
            const activeRooms = Array.from(rooms.entries())
                .filter(([_, room]) => room.players.length > 0)
                .map(([id, room]) => ({
                    roomId: id,
                    gameName: room.gameName,
                    hostName: room.hostName,
                    playerCount: room.players.length,
                    maxPlayers: 4,
                    createdAt: room.createdAt
                }));
            socket.emit('rooms-list', activeRooms);
        } catch (error) {
            console.error('Error getting rooms:', error);
        }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('🔌 Player disconnected:', socket.id);
        // Clean up rooms where this socket was a player
        for (const [roomId, room] of rooms.entries()) {
            if (room.players.some(p => p.id === socket.id)) {
                const wasHost = room.host === socket.id;
                room.players = room.players.filter(p => p.id !== socket.id);
                
                if (room.players.length === 0 || wasHost) {
                    rooms.delete(roomId);
                    console.log(`🗑️ Room deleted (disconnect): ${roomId}`);
                    io.to(roomId).emit('room-closed', { reason: wasHost ? 'Host disconnected' : 'All players left' });
                } else {
                    if (wasHost && room.players.length > 0) {
                        // Transfer host to next player
                        const newHost = room.players[0];
                        room.host = newHost.id;
                        room.hostName = newHost.name;
                        io.to(newHost.id).emit('become-host');
                    }
                    rooms.set(roomId, room);
                    io.to(room.host).emit('player-left', { playerId: socket.id });
                    io.to(roomId).emit('room-update', { playerCount: room.players.length });
                }
            }
        }
    });
});

// ===== START SERVER =====
server.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ╔═══════════════════════════════════════╗
    ║   🎮 FANTER NETPLAY SERVER 🎮        ║
    ║                                       ║
    ║   Running on port: ${PORT}            ║
    ║   Ready for multiplyer retro gaming!  ║
    ╚═══════════════════════════════════════╝
    `);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
