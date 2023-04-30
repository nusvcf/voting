package auth

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

func GetUserIdFromCookie(c *gin.Context) (string, error) {
	cookie, err := c.Cookie("auth")
	if err != nil {
		return "", err
	}

	return parseJWT(cookie)
}

func Middleware(forAdmin bool) func(c *gin.Context) {
	return func(c *gin.Context) {
		userId, err := GetUserIdFromCookie(c)
		fmt.Println(userId)
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		if forAdmin && userId != "admin" {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		if !forAdmin && userId == "admin" {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		c.Set("userId", userId)
		c.Next()
	}
}
