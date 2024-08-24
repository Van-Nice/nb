package auth

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"nb-back-end/emailer"
    "nb-back-end/db"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
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

    // If the password matches, return a success response
    c.JSON(http.StatusOK, gin.H{"message": "Login successful", "token": token})
}

// HandleCreateFile creates a new file for the authenticated user
func HandleCreateFile(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		return
	}

	var file db.File
	if err := c.ShouldBindJSON(&file); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	file.UserID, _ = primitive.ObjectIDFromHex(userID.(string))
	file.CreatedAt = time.Now()
	file.UpdatedAt = time.Now()

	result, err := db.InsertFile(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File created successfully", "file_id": result.InsertedID})
}

// HandleGetFiles retrieves all files for the authenticated user
func HandleGetFiles(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		return
	}

	client := c.MustGet("mongoClient").(*mongo.Client)
	collection := client.Database("your_database_name").Collection("files")

	filter := bson.M{"user_id": userID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch files"})
		return
	}
	defer cursor.Close(context.TODO())

	var files []bson.M
	for cursor.Next(context.TODO()) {
		var file bson.M
		if err := cursor.Decode(&file); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode file"})
			return
		}
		files = append(files, file)
	}

	c.JSON(http.StatusOK, gin.H{"files": files})
}

// HandleCreateFolder creates a new folder for the authenticated user
func HandleCreateFolder(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		return
	}

	var folder db.Folder
	if err := c.ShouldBindJSON(&folder); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	folder.UserID, _ = primitive.ObjectIDFromHex(userID.(string))
	folder.CreatedAt = time.Now()
	folder.UpdatedAt = time.Now()

	result, err := db.InsertFolder(folder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create folder"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Folder created successfully", "folder_id": result.InsertedID})
}

// HandleGetFolders retrieves all folders for the authenticated user
func HandleGetFolders(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		return
	}

	client := c.MustGet("mongoClient").(*mongo.Client)
	collection := client.Database("your_database_name").Collection("folders")

	filter := bson.M{"user_id": userID}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch folders"})
		return
	}
	defer cursor.Close(context.TODO())

	var folders []bson.M
	for cursor.Next(context.TODO()) {
		var folder bson.M
		if err := cursor.Decode(&folder); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode folder"})
			return
		}
		folders = append(folders, folder)
	}

	c.JSON(http.StatusOK, gin.H{"folders": folders})
}

