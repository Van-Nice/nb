package main

import (
	"log"
	"nb-back-end/auth"
	"nb-back-end/db"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	// "net/http"
)

func main() {
    // Load environment variables from .env file
    err := godotenv.Load(".env") // Ensure this path is correct relative to the test file
    if err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }

    // Initialize the database connection
    db.InitDB()
    defer db.CloseDB()

    db.InitMongoDB()
    defer db.CloseMongoDB()

    gin.SetMode(gin.ReleaseMode)

    router := gin.Default()
    // Configure CORS
    router.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"http://localhost:3000"},
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

    // Pass Mongo client to handlers
    router.Use(func(c *gin.Context) {
        c.Set("mongoClient", db.MongoClient)
        c.Next()
    })

    router.POST("/auth/create-account", auth.HandleCreateAccount)
    router.GET("/email-confirmation", auth.HandleVerifyEmail)
    router.POST("/auth/login", auth.HandleLogin)

    // Protected route
    router.GET("/protected", auth.JWTAuthMiddleware(), func(c *gin.Context) {
        mongoClient, exits := c.Get("mongoClient")
        if !exits {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "MongoDB client not found"})
            return
        }
        // use mongoClient here - insert files and folders
        c.JSON(http.StatusOK, gin.H{"message": "You are authenticated"})
    })

    if err := router.Run(":8080"); err != nil {
        log.Fatalf("Failed to run server: %v", err)
    }
}