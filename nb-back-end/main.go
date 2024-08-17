package main

import (
    "github.com/gin-gonic/gin"
    "net/http"
)

func main() {
    // Create a Gin router
    router := gin.Default()

    // Define a route
    router.GET("/", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "Hello, World!",
        })
    })

	// Handle Auth here
	router.POST("/auth/create-account", func(c *gin.Context) {
		var json struct{
			
		}
	})

    // Run the server on port 8080
    router.Run(":8080")
}