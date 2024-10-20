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
	// "go.mongodb.org/mongo-driver/mongo"
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
    IsDeleted      bool                `bson:"is_deleted"`
}

type Folder struct {
    ID             primitive.ObjectID  `bson:"_id,omitempty"`
    UserID         int                 `bson:"user_id"`
    FolderName     string              `bson:"folder_name"`
    TimeCreated    time.Time           `bson:"time_created"`
    ParentFolderID *primitive.ObjectID `bson:"parent_folder_id,omitempty"`
    IsDeleted      bool                `bson:"is_deleted"` // Add this field
}

type MoveItemInput struct {
    ItemID         string `json:"itemID"`
    TargetFolderID string `json:"targetFolderID"`
    ItemType       string `json:"itemType"`
}

type HandleDeleteInput struct {
    ItemID         string `json:"itemID" binding:"required"`
    ItemType       string `json:"itemType" binding:"required"`
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
    var input MoveItemInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    } 
    // Log the input for debugging
    fmt.Printf("MoveItemInput: %+v\n", input)
  
    itemID, err := primitive.ObjectIDFromHex(input.ItemID)
    if err != nil {
      c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
      return
    }
  
    targetFolderID, err := primitive.ObjectIDFromHex(input.TargetFolderID)
    if err != nil {
      c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid target folder ID"})
      return
    }
  
    // Move the file or folder based on the itemType
    if input.ItemType == "file" {
      // Update the file's ParentFolderID
      collection := db.ContentDB.Database("nbdb").Collection("files")
      _, err := collection.UpdateOne(context.TODO(), bson.M{"_id": itemID}, bson.M{"$set": bson.M{"parent_folder_id": targetFolderID}})
      if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to move file"})
        return
      }
    } else if input.ItemType == "folder" {
      // Update the folder's ParentFolderID
      collection := db.ContentDB.Database("nbdb").Collection("folders")
      _, err := collection.UpdateOne(context.TODO(), bson.M{"_id": itemID}, bson.M{"$set": bson.M{"parent_folder_id": targetFolderID}})
      if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to move folder"})
        return
      }
    }
  
    c.JSON(http.StatusOK, gin.H{"message": "Item moved successfully"})
}

func HandleDeleteItem(c *gin.Context) {
    var input HandleDeleteInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

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

    // Convert itemID from string to ObjectID
    itemID, err := primitive.ObjectIDFromHex(input.ItemID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item ID"})
        return
    }

    // Determine which collection to update based on itemType
    var collectionName string
    if input.ItemType == "file" {
        collectionName = "files"
    } else if input.ItemType == "folder" {
        collectionName = "folders"
    } else {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid item type"})
        return
    }

    // Get the collection
    collection := db.ContentDB.Database("nbdb").Collection(collectionName)

    // Build the filter and update
    filter := bson.M{
        "_id":     itemID,
        "user_id": userID, // Ensure the user owns the item
    }
    update := bson.M{
        "$set": bson.M{
            "is_deleted": true,
        },
    }

    // Perform the update operation
    result, err := collection.UpdateOne(context.TODO(), filter, update)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to mark item as deleted"})
        return
    }

    if result.MatchedCount == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "Item not found or you do not have permission to delete it"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Item marked as deleted successfully"})
}

func HandleGetDeletedItems(c *gin.Context) {
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

    // Fetch deleted items from the database
    deletedFolders, deletedFiles, err := db.GetDeletedItems(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch deleted items: %v", err)})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "deletedFolders": deletedFolders,
        "deletedFiles":   deletedFiles,
    })
}

// HandleGetNestedFolders handles the request to get nested folders
func HandleGetNestedFolders(c *gin.Context) {
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

    // Fetch all folders for the user
    folders, err := db.GetAllFolders(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch folders: %v", err)})
        return
    }

    // Build the nested folder structure
    nestedFolders := db.BuildFolderTree(folders)

    c.JSON(http.StatusOK, gin.H{"folders": nestedFolders})
}

func HandleGetFileName(c *gin.Context) {
    fileID := c.Query("id")
    fmt.Println(fileID)
    // Check if fileID is empty
    if fileID == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "File ID is required"})
        return
    }

    // Attempt to convert fileID to ObjectID
    id, err := primitive.ObjectIDFromHex(fileID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file ID"})
        return
    }

    // Proceed with fetching the file using the valid ObjectID
    file, err := db.GetFileByID(id)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to fetch file: %v", err)})
        return
    }

    c.JSON(http.StatusOK, gin.H{"file": file})
}

func HandleRenameFile(c *gin.Context) {
    // Retrieve userID from the context
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
        FileID      string `json:"fileID" binding:"required"`
        NewFileName string `json:"newFileName" binding:"required"`
    }

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    fileID, err := primitive.ObjectIDFromHex(input.FileID)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid file ID"})
        return
    }

    // Update the file's name in the database
    err = db.RenameFile(userID, fileID, input.NewFileName)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to rename file: %v", err)})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "File renamed successfully"})
}
