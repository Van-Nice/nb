package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// HANDLE POSTGRES DB
type User struct {
    UserID        int       `json:"user_id"`
    FirstName     string    `json:"first_name"`
    LastName      string    `json:"last_name"`
    Username      string    `json:"username"`
    Email         string    `json:"email"`
    CreatedAt     time.Time `json:"created_at"`
    EmailValidated bool     `json:"email_validated"`
}

type UserSettings struct {
    UserID                int    `json:"user_id"`
    Theme                 string `json:"theme"`
    FontFamily            string `json:"font_family"`
    FontSize              int    `json:"font_size"`
    LineHeight            float64 `json:"line_height"`
    AutoSave              bool   `json:"auto_save"`
    AutoSaveInterval      int    `json:"auto_save_interval"`
    HighlightCurrentLine  bool   `json:"highlight_current_line"`
    ShowLineNumbers       bool   `json:"show_line_numbers"`
    DefaultLanguage       string `json:"default_language"`
    SyntaxHighlighting    bool   `json:"syntax_highlighting"`
    EditorLayout          string `json:"editor_layout"`
    CursorBlinkRate       int    `json:"cursor_blink_rate"`
    BracketMatching       bool   `json:"bracket_matching"`
    SnippetsEnabled       bool   `json:"snippets_enabled"`
    SpellCheck            bool   `json:"spell_check"`
    IndentGuides          bool   `json:"indent_guides"`
    WordWrapColumn        int    `json:"word_wrap_column"`
}

var authDB *pgxpool.Pool

func InitAuthDB() {
    var err error
    connStr := fmt.Sprintf(
        "postgres://%s:%s@%s:%s/%s",
        os.Getenv("POSTGRES_DB_USER"),
        os.Getenv("POSTGRES_DB_PASSWORD"),
        os.Getenv("POSTGRES_DB_HOST"),
        os.Getenv("POSTGRES_DB_PORT"),
        os.Getenv("POSTGRES_DB_NAME"), // Switch to toggle in and out of test db
    )
    authDB, err = pgxpool.Connect(context.Background(), connStr)
    if err != nil {
        log.Fatalf("Unable to connect to database: %v\n", err)
    }
    fmt.Println("Connected to: authDB")
}

func CloseAuthDB() {
    authDB.Close()
    log.Printf("Disconnected from: authDB")
}

// Exec executes a given SQL statement with arguments and returns an error if any.
func Exec(sql string, args ...interface{}) error {
    ctx := context.Background()
    _, err := authDB.Exec(ctx, sql, args...)
    if err != nil {
        return fmt.Errorf("Exec failed: %v", err)
    }
    return nil
}

// GetUserByToken retrieves a user by their confirmation token.
func GetUserByToken(token string) (int, time.Time, error) {
    var userID int
    var tokenExpiration time.Time

    err := authDB.QueryRow(context.Background(), "SELECT user_id, token_expiration FROM users WHERE token = $1", token).Scan(&userID, &tokenExpiration)
    if err != nil {
        log.Printf("There was an error fetching data from db")
        return 0, time.Time{}, fmt.Errorf("QueryRow failed: %v", err)
    }

    return userID, tokenExpiration, nil
}

func GetUserByEmail(email string) (int, string, string, string, string, time.Time, error) {
    var userID int
    var firstName, lastName, username, password string
    var createdAt time.Time
    var emailValidated bool

    // Execute the query to retrieve the user details by email
    err := authDB.QueryRow(context.Background(), 
        "SELECT user_id, first_name, last_name, username, password, created_at, email_validated FROM users WHERE email = $1", 
        email).Scan(&userID, &firstName, &lastName, &username, &password, &createdAt, &emailValidated)
    
    if err != nil {
        log.Printf("Error fetching user by email: %v", err)
        return 0, "", "", "", "", time.Time{}, fmt.Errorf("QueryRow failed: %v", err)
    }

    // Check if email is validated
    if !emailValidated {
        return 0, "", "", "", "", time.Time{}, fmt.Errorf("email not validated")
    }

    return userID, firstName, lastName, username, password, createdAt, nil
}

// HANDLE MONGO DB
var ContentDB *mongo.Client

// File represents a file in the database
type File struct {
    ID             primitive.ObjectID  `bson:"_id,omitempty"`
    UserID         int                 `bson:"user_id"`
    FileName       string              `bson:"file_name"`
    TimeCreated    time.Time           `bson:"time_created"`
    Content        string              `bson:"content"`
    ParentFolderID *primitive.ObjectID `bson:"parent_folder_id,omitempty"`
    IsDeleted      bool               `bson:"is_deleted"`
}

