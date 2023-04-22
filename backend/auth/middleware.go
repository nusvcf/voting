package auth

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strings"
)

func Middleware(forAdmin bool) func(c *gin.Context) {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if len(authHeader) < 7 {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		userId, err := ParseJWT(strings.TrimPrefix(authHeader, "Bearer "))
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

		c.Next()
	}
}
