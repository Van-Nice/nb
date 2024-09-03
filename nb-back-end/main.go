package main

import (
	"log"
	"time"

	"nb-back-end/auth"
	// "nb-back-end/content"
	"nb-back-end/db"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	db.InitAuthDB()
	defer db.CloseAuthDB()

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
	router.POST("/auth/login", auth.HandleLogin) // TODO: Fix this api endpoint

	// Protected routes
	protected := router.Group("/protected")
	protected.Use(auth.JWTAuthMiddleware())
	{
		protected.GET("/home", )
		// protected.POST("/files", content.HandleCreateFile)
		// protected.GET("/files", content.HandleGetFiles)
		// protected.POST("/folders", content.HandleCreateFolder)
		// protected.GET("/folders", content.HandleGetFolders)
	}

	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Failed to run server: %v", err)
	}
}