// NewFile creates a new File instance
func NewFile(userID int, fileName string, parentFolderID *primitive.ObjectID) File {
    return File{
        ID:             primitive.NewObjectID(),
        UserID:         userID,
        FileName:       fileName,
        TimeCreated:    time.Now(),
        Content:        "",
        ParentFolderID: parentFolderID,
        IsDeleted: false,
    }
}


type Folder struct {
    ID             primitive.ObjectID  `bson:"_id,omitempty"`
    UserID         int                 `bson:"user_id"`
    FolderName     string              `bson:"folder_name"`
    TimeCreated    time.Time           `bson:"time_created"`
    ParentFolderID *primitive.ObjectID `bson:"parent_folder_id,omitempty"`
    IsDeleted      bool               `bson:"is_deleted"`
}

func NewFolder(userID int, folderName string, parentFolderID *primitive.ObjectID) Folder {
    return Folder{
        ID:             primitive.NewObjectID(),
        UserID:         userID,
        FolderName:     folderName,
        TimeCreated:    time.Now(),
        ParentFolderID: parentFolderID,
        IsDeleted: false,
    }
}

func InitContentDB() {
    var err error
    mongoURI := os.Getenv("MONGO_CONNECTION_STRING")
    clientOptions := options.Client().ApplyURI(mongoURI)

    ContentDB, err = mongo.Connect(context.Background(), clientOptions)
    if err != nil {
        log.Fatalf("Failed to connect to ContentDB: %v", err)
    }

    // Ping db to verify connection
    err = ContentDB.Ping(context.Background(), nil)
    if err != nil {
        log.Fatalf("Failed to ping ContentDB: %v", err)
    }
    log.Println("Connected to: ContentDB")
}

func CloseContentDB() {
    if err := ContentDB.Disconnect(context.Background()); err != nil {
        log.Fatalf("Failed to disconnect ContentDB: %v", err)
    }
    log.Printf("Disconnected from: ContentDB")
}

// InsertFile inserts a new file into the "files" collection inContentDB 
func InsertFile(file File) (string, error) {
    collection := ContentDB.Database("nbdb").Collection("files")
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    result, err := collection.InsertOne(ctx, file)
    if err != nil {
        return "", err
    }

    // Convert the InsertedID to a UUID string
    insertedID := result.InsertedID.(primitive.ObjectID).Hex()

    return insertedID, nil
}

func InsertFolder(folder Folder) (string, error) {
    collection := ContentDB.Database("nbdb").Collection("folders")
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    result, err := collection.InsertOne(ctx, folder)
    if err != nil {
        return "", err
    }

    // Convert InsertedID to a UUID string
    insertedID := result.InsertedID.(primitive.ObjectID).Hex()
    return insertedID, nil
}

func InsertUserSettings(userID int) error {
    sql := `
    INSERT INTO user_settings (
        user_id
    ) VALUES ($1)
    `

    err := Exec(sql, userID)
    if err != nil {
        return fmt.Errorf("InsertUserSettings failed: %v", err)
    }
    return nil
}

func GetUserByID(userID int) (*User, error) {
    var user User

    // Execute the query to retrieve the user details by user ID
    err := authDB.QueryRow(context.Background(),
        "SELECT user_id, first_name, last_name, username, email, created_at, email_validated FROM users WHERE user_id = $1",
        userID).Scan(&user.UserID, &user.FirstName, &user.LastName, &user.Username, &user.Email, &user.CreatedAt, &user.EmailValidated)
    if err != nil {
        log.Printf("Error fetching user by ID: %v", err)
        return nil, fmt.Errorf("QueryRow failed: %v", err)
    }

    return &user, nil
}

func QueryRow(ctx context.Context, query string, args ...interface{}) pgx.Row {
    return authDB.QueryRow(ctx, query, args...)
}

