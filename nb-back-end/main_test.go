package main

import (
    "bytes"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
)

func TestHandleCreateAccount(t *testing.T) {
    // Set Gin to test mode
    gin.SetMode(gin.TestMode)

    // Create a new Gin router
    router := gin.Default()
    router.POST("/auth/create-account", handleCreateAccount)

    // Create a test request body
    requestBody := `{
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "username": "johndoe",
        "password": "password123",
        "confirmPassword": "password123",
        "birthDate": "1990-01-01"
    }`

    // Create a new HTTP request
    req, err := http.NewRequest(http.MethodPost, "/auth/create-account", bytes.NewBuffer([]byte(requestBody)))
    assert.NoError(t, err)
    req.Header.Set("Content-Type", "application/json")

    // Create a response recorder
    rr := httptest.NewRecorder()

    // Serve the HTTP request
    router.ServeHTTP(rr, req)

    // Check the status code
    assert.Equal(t, http.StatusOK, rr.Code)

    // Check the response body
    expectedResponse := `{"message":"Account created successfully"}`
    assert.JSONEq(t, expectedResponse, rr.Body.String())
}