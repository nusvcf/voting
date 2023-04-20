package main

import (
	"github.com/gin-gonic/gin"
	"github.com/nusvcf/voting/backend/db"
	"log"
)

func main() {
	db.GetDB().Init()
	
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

	return r
}