// GetUserSettingsByID retrieves the user settings by user ID
func GetUserSettingsByID(userID int) (UserSettings, error) {
    var settings UserSettings
    sql := `SELECT user_id, theme, font_family, font_size, line_height, auto_save, auto_save_interval, highlight_current_line, show_line_numbers, default_language, syntax_highlighting, editor_layout, cursor_blink_rate, bracket_matching, snippets_enabled, spell_check, indent_guides, word_wrap_column FROM user_settings WHERE user_id = $1`
    row := authDB.QueryRow(context.Background(), sql, userID)
    err := row.Scan(
        &settings.UserID,
        &settings.Theme,
        &settings.FontFamily,
        &settings.FontSize,
        &settings.LineHeight,
        &settings.AutoSave,
        &settings.AutoSaveInterval,
        &settings.HighlightCurrentLine,
        &settings.ShowLineNumbers,
        &settings.DefaultLanguage,
        &settings.SyntaxHighlighting,
        &settings.EditorLayout,
        &settings.CursorBlinkRate,
        &settings.BracketMatching,
        &settings.SnippetsEnabled,
        &settings.SpellCheck,
        &settings.IndentGuides,
        &settings.WordWrapColumn,
    )
    if err != nil {
        if err == pgx.ErrNoRows {
            return settings, nil // No settings found, return empty settings
        }
        return settings, fmt.Errorf("GetUserSettingsByID failed: %v", err)
    }
    fmt.Println(settings)
    return settings, nil
}

func GetFolderContents(userID int, folderID *primitive.ObjectID) (Folder, []Folder, []File, error) {
    var folder Folder
    var subFolders []Folder
    var files []File

    collection := ContentDB.Database("nbdb").Collection("folders")
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    if folderID != nil {
        // Fetch the folder by its ID and user ID
        err := collection.FindOne(ctx, bson.M{"_id": *folderID, "user_id": userID, "is_deleted": false}).Decode(&folder)
        if err != nil {
            return Folder{}, nil, nil, fmt.Errorf("failed to fetch folder: %v", err)
        }
    } else {
        // Set folder as empty since we're at the root
        folder = Folder{}
    }

    // Fetch sub-folders
    subFoldersFilter := bson.M{
        "user_id": userID,
        "is_deleted": false,
    }

    if folderID == nil {
        // Fetch folders where ParentFolderID is null (root-level folders)
        subFoldersFilter["parent_folder_id"] = bson.M{"$exists": false}
    } else {
        // Fetch folders where ParentFolderID matches the current folder
        subFoldersFilter["parent_folder_id"] = *folderID
    }

    cursor, err := collection.Find(ctx, subFoldersFilter)
    if err != nil {
        return Folder{}, nil, nil, fmt.Errorf("failed to fetch sub-folders: %v", err)
    }
    defer cursor.Close(ctx)

    for cursor.Next(ctx) {
        var subFolder Folder
        if err := cursor.Decode(&subFolder); err != nil {
            return Folder{}, nil, nil, fmt.Errorf("failed to decode subfolder: %v", err)
        }
        subFolders = append(subFolders, subFolder)
    }

    // Fetch files
    fileCollection := ContentDB.Database("nbdb").Collection("files")
    filesFilter := bson.M{
        "user_id": userID,
        "is_deleted": false,
    }

    if folderID == nil {
        // Fetch files where ParentFolderID is null (root-level files)
        filesFilter["parent_folder_id"] = bson.M{"$exists": false}
    } else {
        // Fetch files where ParentFolderID matches the current folder
        filesFilter["parent_folder_id"] = *folderID
    }

    fileCursor, err := fileCollection.Find(ctx, filesFilter)
    if err != nil {
        return Folder{}, nil, nil, fmt.Errorf("failed to fetch files: %v", err)
    }
    defer fileCursor.Close(ctx)

    for fileCursor.Next(ctx) {
        var file File
        if err := fileCursor.Decode(&file); err != nil {
            return Folder{}, nil, nil, fmt.Errorf("failed to decode file: %v", err)
        }
        files = append(files, file)
    }

    return folder, subFolders, files, nil
}

