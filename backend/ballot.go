package main

import (
	"github.com/gin-gonic/gin"
	"github.com/nusvcf/voting/backend/db"
	"net/http"
)

func getBallotsHandler(c *gin.Context) {
	ballots, err := db.GetDB().GetBallots()
	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, ballots)
}
