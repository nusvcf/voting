package auth

import (
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"time"
)

var key = []byte("MY-KEY-HERE")

func CreateJWT(userId string, expDuration time.Duration) (string, error) {
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id":  userId,
		"exp": time.Now().Add(expDuration).Unix(),
	})

	return t.SignedString(key)
}

func parseJWT(tokenString string) (string, error) {
	claims := jwt.MapClaims{}
	token, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		return key, nil
	})

	if err != nil {
		return "", err
	}

	if !token.Valid {
		return "", fmt.Errorf("invalid token")
	}

	return claims["id"].(string), nil
}
