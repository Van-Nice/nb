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
	UserID 		int 	`json:"userID" binding:"required"`
	FileName 	string  `json:"fileName" binding:"required"`
}

type CreateFolderInput struct {
	UserId 		int 	`json:"userID" binding:"required"`
	FolderName 	string 	`json:"folderName" binding:"required"`
}

// HandleCreateFile creates a new file for the authenticated user
func HandleCreateFile(c *gin.Context) {
	// Bind the incoming JSON to the CreateFileInput struct
	var input CreateFileInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	fmt.Println(input, input.FileName, input.UserID)

	type File struct {
		ID            primitive.ObjectID `bson:"_id,omitempty"`
		UserID        int                `bson:"user_id"`
		FileName 	  string 			 `bson:"file_name"`
		TimeCreated   time.Time          `bson:"time_created"`
		Content       string             `bson:"content"`
	}

    // Create a new ObjectID
    objectID := primitive.NewObjectID()

    // Create an instance of the File struct using the input values
    file := File{
        ID:          objectID,
        UserID:      input.UserID,
        FileName:    input.FileName,
        TimeCreated: time.Now(),
        Content:     "",
    }
	// Insert the file into the database
	if _, err := db.InsertFile(db.File(file)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Print the received filename
	fmt.Println("Received file name:", input.FileName)
	c.JSON(http.StatusOK, gin.H{"message": "File Name Received", "file_id": objectID})
}

func HandleCreateFolder(c *gin.Context) {
	fmt.Println("You have successfully called protected/create-folder")

	// Send back successful response
	c.JSON(http.StatusOK, gin.H{
		"message": "Dummy: Folder created successfully",
	})
}

// HandleGetFiles retrieves all files for the authenticated user
func HandleGetFiles(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		return
	}

	client := c.MustGet("mongoClient").(*mongo.Client)
	collection := client.Database("nbdb").Collection("files")

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


