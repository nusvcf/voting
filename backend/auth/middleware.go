package auth

import (
	"github.com/gin-gonic/gin"
	"github.com/gofrs/uuid"
	"github.com/nusvcf/voting/backend/db"
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

		if userId != "admin" {
			// check if user exists
			id, err := uuid.FromString(userId)
			if err != nil {
				c.AbortWithStatus(http.StatusBadRequest)
				return
			}

			valid, err := db.GetDB().CheckIfVoterIdValid(id)
			if err != nil {
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}

			if !valid {
				c.AbortWithStatus(http.StatusUnauthorized)
				return
			}
		}

		c.Set("userId", userId)
		c.Next()
	}
}