func GetDeletedItems(userID int) ([]Folder, []File, error) {
    var deletedFolders []Folder
    var deletedFiles []File

    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    // Fetch deleted folders
    folderCollection := ContentDB.Database("nbdb").Collection("folders")
    folderFilter := bson.M{
        "user_id":    userID,
        "is_deleted": true,
    }

    folderCursor, err := folderCollection.Find(ctx, folderFilter)
    if err != nil {
        return nil, nil, fmt.Errorf("failed to fetch deleted folders: %v", err)
    }
    defer folderCursor.Close(ctx)

    for folderCursor.Next(ctx) {
        var folder Folder
        if err := folderCursor.Decode(&folder); err != nil {
            return nil, nil, fmt.Errorf("failed to decode folder: %v", err)
        }
        deletedFolders = append(deletedFolders, folder)
    }

    // Fetch deleted files
    fileCollection := ContentDB.Database("nbdb").Collection("files")
    fileFilter := bson.M{
        "user_id":    userID,
        "is_deleted": true,
    }

    fileCursor, err := fileCollection.Find(ctx, fileFilter)
    if err != nil {
        return nil, nil, fmt.Errorf("failed to fetch deleted files: %v", err)
    }
    defer fileCursor.Close(ctx)

    for fileCursor.Next(ctx) {
        var file File
        if err := fileCursor.Decode(&file); err != nil {
            return nil, nil, fmt.Errorf("failed to decode file: %v", err)
        }
        deletedFiles = append(deletedFiles, file)
    }
    fmt.Println(deletedFiles, deletedFiles);

    return deletedFolders, deletedFiles, nil
}

// GetAllFolders fetches all folders for a given user from the database
func GetAllFolders(userID int) ([]Folder, error) {
    var folders []Folder

    collection := ContentDB.Database("nbdb").Collection("folders")
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    cursor, err := collection.Find(ctx, bson.M{"user_id": userID, "is_deleted": false})
    if err != nil {
        return nil, fmt.Errorf("failed to fetch folders: %v", err)
    }
    defer cursor.Close(ctx)

    for cursor.Next(ctx) {
        var folder Folder
        if err := cursor.Decode(&folder); err != nil {
            return nil, fmt.Errorf("failed to decode folder: %v", err)
        }
        folders = append(folders, folder)
    }

    return folders, nil
}

// FolderNode represents a folder in the nested structure
type FolderNode struct {
    ID             primitive.ObjectID `json:"id"`
    FolderName     string             `json:"folderName"`
    SubFolders     []*FolderNode      `json:"subFolders"`
}

// BuildFolderTree builds a nested folder structure from a flat list of folders
func BuildFolderTree(folders []Folder) []*FolderNode {
    folderMap := make(map[primitive.ObjectID]*FolderNode)
    var rootFolders []*FolderNode

    // Initialize folder nodes and map them by ID
    for _, folder := range folders {
        folderNode := &FolderNode{
            ID:         folder.ID,
            FolderName: folder.FolderName,
            SubFolders: []*FolderNode{},
        }
        folderMap[folder.ID] = folderNode
    }

    // Build the tree structure
    for _, folder := range folders {
        if folder.ParentFolderID == nil {
            // Root folder
            rootFolders = append(rootFolders, folderMap[folder.ID])
        } else {
            // Sub-folder
            parentFolderNode, exists := folderMap[*folder.ParentFolderID]
            if !exists {
                log.Printf("Parent folder with ID %v not found for folder %v", *folder.ParentFolderID, folder.ID)
                continue
            }
            parentFolderNode.SubFolders = append(parentFolderNode.SubFolders, folderMap[folder.ID])
        }
    }

    return rootFolders
}

func GetFileByID(fileID primitive.ObjectID) (*File, error) {
    collection := ContentDB.Database("nbdb").Collection("files")
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    var file File
    err := collection.FindOne(ctx, bson.M{"_id": fileID}).Decode(&file)
    if err != nil {
        return nil, err
    }

    return &file, nil
}

func RenameFile(userID int, fileID primitive.ObjectID, newFileName string) error {
    collection := ContentDB.Database("nbdb").Collection("files")
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    filter := bson.M{
        "_id":     fileID,
        "user_id": userID, // Ensure the user owns the file
    }

    update := bson.M{
        "$set": bson.M{
            "file_name": newFileName,
        },
    }

    result, err := collection.UpdateOne(ctx, filter, update)
    if err != nil {
        return err
    }

    if result.MatchedCount == 0 {
        return fmt.Errorf("file not found or you do not have permission to rename it")
    }

    return nil
}

// MoveFile moves a file to a new folder
func MoveFile(userID int, fileID primitive.ObjectID, targetFolderID *primitive.ObjectID) error {
    collection := ContentDB.Database("nbdb").Collection("files")
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    // Ensure the user owns the file
    filter := bson.M{
        "_id":       fileID,
        "user_id":   userID,
        "is_deleted": false,
    }

    update := bson.M{
        "$set": bson.M{
            "parent_folder_id": targetFolderID,
        },
    }

    result, err := collection.UpdateOne(ctx, filter, update)
    if err != nil {
        return fmt.Errorf("failed to move file: %v", err)
    }

    if result.MatchedCount == 0 {
        return fmt.Errorf("file not found or you do not have permission to move it")
    }

    return nil
}

