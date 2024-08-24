package db

import (
    "context"
    "fmt"
    "log"
    "os"
    "time"
    "github.com/jackc/pgx/v4"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

var authDB *pgx.Conn

func InitAuthDB() {
    var err error
    connStr := fmt.Sprintf(
        "postgres://%s:%s@%s:%s/%s",
        os.Getenv("POSTGRES_DB_USER"),
        os.Getenv("POSTGRES_DB_PASSWORD"),
        os.Getenv("POSTGRES_DB_HOST"),
        os.Getenv("POSTGRES_DB_PORT"),
        os.Getenv("POSTGRES_TEST_DB_NAME"), // Switch to toggle in and out of test db
    )
    authDB, err = pgx.Connect(context.Background(), connStr)
    if err != nil {
        log.Fatalf("Unable to connect to database: %v\n", err)
    }
    fmt.Println("Connected to: authDB")
}

func CloseAuthDB() {
    authDB.Close(context.Background())
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

    // log.Printf("Executing query: SELECT user_id, token_expiration FROM users WHERE token = $1 with token: %s", token)
    err := authDB.QueryRow(context.Background(), "SELECT user_id, token_expiration FROM users WHERE token = $1", token).Scan(&userID, &tokenExpiration)
    if err != nil {
        log.Printf("There was an error fetching data from db")
        return 0, time.Time{}, fmt.Errorf("QueryRow failed: %v", err)
    }

    // log.Printf("Query result: userID = %d, tokenExpiration = %s", userID, tokenExpiration)
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
        return 0, "", "", "", "", time.Time{}, fmt.Errorf("Email not validated")
    }

    return userID, firstName, lastName, username, password, createdAt, nil
}

// Connect to mongo
var contentDB *mongo.Client

// File represents the structure of a file document incontentDB 
type File struct {
	ID         primitive.ObjectID `bson:"_id,omitempty"`
	UserID     primitive.ObjectID `bson:"user_id"`
	FolderID   primitive.ObjectID `bson:"folder_id,omitempty"` // Folder ID is optional (could be in the root directory)
	Name       string             `bson:"name"`
	Content    string             `bson:"content"`
	CreatedAt  time.Time          `bson:"created_at"`
	UpdatedAt  time.Time          `bson:"updated_at"`
}

// Folder represents the structure of a folder document incontentDB 
type Folder struct {
	ID           primitive.ObjectID `bson:"_id,omitempty"`
	UserID       primitive.ObjectID `bson:"user_id"`
	ParentFolderID primitive.ObjectID `bson:"parent_folder_id,omitempty"` // Parent folder ID is optional
	Name         string             `bson:"name"`
	CreatedAt    time.Time          `bson:"created_at"`
	UpdatedAt    time.Time          `bson:"updated_at"`
}

func InitContentDB() {
    var err error
    mongoURI := os.Getenv("MONGO_CONNECTION_STRING")
    clientOptions := options.Client().ApplyURI(mongoURI)

    contentDB, err = mongo.Connect(context.Background(), clientOptions)
    if err != nil {
        log.Fatalf("Failed to connect to contentDB: %v", err)
    }

    // Ping db to verify connection
    err = contentDB.Ping(context.Background(), nil)
    if err != nil {
        log.Fatalf("Failed to ping contentDB: %v", err)
    }
    log.Println("Connected to: contentDB")
}

func CloseContentDB() {
    if err := contentDB.Disconnect(context.Background()); err != nil {
        log.Fatalf("Failed to disconnect contentDB: %v", err)
    }
    log.Printf("Disconnected from: contentDB")
}

// InsertFile inserts a new file into the "files" collection incontentDB 
func InsertFile(file File) (*mongo.InsertOneResult, error) {
	collection := contentDB.Database("your_database_name").Collection("files")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := collection.InsertOne(ctx, file)
	if err != nil {
		return nil, err
	}

	return result, nil
}

// InsertFolder inserts a new folder into the "folders" collection incontentDB 
func InsertFolder(folder Folder) (*mongo.InsertOneResult, error) {
	collection := contentDB.Database("your_database_name").Collection("folders")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := collection.InsertOne(ctx, folder)
	if err != nil {
		return nil, err
	}

	return result, nil
}

