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

	r.POST("/login", loginHandler)
	r.POST("/bootstrap", bootstrapHandler)

	userRoutes := r.Group("/user")
	userRoutes.Use(auth.Middleware(false))

	adminRoutes := r.Group("/admin")
	adminRoutes.Use(auth.Middleware(true))

	return r
}
