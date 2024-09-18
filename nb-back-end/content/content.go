package content

import (
	"fmt"
	"context"
	"nb-back-end/db"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type CreateFileInput struct {
    FileName string `json:"fileName"`
}

// TODO: Ensure file gets wrote to db and return UUID for frontend
// HandleCreateFile creates a new file for the authenticated user
func HandleCreateFile(c *gin.Context) {
	// Bind the incoming JSON to the CreateFileInput struct
	var input CreateFileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	type File struct {
		ID            primitive.ObjectID `bson:"_id,omitempty"`
		UserID        int                `bson:"user_id"`
		TimeCreated   time.Time          `bson:"time_created"`
		Content       string             `bson:"content"`
	}

    // Create a new ObjectID
    objectID := primitive.NewObjectID()

    // Create an instance of the File struct
    file := File{
        ID:          objectID,
        UserID:      123, // Example user ID
        TimeCreated: time.Now(),
        Content:     "This is the content of the file motherfucka!!!.",
    }

	db.InsertFile(db.File(file))

	// Print the received filename
	fmt.Println("Received file name:", input.FileName)
	c.JSON(http.StatusOK, gin.H{"message": "File Name Received!!!"})
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
// func HandleCreateFolder(c *gin.Context) {
// 	userID, exists := c.Get("userID")
// 	if !exists {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
// 		return
// 	}

// 	var folder db.Folder
// 	if err := c.ShouldBindJSON(&folder); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
// 		return
// 	}

// 	folder.UserID, _ = primitive.ObjectIDFromHex(userID.(string))
// 	folder.CreatedAt = time.Now()
// 	folder.UpdatedAt = time.Now()

// 	result, err := db.InsertFolder(folder)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create folder"})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{"message": "Folder created successfully", "folder_id": result.InsertedID})
// }

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

