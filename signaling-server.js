const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 10000;
const app = express();
app.get('/', (req, res) => res.send('Signaling server is running!'));
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sessions = new Map();

wss.on('connection', ws => {
    console.log('New client connected');

    ws.on('message', message => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data);

            if (data.type === 'sender' || data.type === 'receiver') {
                const sessionId = data.sessionId;
                if (!sessions.has(sessionId)) {
                    sessions.set(sessionId, new Set());
                }
                sessions.get(sessionId).add(ws);
                ws.sessionId = sessionId;
                console.log(`Client registered for session: ${sessionId}`);
            }

            if (data.sessionId) {
                const sessionClients = sessions.get(data.sessionId) || new Set();
                sessionClients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            }
        } catch (err) {
            console.error('Error processing message:', err);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        if (ws.sessionId) {
            const sessionClients = sessions.get(ws.sessionId);
            if (sessionClients) {
                sessionClients.delete(ws);
                if (sessionClients.size === 0) {
                    sessions.delete(ws.sessionId);
                }
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Signaling server running on port ${PORT}`);
});
