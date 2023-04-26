package main

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"fmt"
	"golang.org/x/crypto/argon2"
	"strings"
)

func generateSalt() ([]byte, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return nil, err
	}

	return salt, nil
}

func hashPassword(salt []byte, password string) (string, error) {
	hashedPassword := base64.StdEncoding.EncodeToString(argon2.IDKey([]byte(password), salt, 2, 19*1024, 1, 32))
	combinedHash := fmt.Sprintf("%s$%s", base64.StdEncoding.EncodeToString(salt), hashedPassword)
	return combinedHash, nil
}

func generateSaltAndHashPassword(password string) (string, error) {
	salt, err := generateSalt()
	if err != nil {
		return "", err
	}

	return hashPassword(salt, password)
}

func verifyPassword(combinedHash, providedPassword string) error {
	vars := strings.Split(combinedHash, "$")
	salt, err := base64.StdEncoding.DecodeString(vars[0])
	if err != nil {
		return err
	}

	hashedProvidedPassword, err := hashPassword(salt, providedPassword)
	if err != nil {
		return err
	}

	result := subtle.ConstantTimeCompare([]byte(combinedHash), []byte(hashedProvidedPassword))
	if result == 1 {
		return nil
	} else {
		return fmt.Errorf("incorrect password")
	}
}
