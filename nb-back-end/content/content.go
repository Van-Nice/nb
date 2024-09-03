package content

import (
	"context"
	"nb-back-end/db"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// HandleCreateFile creates a new file for the authenticated user
func HandleCreateFile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		return
	}

	var file db.File
	if err := c.ShouldBindJSON(&file); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	file.UserID, _ = primitive.ObjectIDFromHex(userID.(string))
	file.CreatedAt = time.Now()
	file.UpdatedAt = time.Now()

	result, err := db.InsertFile(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File created successfully", "file_id": result.InsertedID})
}

// HandleGetFiles retrieves all files for the authenticated user
func HandleGetFiles(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		return
	}

	client := c.MustGet("mongoClient").(*mongo.Client)
	collection := client.Database("your_database_name").Collection("files")

	filter := bson.M{"user_id": userID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch files"})
		return
	}
	defer cursor.Close(context.TODO())

	var files []bson.M
	for cursor.Next(context.TODO()) {
		var file bson.M
		if err := cursor.Decode(&file); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode file"})
			return
		}
		files = append(files, file)
	}

	c.JSON(http.StatusOK, gin.H{"files": files})
}

// HandleCreateFolder creates a new folder for the authenticated user
func HandleCreateFolder(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		return
	}

	var folder db.Folder
	if err := c.ShouldBindJSON(&folder); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	folder.UserID, _ = primitive.ObjectIDFromHex(userID.(string))
	folder.CreatedAt = time.Now()
	folder.UpdatedAt = time.Now()

	result, err := db.InsertFolder(folder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create folder"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Folder created successfully", "folder_id": result.InsertedID})
}

// HandleGetFolders retrieves all folders for the authenticated user
func HandleGetFolders(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		return
	}

	client := c.MustGet("mongoClient").(*mongo.Client)
	collection := client.Database("your_database_name").Collection("folders")

	filter := bson.M{"user_id": userID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch folders"})
		return
	}
	defer cursor.Close(context.TODO())

	var folders []bson.M
	for cursor.Next(context.TODO()) {
		var folder bson.M
		if err := cursor.Decode(&folder); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode folder"})
			return
		}
		folders = append(folders, folder)
	}

	c.JSON(http.StatusOK, gin.H{"folders": folders})
}


