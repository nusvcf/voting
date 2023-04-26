package db

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"os"
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

func getenv(key, fallback string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		return fallback
	}
	return value
}

func getDbConnStr() string {
	dbUser := getenv("DB_USER", "vcf-voting")
	dbName := getenv("DB_NAME", "vcf-voting")
	dbPass := getenv("DB_PASS", "P!hDTpix9xyH.yxYYFaU7BTivxxncmoiXRbhDBQuHE8-Zkbv*yjwc-V!oLYnK2Rs")
	dbHost := getenv("INSTANCE_HOST", "127.0.0.1")
	dbPort := getenv("DB_PORT", "5432")
	unixSocket := getenv("INSTANCE_UNIX_SOCKET", "")
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

	config.MaxConns = 5
	config.MinConns = 1

	d.Pool, err = pgxpool.ConnectConfig(context.Background(), config)
	if err != nil {
		log.Fatalln("Unable to connect to db:", err)
	}
}