// MoveFolder moves a folder to a new parent folder
func MoveFolder(userID int, folderID primitive.ObjectID, targetFolderID *primitive.ObjectID) error {
    collection := ContentDB.Database("nbdb").Collection("folders")
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    // Ensure the user owns the folder
    filter := bson.M{
        "_id":       folderID,
        "user_id":   userID,
        "is_deleted": false,
    }

    // Check for circular reference
    if targetFolderID != nil {
        isDescendant, err := IsDescendantFolder(folderID, *targetFolderID)
        if err != nil {
            return fmt.Errorf("failed to check folder hierarchy: %v", err)
        }
        if isDescendant {
            return fmt.Errorf("cannot move a folder into one of its subfolders")
        }
    }

    update := bson.M{
        "$set": bson.M{
            "parent_folder_id": targetFolderID,
        },
    }

    result, err := collection.UpdateOne(ctx, filter, update)
    if err != nil {
        return fmt.Errorf("failed to move folder: %v", err)
    }

    if result.MatchedCount == 0 {
        return fmt.Errorf("folder not found or you do not have permission to move it")
    }

    return nil
}

// FolderExistsAndOwnedByUser checks if a folder exists and is owned by the user
func FolderExistsAndOwnedByUser(userID int, folderID primitive.ObjectID) (bool, error) {
    collection := ContentDB.Database("nbdb").Collection("folders")
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    count, err := collection.CountDocuments(ctx, bson.M{
        "_id":       folderID,
        "user_id":   userID,
        "is_deleted": false,
    })
    if err != nil {
        return false, err
    }

    return count > 0, nil
}

// IsDescendantFolder checks if potentialDescendantID is a descendant of folderID
func IsDescendantFolder(folderID, potentialDescendantID primitive.ObjectID) (bool, error) {
    if folderID == potentialDescendantID {
        return true, nil
    }

    collection := ContentDB.Database("nbdb").Collection("folders")
    ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
    defer cancel()

    var folder Folder
    err := collection.FindOne(ctx, bson.M{"_id": potentialDescendantID}).Decode(&folder)
    if err != nil {
        if err == mongo.ErrNoDocuments {
            return false, nil
        }
        return false, err
    }

    if folder.ParentFolderID == nil {
        return false, nil
    }

    return IsDescendantFolder(folderID, *folder.ParentFolderID)
}

func SearchFilesAndFolders(userID int, query string) ([]bson.M, error) {
    var results []bson.M
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    // Prepare regex for case-insensitive search
    searchRegex := bson.M{"$regex": query, "$options": "i"}

    // Search in files
    fileCollection := ContentDB.Database("nbdb").Collection("files")
    fileFilter := bson.M{
        "user_id": userID,
        "$or": []bson.M{
            {"file_name": searchRegex},
            {"content": searchRegex},
        },
        "is_deleted": false,
    }

    // Use projection to exclude unwanted fields if necessary
    fileOptions := options.Find()

    fileCursor, err := fileCollection.Find(ctx, fileFilter, fileOptions)
    if err != nil {
        return nil, fmt.Errorf("failed to search files: %v", err)
    }
    defer fileCursor.Close(ctx)

    for fileCursor.Next(ctx) {
        var file bson.M
        if err := fileCursor.Decode(&file); err != nil {
            return nil, fmt.Errorf("failed to decode file: %v", err)
        }
        file["type"] = "file" // Add a type field to distinguish files and folders
        results = append(results, file)
    }

    // Search in folders
    folderCollection := ContentDB.Database("nbdb").Collection("folders")
    folderFilter := bson.M{
        "user_id":     userID,
        "folder_name": searchRegex,
        "is_deleted":  false,
    }

    folderCursor, err := folderCollection.Find(ctx, folderFilter)
    if err != nil {
        return nil, fmt.Errorf("failed to search folders: %v", err)
    }
    defer folderCursor.Close(ctx)

    for folderCursor.Next(ctx) {
        var folder bson.M
        if err := folderCursor.Decode(&folder); err != nil {
            return nil, fmt.Errorf("failed to decode folder: %v", err)
        }
        folder["type"] = "folder" // Add a type field
        results = append(results, folder)
    }

    return results, nil
}