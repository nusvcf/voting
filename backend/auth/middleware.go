package auth

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

func Middleware(forAdmin bool) func(c *gin.Context) {
	return func(c *gin.Context) {
		cookie, err := c.Cookie("auth")
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		userId, err := parseJWT(cookie)
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

func AddAuthCookie(c *gin.Context, userId string) error {
	token, err := CreateJWT(userId, time.Minute*5)
	if err != nil {
		return err
	}

	c.SetCookie("auth", token, 300, "/", "localhost", true, true)
	return nil
}
