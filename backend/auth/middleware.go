package auth

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func Middleware(forAdmin bool) func(c *gin.Context) {
	return func(c *gin.Context) {
		cookie, err := c.Cookie("auth")
		if err != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}

		userId, err := ParseJWT(cookie)
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
