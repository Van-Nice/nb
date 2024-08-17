package db

import (
    "path/filepath"
    "os"
    "testing"
    "github.com/joho/godotenv"
    "github.com/stretchr/testify/assert"
)

func TestInitDB(t *testing.T) {
    // Get the absolute path to the .env file in the project root
    envPath, err := filepath.Abs("../.env")
    if err != nil {
        t.Fatalf("Error getting absolute path to .env file: %v", err)
    }

    // Load environment variables from .env file
    err = godotenv.Load(envPath)
    if err != nil {
        t.Fatalf("Error loading .env file: %v", err)
    }

    // Ensure environment variables are loaded correctly
    dbUser := os.Getenv("DB_USER")
    dbPassword := os.Getenv("DB_PASSWORD")
    dbHost := os.Getenv("DB_HOST")
    dbPort := os.Getenv("DB_PORT")
    dbName := os.Getenv("DB_NAME")

    assert.NotEmpty(t, dbUser, "DB_USER should be set")
    assert.NotEmpty(t, dbPassword, "DB_PASSWORD should be set")
    assert.NotEmpty(t, dbHost, "DB_HOST should be set")
    assert.NotEmpty(t, dbPort, "DB_PORT should be set")
    assert.NotEmpty(t, dbName, "DB_NAME should be set")

    // Attempt to initialize the database connection
    assert.NotPanics(t, func() {
        InitDB()
    }, "InitDB should not panic")

    // Ensure that the db connection is not nil
    assert.NotNil(t, db, "db should be initialized and not nil")

    // Clean up
    CloseDB()
}
