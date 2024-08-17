package auth

import (
    "testing"
    "encoding/json"
    "github.com/joho/godotenv"
    "nb-back-end/db"
    "github.com/gin-gonic/gin"
    "net/http"
    "net/http/httptest"
    "strings"
    "github.com/stretchr/testify/assert"
)

func TestHandleCreateAccount(t *testing.T) {
    // Load environment variables from .env file
    err := godotenv.Load("../.env") // Ensure this path is correct relative to the test file
    if err != nil {
        t.Fatalf("Error loading .env file: %v", err)
    }

    // Initialize the database connection
    db.InitDB()
    defer db.CloseDB()

    gin.SetMode(gin.TestMode)

    router := gin.Default()
    router.POST("/auth/create-account", HandleCreateAccount)

    payload := `{
        "first_name": "John",
        "last_name": "Doe",
        "email": "johndoe@example.com",
        "username": "johndoe",
        "password": "Password1!",
        "confirm_password": "Password1!",
        "birth_date": "2000-01-01"
    }`

    req, _ := http.NewRequest(http.MethodPost, "/auth/create-account", strings.NewReader(payload))
    req.Header.Set("Content-Type", "application/json")
    recorder := httptest.NewRecorder()

    router.ServeHTTP(recorder, req)

    assert.Equal(t, http.StatusOK, recorder.Code)

    var response map[string]string
    err = json.Unmarshal(recorder.Body.Bytes(), &response)
    if err != nil {
        t.Fatalf("Error parsing response: %v", err)
    }

    assert.Equal(t, "Account created successfully", response["message"])
    t.Logf("Response body: %s", recorder.Body.String())
}
