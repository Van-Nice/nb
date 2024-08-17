package main

import (
    "context"
    "testing"
    "github.com/jackc/pgx/v4"
)

func TestDatabaseInsert(t *testing.T) {
    conn, err := pgx.Connect(context.Background(), "postgres://username:password@localhost:5432/mydb")
    if err != nil {
        t.Fatalf("Failed to connect to database: %v", err)
    }
    defer conn.Close(context.Background())

    commandTag, err := conn.Exec(context.Background(), "INSERT INTO mytable (name) VALUES ($1)", "Test User")
    if err != nil {
        t.Fatalf("Failed to execute insert: %v", err)
    }

    if commandTag.RowsAffected() != 1 {
        t.Errorf("Expected 1 row to be affected, got %d", commandTag.RowsAffected())
    }
}
