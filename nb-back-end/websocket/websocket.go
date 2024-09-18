package websocket

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/gin-gonic/gin"
)

// Upgrader settings for WebSocket connections
var upgrader = websocket.Upgrader{
	ReadBufferSize: 1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // modify to match security policy
	},
}

// Upgrades HTTP to WebSocket and manges connections
func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("Failed to upgrade to WebSocket:", err)
		return
	}
	defer conn.Close()

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Error reading message:", err)
			break
		}
		fmt.Println("Received:", string(msg))

		err = conn.WriteMessage(websocket.TextMessage, []byte("Reply from server"))
		if err != nil {
			fmt.Println("Error writing message:", err)
			break
		}
	}
}