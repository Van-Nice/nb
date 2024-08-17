package auth

import (
	"fmt"
	"log"
	"nb-back-end/db" // Import the db package
	"net/http"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
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

func hashPassword(password string) (string, error) {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return "", err
    }
    return string(hashedPassword), nil
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
    CreatedAt       time.Time `json:"created_at"`
}

func HandleCreateAccount(c *gin.Context) {
    var form CreateAccountForm

    // Bind the JSON data to the struct
    if err := c.ShouldBindJSON(&form); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Set the CreatedAt field to the current time
    form.CreatedAt = time.Now()

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

    // Create password hash
    hashedPassword, err := hashPassword(form.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }

    // Initialize the database connection
    db.InitDB()
    defer db.CloseDB()

    // Insert data into the database
    err = db.Exec("INSERT INTO users (first_name, last_name, email, username, password, date_of_birth, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        form.FirstName, form.LastName, form.Email, form.Username, hashedPassword, form.BirthDate, form.CreatedAt)
    if err != nil {
        log.Printf("Database error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create account"})
        return
    }

    // Respond with success
    c.JSON(http.StatusOK, gin.H{"message": "Account created successfully"})
}
