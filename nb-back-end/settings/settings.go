package settings

import (
	"fmt"
	"nb-back-end/db"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// HandleUserSettings handles the request to get user settings by user ID
func HandleUserSettings(c *gin.Context) {
    // Parse user ID from query parameters
    userIDStr := c.Query("user_id")
    if userIDStr == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
        return
    }

    userID, err := strconv.Atoi(userIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
        return
    }

    // Fetch user settings from the database
    settings, err := db.GetUserSettingsByID(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user settings"})
        return
    }
    // Print the user settings for debugging
	fmt.Printf("User settings: %+v\n", settings)
    // Return user settings as JSON response
    c.JSON(http.StatusOK, gin.H{"settings": settings})
}

