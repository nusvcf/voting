package main

import (
	"github.com/gin-gonic/gin"
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
	resp.Success = true
	resp.UserType = "admin"

	c.JSON(http.StatusOK, resp)
}
