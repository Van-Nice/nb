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
