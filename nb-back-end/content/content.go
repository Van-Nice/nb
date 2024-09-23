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
	UserId    int    `json:"userID" binding:"required"`
	FolderName string `json:"folderName" binding:"required"`
}

// File represents a file in the database
type File struct {
    ID          primitive.ObjectID `bson:"_id,omitempty"`
    UserID      int                `bson:"user_id"`
    FileName    string             `bson:"file_name"`
    TimeCreated time.Time          `bson:"time_created"`
    Content     string             `bson:"content"`
}

// NewFile creates a new File instance
func NewFile(userID int, fileName string) File {
    return File{
        ID:          primitive.NewObjectID(),
        UserID:      userID,
        FileName:    fileName,
        TimeCreated: time.Now(),
        Content:     "",
    }
}

// HandleCreateFile creates a new file for the authenticated user
// HandleCreateFile creates a new file for the authenticated user
func HandleCreateFile(c *gin.Context) {
    // Bind the incoming JSON to the CreateFileInput struct
    var input CreateFileInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    fmt.Println(input, input.FileName, input.UserID)

    // Create an instance of the db.File struct using the input values
    file := db.NewFile(input.UserID, input.FileName)

    // Insert the file into the database
    if _, err := db.InsertFile(file); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to insert file: %v", err)})
        return
    }

    // Print the received filename
    fmt.Println("Received file name:", input.FileName)
    c.JSON(http.StatusOK, gin.H{"message": "File Name Received", "file_id": file.ID.Hex()})
}

func HandleCreateFolder(c *gin.Context) {
	// fmt.Println("You have successfully called protected/create-folder")
	var input CreateFolderInput
	if err := c.ShouldBindJSON(&input); err != nil {  // Use ShouldBindJSON for JSON payload
	  c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	  return
	}
	fmt.Println("Folder Input:", input)
	fmt.Println("UserId:", input.UserId, "FolderName:", input.FolderName)



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


