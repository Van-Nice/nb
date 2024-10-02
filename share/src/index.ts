import * as WebSocketServer from 'ws'; // Alias for the WebSocket server library
import WebSocketJSONStream from '@teamwork/websocket-json-stream';
import express from 'express';
import ShareDB from 'sharedb';
import { Duplex } from 'stream'; // Import the Duplex stream type

const backend = new ShareDB();
const connection = backend.connect();

// Create an Express app
const app = express();

// Create the WebSocket server
const wss = new WebSocketServer.Server({ server: app.listen(8069) });

// Handle WebSocket connections
wss.on('connection', (ws: WebSocketServer.WebSocket) => {
  const stream = new WebSocketJSONStream(ws) as unknown as Duplex; // Cast to Duplex
  backend.listen(stream); // Now recognized as Duplex stream
});

console.log('Server is listening on port 8069');
