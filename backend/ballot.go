package main

import (
	"github.com/gin-gonic/gin"
	"github.com/gofrs/uuid"
	"github.com/nusvcf/voting/backend/db"
	"github.com/nusvcf/voting/backend/structs"
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

func createBallotHandler(c *gin.Context) {
	var payload structs.AdminBallot

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if _, err := db.GetDB().CreateBallot(payload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
}

func getCurrentBallotHandler(c *gin.Context) {
	ballot, err := db.GetDB().GetLatestOpenBallot()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	voterIdString := c.GetString("userId")
	voterId, err := uuid.FromString(voterIdString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	voted, err := db.GetDB().VoterHasVotedForBallot(voterId, ballot.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if voted {
		// Return empty ballot
		c.JSON(http.StatusOK, structs.UserBallot{})
	} else {
		c.JSON(http.StatusOK, ballot)
	}
}
