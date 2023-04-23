package main

import (
	"github.com/gin-gonic/gin"
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

	var resp LoginResponse

	_, err := db.GetDB().CheckSingleVoter(payload.Username, payload.Password)
	if err != nil {
		c.JSON(http.StatusOK, resp)
		return
	}

	userType := "user"
	if payload.Username == "admin" {
		userType = "admin"
	}

	resp.Success = true
	resp.UserType = userType

	c.JSON(http.StatusOK, resp)
}
