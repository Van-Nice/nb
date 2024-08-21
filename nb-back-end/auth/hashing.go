package auth

import (
	"crypto/rand"
	"encoding/base64"

	"golang.org/x/crypto/bcrypt"
)

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