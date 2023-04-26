package main

import (
	"github.com/gin-gonic/gin"
	"github.com/nusvcf/voting/backend/auth"
	"github.com/nusvcf/voting/backend/db"
	"net/http"
)

type LoginPayload struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Success  bool   `json:"success"`
	UserType string `json:"userType"`
}

func loginHandler(c *gin.Context) {
	var payload LoginPayload

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if payload.Username == "admin" {
		// Handle admin
		hashedPw, err := db.GetDB().GetBootstrap()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		err = verifyPassword(hashedPw, payload.Password)
		if err != nil {
			c.JSON(http.StatusOK, LoginResponse{})
			return
		}

		_ = auth.AddAuthCookie(c, "admin")

		c.JSON(http.StatusOK, LoginResponse{Success: true, UserType: "admin"})
	} else {
		// Handle voter
		id, err := db.GetDB().CheckSingleVoter(payload.Username, payload.Password)
		if err != nil {
			c.JSON(http.StatusOK, LoginResponse{})
			return
		}

		_ = auth.AddAuthCookie(c, id.String())

		c.JSON(http.StatusOK, LoginResponse{Success: true, UserType: "user"})
	}
}
