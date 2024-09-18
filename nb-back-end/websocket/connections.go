package websocket

import (
	"fmt"

	"github.com/gorilla/websocket"
)

// ConnectionManager manages active WebSocket connections
type ConnectionManager struct {
	clients map[*websocket.Conn]bool
}

// NewConnectionManager initializes the manager
func NewConnectionManager() *ConnectionManager {
	return &ConnectionManager{
		clients: make(map[*websocket.Conn]bool),
	}
}

// AddClient adds a WebSocket connection to the manager
func(m *ConnectionManager) AddClient(conn *websocket.Conn) {
	m.clients[conn] = true
}

// RemoveClient removes a WebSocket connection
func (m *ConnectionManager) RemoveClient(conn *websocket.Conn) {
	delete(m.clients, conn)
}

// Broadcast sends a message to all connected clients
func (m *ConnectionManager) Broadcast(message []byte) {
	for conn := range m.clients {
		err := conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			fmt.Println("Error broadcasting:", err)
			conn.Close()
			delete(m.clients, conn)
		}
	}
}