package main

import (
	"log"
	"time"

	"nb-back-end/auth"
	"nb-back-end/settings"
	"nb-back-end/db"
	"nb-back-end/content"
	"nb-back-end/websocket"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	// Connect to Postgres database
	db.InitAuthDB()
	defer db.CloseAuthDB()

	// Connect to Mongo database
	db.InitContentDB()
	defer db.InitContentDB()

	gin.SetMode(gin.ReleaseMode)

	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.Use(func(c *gin.Context) {
		c.Set("mongoClient", db.ContentDB)
		c.Next()
	})

	router.POST("/auth/create-account", auth.HandleCreateAccount)
	router.GET("/email-confirmation", auth.HandleVerifyEmail)
	router.POST("/auth/login", auth.HandleLogin)
	// Create endpoint for fetching the contents of a folder
	// Protected routes
	protected := router.Group("/protected")
	protected.Use(auth.JWTAuthMiddleware())
	{	
		protected.GET("/")
		protected.POST("/")
		protected.GET("/user-settings", settings.HandleUserSettings)
		protected.GET("/home", auth.HandleHome)
		protected.POST("/create-file", content.HandleCreateFile)
		protected.POST("/create-folder", content.HandleCreateFolder)
		protected.POST("/get-files", content.HandleGetFiles)
		protected.POST("/get-folders", content.HandleGetFolders)
		protected.GET("/ws", websocket.HandleWebSocket)
		protected.POST("/account-data", auth.HandleAccountData)
		protected.POST("/folders", content.HandleGetFolderContents)
		protected.POST("/move-item", content.HandleMoveItem)
	}

	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
