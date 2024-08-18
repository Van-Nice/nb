package auth

import (
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"fmt"
	"log"
	"nb-back-end/db"
	"nb-back-end/emailer"
	"net/http"
	"os"
	"regexp"
	"strconv"
	"time"
	"unicode"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func validateName(name string) (bool, bool) {
    minLength := len(name) >= 2
    isAlphabetic := true
    for _, char := range name {
        if !unicode.IsLetter(char) {
            isAlphabetic = false
            break
        }
    }
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

func generateToken(length int) (string, error) {
    token := make([]byte, length)
    _, err := rand.Read(token)
    if err != nil {
        return "", err
    }
    return base64.RawURLEncoding.EncodeToString(token), nil
}

// CreateAccountForm represents the form data for creating an account
type CreateAccountForm struct {
	FirstName       string    `json:"firstName"`
	LastName        string    `json:"lastName"`
	Email           string    `json:"email"`
	Username        string    `json:"username"`
	Password        string    `json:"password"`
	BirthDate       string    `json:"birthDate"`
}

// Create account
func HandleCreateAccount(c *gin.Context) {
    var form CreateAccountForm

    // Bind the JSON data to the struct
    if err := c.ShouldBindJSON(&form); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Validate the form data
    minLength, isAlphabetic := validateName(form.FirstName)
    if !minLength || !isAlphabetic {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid first name"})
        return
    }
    if minLength, isAlphabetic := validateName(form.LastName); minLength && isAlphabetic {
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
    // TODO: log tokenExpiration & token as well as their types
    
    // Set the CreatedAt field to the current time
    createdAt := time.Now()
    tokenExpiration := time.Now().Add(24 * time.Hour)

    // Generate confirmation token
    token, err := generateToken(32)
    if err != nil {
        log.Printf("Error generating confirmation token: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate confirmation token"})
        return
    }
    fmt.Printf("token: %v, type: %T\n", token, token)
    fmt.Printf("tokenExpiration: %v, type: %T\n", tokenExpiration, tokenExpiration)

    // Insert data into the database
    err = db.Exec("INSERT INTO users (first_name, last_name, email, username, password, date_of_birth, created_at, token, token_expiration, email_validated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
    form.FirstName, form.LastName, form.Email, form.Username, string(hashedPassword), form.BirthDate, createdAt, token, tokenExpiration, false)
    if err != nil {
        log.Printf("Database error: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create account"})
        return
    } 

    // Load environment variables from .env file
    envErr := godotenv.Load(".env") // Ensure this path is correct relative to the test file
    if envErr != nil {
        log.Fatalf("Error loading .env file: %v", envErr)
    }

    portStr := os.Getenv("EMAIL_PORT")
    port, err := strconv.Atoi(portStr)
    if err != nil {
        log.Fatalf("Error converting EMAIL_PORT to integer: %v", err)
    }

    config := emailer.Config{
        SMTPHost:    os.Getenv("EMAIL_HOST"),
        SMTPPort:    port,
        SenderEmail: os.Getenv("EMAIL"),
        SenderName:  "Bungo",
        SenderPass:  os.Getenv("EMAIL_PASSWORD"),
    }

    emailService := emailer.NewEmailer(config)

    err = emailService.SendConfirmationEmail(
        form.Email,
        form.Username,
        "http://localhost:3000/email-confirmation?token=" + token,
    )
    if err != nil {
        log.Printf("Error sending confirmation email: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send confirmation email"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Account created successfully"})
}

// verify email
func HandleVerifyEmail(c *gin.Context) {
    token := c.Query("token")
    if token == "" {
        log.Printf("Token was empty")
        c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
        return
    }

    // Retrieve user by token
    userID, tokenExpiration, err := db.GetUserByToken(token)
    if err == sql.ErrNoRows {
        log.Printf("Could not get user by token!")
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
        return
    } else if err != nil {
        log.Printf("There was a database error")
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
        return
    }

    // Log the userID and tokenExpiration
    log.Printf("UserID: %v, TokenExpiration: %v", userID, tokenExpiration)

    // Check if token has expired
    if time.Now().After(tokenExpiration) {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Token has expired"})
        return
    }

    // Update user to mark email as verified
    err = db.Exec("UPDATE users SET token = NULL, token_expiration = NULL, email_validated = TRUE WHERE user_id = $1", userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"status": "success", "email_validated": true})
}