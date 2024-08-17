package main

import (
    "github.com/gin-gonic/gin"
    "nb-back-end/auth"
    "nb-back-end/db"
    "github.com/joho/godotenv"
    "log"
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

    gin.SetMode(gin.ReleaseMode)

    router := gin.Default()
    router.POST("/auth/create-account", auth.HandleCreateAccount)

    router.Run(":8080")
}