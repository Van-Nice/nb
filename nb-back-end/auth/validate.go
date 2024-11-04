package auth

import (
	"regexp"
	"unicode"
	"fmt"
	"time"
)

func validateName(name string) (bool, bool) {
    minLength := len(name) >= 2
    isAlphabetic := true
    for _, char := range name {
        if !unicode.IsLetter(char) && !unicode.IsSpace(char) {
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