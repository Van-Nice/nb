"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocketServer = __importStar(require("ws")); // Alias for the WebSocket server library
const websocket_json_stream_1 = __importDefault(require("@teamwork/websocket-json-stream"));
const express_1 = __importDefault(require("express"));
const sharedb_1 = __importDefault(require("sharedb"));
const backend = new sharedb_1.default();
const connection = backend.connect();
// Create an Express app
const app = (0, express_1.default)();
// Create the WebSocket server
const wss = new WebSocketServer.Server({ server: app.listen(8069) });
// Handle WebSocket connections
wss.on('connection', (ws) => {
    const stream = new websocket_json_stream_1.default(ws); // Cast to Duplex
    backend.listen(stream); // Now recognized as Duplex stream
});
console.log('Server is listening on port 8069');
