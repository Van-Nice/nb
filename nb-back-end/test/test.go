package test

import (
	"fmt"
	"math/rand"
	"strings"
	"time"
)

var rng *rand.Rand

func init() {
    rng = rand.New(rand.NewSource(time.Now().UnixNano()))
}

// GenerateRandomString generates a random string of given length using alphabetic characters
func GenerateRandomString(length int) string {
    letters := []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
    result := make([]rune, length)
    for i := range result {
        result[i] = letters[rng.Intn(len(letters))]
    }
    return string(result)
}

// GenerateRandomEmail generates a valid random email address
func GenerateRandomEmail() string {
    return fmt.Sprintf("%s.%s@example.com", GenerateRandomString(5), GenerateRandomString(7))
}

// GenerateRandomUsername generates a valid random username
func GenerateRandomUsername() string {
    return GenerateRandomString(rng.Intn(10) + 6) // At least 6 characters
}

// GenerateRandomPassword generates a valid random password
func GenerateRandomPassword() string {
    password := make([]rune, 8)
    password[0] = rune('A' + rng.Intn(26)) // Ensure at least one uppercase
    password[1] = rune('a' + rng.Intn(26)) // Ensure at least one lowercase
    password[2] = rune('0' + rng.Intn(10)) // Ensure at least one digit
    password[3] = rune([]rune("!@#$%^&*()")[rng.Intn(10)]) // Ensure at least one special character

    for i := 4; i < 8; i++ {
        password[i] = rune(33 + rng.Intn(94)) // Any printable ASCII character
    }

    rng.Shuffle(len(password), func(i, j int) { password[i], password[j] = password[j], password[i] })

    return string(password)
}

// GenerateValidConfirmPassword returns the same password for confirmation
func GenerateValidConfirmPassword(password string) string {
	return password
}

// GenerateRandomBirthDate generates a valid birth date between 13 and 120 years old
func GenerateRandomBirthDate() string {
	minAge := 13
	maxAge := 120
	now := time.Now()
	year := now.Year() - rand.Intn(maxAge-minAge) - minAge
	month := rand.Intn(12) + 1
	day := rand.Intn(28) + 1
	return fmt.Sprintf("%04d-%02d-%02d", year, month, day)
}

// GenerateInvalidFirstName generates an invalid random first name
func GenerateInvalidFirstName() string {
	return GenerateRandomString(1) // Too short
}

// GenerateInvalidLastName generates an invalid random last name with non-alphabetic characters
func GenerateInvalidLastName() string {
	return strings.Repeat("123@", 3) // Non-alphabetic characters
}

// GenerateInvalidEmail generates an invalid random email address
func GenerateInvalidEmail() string {
	return fmt.Sprintf("%s@.com", GenerateRandomString(5)) // Missing domain part
}

// GenerateInvalidUsername generates an invalid random username
func GenerateInvalidUsername() string {
	return GenerateRandomString(3) // Too short
}

// GenerateInvalidPassword generates an invalid random password
func GenerateInvalidPassword() string {
	password := make([]rune, 8)
	for i := range password {
		password[i] = rune('a' + rand.Intn(26)) // Lowercase only, no uppercase, digits, or special characters
	}
	return string(password)
}

// GenerateMismatchedConfirmPassword returns a different password for confirmation
func GenerateMismatchedConfirmPassword(password string) string {
	return password + "x" // Deliberately different
}

// GenerateInvalidBirthDate generates an invalid birth date (either too young or too old)
func GenerateInvalidBirthDate() string {
	// Either a future date or a date far in the past
	if rand.Intn(2) == 0 {
		year := time.Now().Year() + 1 // Future year
		month := rand.Intn(12) + 1
		day := rand.Intn(28) + 1
		return fmt.Sprintf("%04d-%02d-%02d", year, month, day)
	} else {
		year := time.Now().Year() - 121 // Too old
		month := rand.Intn(12) + 1
		day := rand.Intn(28) + 1
		return fmt.Sprintf("%04d-%02d-%02d", year, month, day)
	}
}