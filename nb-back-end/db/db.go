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
)

var db *pgx.Conn

func InitDB() {
    var err error
    connStr := fmt.Sprintf(
        "postgres://%s:%s@%s:%s/%s",
        os.Getenv("DB_USER"),
        os.Getenv("DB_PASSWORD"),
        os.Getenv("DB_HOST"),
        os.Getenv("DB_PORT"),
        os.Getenv("DB_NAME"),
    )
    db, err = pgx.Connect(context.Background(), connStr)
    if err != nil {
        log.Fatalf("Unable to connect to database: %v\n", err)
    }
    fmt.Println("Connected to the database")
}

func CloseDB() {
    db.Close(context.Background())
}

// Exec executes a given SQL statement with arguments and returns an error if any.
func Exec(sql string, args ...interface{}) error {
    ctx := context.Background()
    _, err := db.Exec(ctx, sql, args...)
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
    err := db.QueryRow(context.Background(), "SELECT user_id, token_expiration FROM users WHERE token = $1", token).Scan(&userID, &tokenExpiration)
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
    err := db.QueryRow(context.Background(), 
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
var MongoClient *mongo.Client

func InitMongoDB() {
    var err error
    mongoURI := os.Getenv("MONGO_CONNECTION_STRING")
    clientOptions := options.Client().ApplyURI(mongoURI)

    MongoClient, err = mongo.Connect(context.Background(), clientOptions)
    if err != nil {
        log.Fatalf("Failed to connect to MongoDB: %v", err)
    }

    // Ping db to verify connection
    err = MongoClient.Ping(context.Background(), nil)
    if err != nil {
        log.Fatalf("Failed to ping MongoDB: %v", err)
    }
    log.Panicln("Connected to MongoDB")
}

func CloseMongoDB() {
    if err := MongoClient.Disconnect(context.Background()); err != nil {
        log.Fatalf("Failed to disconnect MongoDB: %v", err)
    }
    log.Printf("Disconnected from MongoDB")
}

