package auth

import (
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"github.com/nusvcf/voting/backend/utils"
	"time"
)

var key = []byte(utils.GetEnv("JWT_SECRET_KEY", "n2fD8evDH9PCow8-eBFYJHrCspJR4L.TVthQPa8YrXeEcRaRvzHnimDg@AtfeU!2"))

func CreateJWT(userId string, expDuration time.Duration) (string, error) {
	//bootstrapId, _ := db.GetDB().GetBootstrapId()

	t := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"id": userId,
		//"bootstrap": bootstrapId,
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

	//bootstrapId := claims["bootstrap"].(string)
	//currentBootstrapId, _ := db.GetDB().GetBootstrapId()
	//
	//if bootstrapId != currentBootstrapId {
	//	return "", fmt.Errorf("incorrect bootstrap id")
	//}

	return claims["id"].(string), nil
}
