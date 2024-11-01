package auth

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"nb-back-end/db"
	"nb-back-end/emailer"

	// "nb-back-end/settings"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

// CreateAccountForm represents the form data for creating an account
type CreateAccountForm struct {
	FirstName       string    `json:"firstName"`
	LastName        string    `json:"lastName"`
	Email           string    `json:"email"`
	Username        string    `json:"username"`
	Password        string    `json:"password"`
	BirthDate       string    `json:"birthDate"`
}

type CreateAccountRequest struct {
    FirstName string `json:"first_name" binding:"required"`
    LastName  string `json:"last_name" binding:"required"`
    Email     string `json:"email" binding:"required,email"`
    Username  string `json:"username" binding:"required"`
    Password  string `json:"password" binding:"required"`
    BirthDate string `json:"birth_date" binding:"required"`
}

// CustomClaims defines the custom JWT claims
type CustomClaims struct {
    UserID int `json:"user_id"`
    jwt.RegisteredClaims
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

    minLength, isAlphabetic = validateName(form.LastName)
    if !minLength || !isAlphabetic {
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

    // Insert data into users table and return user ID
    var userID int
    err = db.QueryRow(context.Background(),
        "INSERT INTO users (first_name, last_name, email, username, password, date_of_birth, created_at, token, token_expiration, email_validated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING user_id",
        form.FirstName, form.LastName, form.Email, form.Username, string(hashedPassword), form.BirthDate, createdAt, token, tokenExpiration, false).Scan(&userID)
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
        "https://bungo.rocks/email-confirmation?token=" + token,
    )
    if err != nil {
        log.Printf("Error sending confirmation email: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send confirmation email"})
        return
    }

    err = db.InsertUserSettings(userID)
    if err != nil {
        log.Panicf("Failed to insert user settings: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to insert user settings"})
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


type Login struct {
    Email       string      `json:email`
    Password    string      `json:password`
}

func HandleLogin(c *gin.Context) {
    var login Login

    // Bind JSON data to Login
    if err := c.ShouldBindJSON(&login); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    log.Printf("Received login request from: %s", c.ClientIP())

    // Check for user in db based on email
    userID, firstName, lastName, username, password, createdAt, err := db.GetUserByEmail(login.Email)
    if err != nil {
        log.Println("User not found or other error occurred:", err)
    } else {
        log.Printf("User found: ID=%d, Name=%s %s, Username=%s, CreatedAt=%s", userID, firstName, lastName, username, createdAt)
    }
    
    // Validate password
    err = bcrypt.CompareHashAndPassword([]byte(password), []byte(login.Password))
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid login credentials"})
        return
    }

    // Generate JWT
    token, err := GenerateJWT(userID, login.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
        return
    }

    settings, err := db.GetUserSettingsByID(userID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user settings"})
        return
    }

    // If the password matches, return a success response
    c.JSON(http.StatusOK, gin.H{
        "id":    userID,
        "name":  firstName + " " + lastName,
        "email": login.Email,
        "token": token,
        "settings": settings,
    })
}

// HandleHome is a protected route that renders the home page
func HandleHome(c *gin.Context) {
    // Retrieve the user ID 
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    // Fetch user details from the database
    user, err := db.GetUserByID(userID.(int))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user details"})
        return
    }

    // Render the home page or return the necessary data
    c.JSON(http.StatusOK, gin.H{
        "message": "Welcome to the home page!",
        "user":    user,
    })
}

func HandleAccountData(c *gin.Context) {
    // Retrieve use ID from parameter
    userID, exists := c.Get("userID")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
        return
    }

    user, err := db.GetUserByID(userID.(int))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user details"})
        return
    }

    fmt.Println(user);

    c.JSON(http.StatusOK, gin.H{
        "message": "Sending account data",
        "accountData": user,
    })
}

func ValidateToken(tokenString string) (int, error) {
	// Parse the token
	token, err := jwt.ParseWithClaims(tokenString, &CustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Verify the signing method and return the secret key
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("invalid signing method")
		}
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil {
		return 0, err
	}

	// Extract the user ID from the token claims
	if claims, ok := token.Claims.(*CustomClaims); ok && token.Valid {
		return claims.UserID, nil
	}

	return 0, fmt.Errorf("invalid token")
}
