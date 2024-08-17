// nb-back-end/db.go
package main

import (
    "context"
    "fmt"
    "log"
    "github.com/jackc/pgx/v4"
)

var db *pgx.Conn

func initDB() {
    var err error
    db, err = pgx.Connect(context.Background(), "postgres://username:password@localhost:5432/dbname")
    if err != nil {
        log.Fatalf("Unable to connect to database: %v\n", err)
    }
    fmt.Println("Connected to the database")
}

func closeDB() {
    db.Close(context.Background())
}