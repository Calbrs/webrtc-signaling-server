// signaling-server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const PORT = process.env.PORT || 10000;

const app = express();

// Optional: simple route to verify server is alive
app.get('/', (req, res) => res.send('Signaling server is running!'));

// Create HTTP server (Render handles HTTPS)
const server = http.createServer(app);

// Attach WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log('New client connected');

  ws.on('message', message => {
    console.log('Received:', message);

    // Broadcast to all other clients
    wss.clients.forEach(client => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => console.log('Client disconnected'));
});

server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});
