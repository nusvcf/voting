package db

import (
	"context"
	"fmt"
	"github.com/nusvcf/voting/backend/utils"
	"log"
	"math/rand"
	"sync"
	"time"

	"github.com/jackc/pgx/v4/pgxpool"
)

const timeout = time.Second * 2

type Database struct {
	Pool *pgxpool.Pool
}

var singleton *Database
var once sync.Once

// GetDB returns the singleton database instance
func GetDB() *Database {
	once.Do(func() {
		rand.Seed(time.Now().UTC().UnixNano())
		singleton = &Database{}
		singleton.init()
	})
	return singleton
}

func getDbConnStr() string {
	dbUser := utils.GetEnv("DB_USER", "vcf-voting")
	dbName := utils.GetEnv("DB_NAME", "vcf-voting")
	dbPass := utils.GetEnv("DB_PASS", "P!hDTpix9xyH.yxYYFaU7BTivxxncmoiXRbhDBQuHE8-Zkbv*yjwc-V!oLYnK2Rs")
	dbHost := utils.GetEnv("INSTANCE_HOST", "127.0.0.1")
	dbPort := utils.GetEnv("DB_PORT", "5432")
	unixSocket := utils.GetEnv("INSTANCE_UNIX_SOCKET", "")
	if unixSocket != "" {
		return fmt.Sprintf("dbname=%s user=%s password=%s host=%s", dbName, dbUser, dbPass, unixSocket)
	}
	return fmt.Sprintf("dbname=%s user=%s password=%s host=%s port=%s", dbName, dbUser, dbPass, dbHost, dbPort)
}

func (d *Database) init() {
	config, err := pgxpool.ParseConfig(getDbConnStr())
	if err != nil {
		log.Fatalln("Unable to parse database config:", err)
	}

	config.MaxConns = 3
	config.MinConns = 0

	d.Pool, err = pgxpool.ConnectConfig(context.Background(), config)
	if err != nil {
		log.Fatalln("Unable to connect to db:", err)
	}
}
