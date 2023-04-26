package auth

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
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
		_ = AddAuthCookie(c, userId) // refresh
		c.Next()
	}
}

func AddAuthCookie(c *gin.Context, userId string) error {
	token, err := CreateJWT(userId, time.Minute*5)
	if err != nil {
		return err
	}

	c.SetCookie("auth", token, 300, "/", "localhost", true, true)
	return nil
}
