package main

import (
	"github.com/gin-gonic/gin"
	"github.com/nusvcf/voting/backend/auth"
	"github.com/nusvcf/voting/backend/db"
	"net/http"
	"time"
)

type LoginPayload struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Success  bool   `json:"success"`
	UserType string `json:"userType"`
	Token    string `json:"token"`
}

func checkLoginHandler(c *gin.Context) {
	userId, err := auth.GetUserIdFromHeader(c)
	if err != nil {
		c.JSON(http.StatusOK, LoginResponse{})
		return
	}

	resp := LoginResponse{Success: true}
	if userId == "admin" {
		resp.UserType = "admin"
	} else {
		resp.UserType = "user"
	}

	resp.Token, _ = auth.CreateJWT(userId, time.Hour*5)

	c.JSON(http.StatusOK, resp)
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

		token, err := auth.CreateJWT("admin", time.Hour*3)
		if err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.JSON(http.StatusOK, LoginResponse{Success: true, UserType: "admin", Token: token})
	} else {
		// Handle voter
		id, err := db.GetDB().CheckSingleVoter(payload.Username, payload.Password)
		if err != nil {
			c.JSON(http.StatusOK, LoginResponse{})
			return
		}

		_ = db.GetDB().UpdateLastSeen(id)

		token, err := auth.CreateJWT(id.String(), time.Hour*3)
		if err != nil {
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		c.JSON(http.StatusOK, LoginResponse{Success: true, UserType: "user", Token: token})
	}
}
