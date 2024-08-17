package auth

import (
    "net/http"
    "net/http/httptest"
    "testing"
    "github.com/gin-gonic/gin"
    "encoding/json"
    "strings"
    "github.com/stretchr/testify/assert"
)

func TestValidateName(t *testing.T) {
    cases := []struct {
        name      string
        minLength bool
        isAlpha   bool
    }{
        {"John", true, true},
        {"A", false, true},
        {"123", true, false},
        {"John Doe", true, true},
        {"", false, false},
    }

    for _, c := range cases {
        minLength, isAlpha := validateName(c.name)
        if minLength != c.minLength || isAlpha != c.isAlpha {
            t.Errorf("validateName(%q) = (%v, %v); want (%v, %v)", c.name, minLength, isAlpha, c.minLength, c.isAlpha)
        }
    }
}

func TestHandleCreateAccount(t *testing.T) {
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
    err := json.Unmarshal(recorder.Body.Bytes(), &response)
    if err != nil {
        t.Fatalf("Error parsing response: %v", err)
    }

    assert.Equal(t, "Account created successfully", response["message"])
}
