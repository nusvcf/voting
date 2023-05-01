package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/nusvcf/voting/backend/auth"
	"github.com/nusvcf/voting/backend/db"
	"github.com/nusvcf/voting/backend/utils"
	"log"
)

func main() {
	db.GetDB()

	r := setupRouter()

	port := utils.GetEnv("PORT", "5000")
	err := r.Run(":" + port)
	if err != nil {
		log.Fatalln(err)
	}
}

func setupRouter() *gin.Engine {
	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"https://vote.nusvcf.com", "https://vcf-voting.pages.dev", "http://localhost:3000"}
	config.AllowCredentials = true
	config.AllowHeaders = []string{"auth", "Content-Type"}
	r.Use(cors.New(config))

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
	adminRoutes.PUT("/ballots/:id", invalidateBallotHandler)

	return r
}
