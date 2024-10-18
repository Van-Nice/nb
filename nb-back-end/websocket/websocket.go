package websocket

import (
	"context"
	"encoding/json"
	"fmt"
	"nb-back-end/db"
	"nb-back-end/auth"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Upgrader settings for WebSocket connections
var upgrader = websocket.Upgrader{
	ReadBufferSize: 1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("Failed to upgrade to WebSocket:", err)
		return
	}
	defer conn.Close()

	// Extract token from query parameters
	token := c.Query("token")
	if token == "" {
		fmt.Println("Token not provided")
		conn.WriteMessage(websocket.TextMessage, []byte("Unauthorized: Token not provided"))
		conn.Close()
		return
	}

	// Validate the token
	userID, err := auth.ValidateToken(token)
	if err != nil {
		fmt.Println("Invalid token:", err)
		conn.WriteMessage(websocket.TextMessage, []byte("Unauthorized: Invalid token"))
		conn.Close()
		return
	}

	fmt.Println("User authenticated with ID:", userID)

	// Inside your message handling loop
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Error reading message:", err)
			break
		}

		// Parse the incoming message
		var message struct {
			ID      string `json:"id"`
			Content string `json:"content"`
		}

		err = json.Unmarshal(msg, &message)
		if err != nil {
			fmt.Println("Error unmarshalling message:", err)
			continue
		}

		// Update the file's content in the database
		fileID, err := primitive.ObjectIDFromHex(message.ID)
		if err != nil {
			fmt.Println("Invalid file ID:", err)
			continue
		}

		collection := db.ContentDB.Database("nbdb").Collection("files")
		filter := bson.M{
			"_id":     fileID,
			"user_id": userID, // Ensure the user owns the file
		}
		update := bson.M{"$set": bson.M{"content": message.Content}}

		_, err = collection.UpdateOne(context.TODO(), filter, update)
		if err != nil {
			fmt.Println("Error updating file content:", err)
			continue
		}

		// Send an acknowledgment back to the client
		ackMessage := map[string]string{
			"status": "ok",
		}
		ackBytes, _ := json.Marshal(ackMessage)
		err = conn.WriteMessage(websocket.TextMessage, ackBytes)
		if err != nil {
			fmt.Println("Error sending acknowledgment:", err)
			break
		}
	}
}
