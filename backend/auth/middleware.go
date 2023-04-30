package auth

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func GetUserIdFromHeader(c *gin.Context) (string, error) {
	token := c.GetHeader("auth")
	return parseJWT(token)
}

func Middleware(forAdmin bool) func(c *gin.Context) {
	return func(c *gin.Context) {
		userId, err := GetUserIdFromHeader(c)
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
