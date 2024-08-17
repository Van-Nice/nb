package main

import (
    "context"
    "fmt"
    "github.com/jackc/pgx/v4"
    "log"
)

func main() {
    conn, err := pgx.Connect(context.Background(), "postgres://username:password@localhost:5432/mydb")
    if err != nil {
        log.Fatal(err)
    }
    defer conn.Close(context.Background())

    commandTag, err := conn.Exec(context.Background(), "INSERT INTO mytable (name) VALUES ($1)", "John Doe")
    if err != nil {
        log.Fatal(err)
    }

    fmt.Println(commandTag.RowsAffected())
}