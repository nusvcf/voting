package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gofrs/uuid"
	"github.com/nusvcf/voting/backend/db"
	"github.com/nusvcf/voting/backend/structs"
	"github.com/nusvcf/voting/backend/utils"
	"net/http"
)

func getVotersHandler(c *gin.Context) {
	voters, err := db.GetDB().GetVoters()
	if err != nil {
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, voters)
}

type CreateVotersPayload struct {
	Start int `json:"start" binding:"required"`
	End   int `json:"end" binding:"required"`
}

func createVotersHandler(c *gin.Context) {
	var payload CreateVotersPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if payload.End < payload.Start {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid range"})
		return
	}

	err := createVoters(payload.Start, payload.End)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
}

func createVoters(start int, end int) error {
	for i := start; i <= end; i++ {
		username := fmt.Sprintf(`%04d`, i)
		password := utils.RandStr(8)
		_, err := db.GetDB().CreateVoter(structs.Voter{
			Username: username,
			Password: password,
		})

		if err != nil {
			return err
		}
	}

	return nil
}

func invalidVoterHandler(c *gin.Context) {
	idStr := c.Param("id")
	idUuid, err := uuid.FromString(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	err = db.GetDB().InvalidateVoter(idUuid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
}

func deleteVoterHandler(c *gin.Context) {
	idStr := c.Param("id")
	idUuid, err := uuid.FromString(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	err = db.GetDB().DeleteVoter(idUuid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
}
