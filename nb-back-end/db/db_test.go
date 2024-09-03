package db

import (
	"log"
	"os"
	"testing"

	"github.com/joho/godotenv"
)

func TestDBConnections (t *testing.T) {
    err := godotenv.Load("../.env")
    if err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }
    // Run all auth db tests
    InitAuthDB()
    defer CloseAuthDB()

    // Run all content db tests
    InitContentDB()
    defer CloseContentDB()
}

func TestExec(t *testing.T) {
    err := godotenv.Load("../.env")
    if err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }

    InitAuthDB()
    defer CloseAuthDB()

    // Create a test table
    createTableSQL := `
    CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL
    );`
    err = Exec(createTableSQL)
    if err != nil {
        t.Fatalf("Failed to create test table: %v", err)
    }

    // Insert a test record
    insertSQL := `INSERT INTO test_table (name) VALUES ($1);`
    err = Exec(insertSQL, "test_name")
    if err != nil {
        t.Fatalf("Failed to insert test record: %v", err)
    }

    // Clean up: Drop the test table
    dropTableSQL := `DROP TABLE IF EXISTS test_table;`
    err = Exec(dropTableSQL)
    if err != nil {
        t.Fatalf("Failed to drop test table: %v", err)
    }
}

func TestGetUserByEmail(t * testing.T) {
    err := godotenv.Load("../.env")
    if err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }

    InitAuthDB()
    defer CloseAuthDB()

    testEmail := os.Getenv("TEST_EMAIL")

    // Check for user in db based on email
    userID, firstName, lastName, username, password, createdAt, err := GetUserByEmail(testEmail)
    if err != nil {
        log.Println("User not found or other error occurred:", err)
    } else {
        log.Printf("User found: ID=%d, Name=%s %s, Username=%s, Password=%s, CreatedAt=%s", userID, firstName, lastName, username, password, createdAt)
    }
}

