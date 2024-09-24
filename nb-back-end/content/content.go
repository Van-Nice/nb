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
    FolderName     string `json:"folderName" binding:"required"`
    ParentFolderID string `json:"parentFolderID,omitempty"` // Now a string
}

type GetFolderContents struct {
	UserId    		int    				`json:"userID" binding:"required"`
	FolderId 		string 				`json:"folderID" binding:"required"`
}

// File represents a file in the database
type File struct {
    ID             primitive.ObjectID  `bson:"_id,omitempty"`
    UserID         int                 `bson:"user_id"`
    FileName       string              `bson:"file_name"`
    TimeCreated    time.Time           `bson:"time_created"`
    Content        string              `bson:"content"`
    ParentFolderID *primitive.ObjectID `bson:"parent_folder_id,omitempty"`
}

type Folder struct {
    ID             primitive.ObjectID  `bson:"_id,omitempty"`
    UserID         int                 `bson:"user_id"`
    FolderName     string              `bson:"folder_name"`
    TimeCreated    time.Time           `bson:"time_created"`
    ParentFolderID *primitive.ObjectID `bson:"parent_folder_id,omitempty"`
}

type MoveItemInput struct {
    ItemType      string `json:"itemType"`
    ItemID        string `json:"itemID"`
    TargetFolderID string `json:"targetFolderID"`
}

// HandleCreateFile creates a new file for the authenticated user
func HandleCreateFile(c *gin.Context) {
    // Retrieve userID from context
    userIDInterface, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

    userID, ok := userIDInterface.(int)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
        return
    }

    var input struct {
        FileName       string `json:"fileName" binding:"required"`
        ParentFolderID string `json:"parentFolderID,omitempty"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Convert ParentFolderID from string to ObjectID if provided
    var parentFolderID *primitive.ObjectID
    if input.ParentFolderID != "" {
        id, err := primitive.ObjectIDFromHex(input.ParentFolderID)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid parent folder ID"})
            return
        }
        parentFolderID = &id
    }

    // Create a new file
    file := db.NewFile(userID, input.FileName, parentFolderID)

    // Insert the file into the database
    if _, err := db.InsertFile(file); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to insert file: %v", err)})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "File created", "file_id": file.ID.Hex()})
}


func HandleCreateFolder(c *gin.Context) {
    // Retrieve userID from context
    userIDInterface, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

    userID, ok := userIDInterface.(int)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
        return
    }

    var input CreateFolderInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Convert ParentFolderID from string to ObjectID if provided
    var parentFolderID *primitive.ObjectID
    if input.ParentFolderID != "" {
        id, err := primitive.ObjectIDFromHex(input.ParentFolderID)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid parent folder ID"})
            return
        }
        parentFolderID = &id
    }

    // Create a new folder
    folder := db.NewFolder(userID, input.FolderName, parentFolderID)

    // Insert the folder into the database
    if _, err := db.InsertFolder(folder); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to insert folder: %v", err)})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Folder created", "folder_id": folder.ID.Hex()})
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

func HandleGetFolders(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		return
	}

	client := c.MustGet("mongoClient").(*mongo.Client)
	collection := client.Database("nbdb").Collection("folders")

	filter := bson.M{"user_id": userID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch files"})
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

func HandleGetFolderContents(c *gin.Context) {
    // Retrieve userID from the context (set by JWT middleware)
    userIDInterface, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

    userID, ok := userIDInterface.(int)
    if !ok {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID"})
        return
    }

    // Get folderID from the request body (or query parameters if preferred)
    var input struct {
        FolderID string `json:"folderID"` // folderID is now optional
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
        return
    }

    var folderID *primitive.ObjectID
    if input.FolderID != "" {
        // Convert folderID from string to ObjectID
        id, err := primitive.ObjectIDFromHex(input.FolderID)
        if err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid folder ID"})
            return
        }
        folderID = &id
    } else {
        // folderID is nil, indicating the root folder
        folderID = nil
    }

    folder, subFolders, files, err := db.GetFolderContents(userID, folderID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch folder contents: %v", err)})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "folder":     folder,
        "subFolders": subFolders,
        "files":      files,
    })
}

func HandleMoveItem(c *gin.Context) {
    // var input MoveItemInput

}

