package main

import (
	"github.com/gin-gonic/gin"
	"github.com/nusvcf/voting/backend/auth"
	"github.com/nusvcf/voting/backend/db"
	"log"
	"os"
)

func getenv(key, fallback string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		return fallback
	}
	return value
}

func main() {
	db.GetDB()

	r := setupRouter()
	port := getenv("PORT", "5000")
	err := r.Run(":" + port)
	if err != nil {
		log.Fatalln(err)
	}
}

func setupRouter() *gin.Engine {
	r := gin.Default()

	r.GET("/login", checkLoginHandler)
	r.POST("/login", loginHandler)

	r.GET("/bootstrap", isBootstrappedHandler)
	r.POST("/bootstrap", bootstrapHandler)

	userRoutes := r.Group("/user")
	userRoutes.Use(auth.Middleware(false))

	userRoutes.GET("/ballot", getCurrentBallotHandler)
	userRoutes.POST("/ballot/:id", castVoteHandler)

	adminRoutes := r.Group("/admin")
	adminRoutes.Use(auth.Middleware(true))

	adminRoutes.GET("/voters", getVotersHandler)
	adminRoutes.POST("/voters", createVotersHandler)
	adminRoutes.PUT("/voters/:id", invalidVoterHandler)
	adminRoutes.DELETE("/voters/:id", deleteVoterHandler)

	adminRoutes.GET("/ballots", getBallotsHandler)
	adminRoutes.POST("/ballots", createBallotHandler)
	adminRoutes.POST("/ballots/:id", closeBallotHandler)

	return r
}
