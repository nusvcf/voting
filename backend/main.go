package main

import (
	"github.com/gin-gonic/gin"
	"github.com/nusvcf/voting/backend/auth"
	"github.com/nusvcf/voting/backend/db"
	"log"
)

func main() {
	db.GetDB()

	r := setupRouter()
	port := "5000"
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

	adminRoutes := r.Group("/admin")
	adminRoutes.Use(auth.Middleware(true))

	adminRoutes.GET("/voters", getVotersHandler)
	adminRoutes.POST("/voters", createVotersHandler)
	adminRoutes.PUT("/voters/:id", invalidVoterHandler)
	adminRoutes.DELETE("/voters/:id", deleteVoterHandler)

	adminRoutes.GET("/ballots", getBallotsHandler)
	adminRoutes.POST("/ballots", createBallotHandler)

	return r
}
