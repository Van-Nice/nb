declare module '@teamwork/websocket-json-stream' {
  import { WebSocket } from 'ws';
  import { Duplex } from 'stream';
  
  export default class WebSocketJSONStream extends Duplex {
    constructor(ws: WebSocket);
  }
}
