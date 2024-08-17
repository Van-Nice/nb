package main

import (
    "github.com/gin-gonic/gin"
    "net/http"
)

func main() {
    // Initialize the database connection
    initDB()
    defer closeDB()

    // Create a Gin router
    router := gin.Default()

    // Define a route
    router.GET("/", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "Hello, World!",
        })
    })

    // Handle Auth here
    router.POST("/auth/create-account", handleCreateAccount)

    // Run the server on port 8080
    router.Run(":8080")
}