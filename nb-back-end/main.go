package main

// This is the development backend for the bungo text editor

import (
	"log"
	"os"
	"time"

	"nb-back-end/auth"
	"nb-back-end/content"
	"nb-back-end/db"
	"nb-back-end/settings"
	"nb-back-end/websocket"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file if it exists
	if err := godotenv.Load(".env"); err != nil {
		// Instead of fatal, just log the error
		log.Println("No .env file found - using environment variables")
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
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
			AllowCredentials: true,
			AllowWebSockets: true,
			MaxAge:           12 * time.Hour,
	}))

	router.Use(func(c *gin.Context) {
		c.Set("mongoClient", db.ContentDB)
		c.Next()
	})

	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"time": time.Now(),
		})
	})

	router.POST("/auth/create-account", auth.HandleCreateAccount)
	router.GET("/email-confirmation", auth.HandleVerifyEmail)
	router.POST("/auth/login", auth.HandleLogin)
	router.GET("/protected/ws", websocket.HandleWebSocket)
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
		protected.POST("/account-data", auth.HandleAccountData)
		protected.POST("/folders", content.HandleGetFolderContents)
		protected.POST("/move-item", content.HandleMoveItem)
		protected.POST("/delete-item", content.HandleDeleteItem)
		protected.GET("/deleted-items", content.HandleGetDeletedItems)
		protected.GET("/nested-folders", content.HandleGetNestedFolders)
		protected.GET("/files", content.HandleGetFileName)
		protected.POST("/rename-file", content.HandleRenameFile)
		protected.GET("/search", content.HandleSearch)
	}

	port := os.Getenv("PORT") // Heroku provides the port
	if port == "" {
		port = "8080" // Default port if not set
	}

	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
