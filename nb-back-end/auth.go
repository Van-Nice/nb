package main

import (
	"fmt"
	"regexp"
    "time"
    "context"
    "github.com/gin-gonic/gin"
    "net/http"
)

func validateName(name string) (bool, bool) {
    minLength := len(name) > 1
    isAlphabetic := regexp.MustCompile(`^[A-Za-z\s]+$`).MatchString(name)
    return minLength, isAlphabetic
}

func validateEmail(email string) bool {
    return regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`).MatchString(email)
}

func validatePassword(password string) (bool, bool, bool, bool, bool, bool) {
    minLength := len(password) >= 8
    hasUpperCase := regexp.MustCompile(`[A-Z]`).MatchString(password)
    hasLowerCase := regexp.MustCompile(`[a-z]`).MatchString(password)
    hasNumber := regexp.MustCompile(`\d`).MatchString(password)
    hasSpecialChar := regexp.MustCompile(`[!@#$%^&*(),.?":{}|<>]`).MatchString(password)
    noSpaces := regexp.MustCompile(`^[^\s]+$`).MatchString(password)
    return minLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, noSpaces
}

func validateConfirmPassword(confirmPassword, password string) bool {
    return confirmPassword == password
}

func validateDate(date string) (bool, bool, bool) {
    regex := regexp.MustCompile(`^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$`)
    formatValid := regex.MatchString(date)
    year, month, day := 0, 0, 0
    fmt.Sscanf(date, "%d-%d-%d", &year, &month, &day)
    birthDate := time.Date(year, time.Month(month), day, 0, 0, 0, 0, time.UTC)
    today := time.Now()
    age := today.Year() - birthDate.Year()
    if today.YearDay() < birthDate.YearDay() {
        age--
    }
    tooYoung := age < 13
    tooOld := age > 120
    return formatValid, tooYoung, tooOld
}

// CreateAccountForm represents the form data for creating an account
type CreateAccountForm struct {
    FirstName       string `json:"first_name"`
    LastName        string `json:"last_name"`
    Email           string `json:"email"`
    Username        string `json:"username"`
    Password        string `json:"password"`
    ConfirmPassword string `json:"confirm_password"`
    BirthDate       string `json:"birth_date"`
}

func handleCreateAccount(c *gin.Context) {
    var form CreateAccountForm

    // Bind the JSON data to the struct
    if err := c.ShouldBindJSON(&form); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Validate the form data
    if minLength, isAlphabetic := validateName(form.FirstName); !minLength || !isAlphabetic {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid first name"})
        return
    }
    if minLength, isAlphabetic := validateName(form.LastName); !minLength || !isAlphabetic {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid last name"})
        return
    }
    if !validateEmail(form.Email) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid email"})
        return
    }
    if minLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, noSpaces := validatePassword(form.Password); !minLength || !hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar || !noSpaces {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid password"})
        return
    }
    if !validateConfirmPassword(form.ConfirmPassword, form.Password) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Passwords do not match"})
        return
    }
    if formatValid, tooYoung, tooOld := validateDate(form.BirthDate); !formatValid || tooYoung || tooOld {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid birth date"})
        return
    }

    // Insert data into the database
    _, err := db.Exec(context.Background(), "INSERT INTO accounts (first_name, last_name, email, username, password, birth_date) VALUES ($1, $2, $3, $4, $5, $6)",
        form.FirstName, form.LastName, form.Email, form.Username, form.Password, form.BirthDate)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create account"})
        return
    }

    // Respond with success
    c.JSON(http.StatusOK, gin.H{"message": "Account created successfully"})
}

// Add your validation functions here
// ...