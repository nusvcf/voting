package utils

import (
	"crypto/rand"
	"math/big"
	"os"
)

var letters = []rune("ABCDEFGHJKLMNPQRTUVWXY346789!?&#%")

func RandStr(n int) string {
	b := make([]rune, n)
	for i := range b {
		x, _ := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		b[i] = letters[x.Int64()]

	}
	return string(b)
}

func GetEnv(key, fallback string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		return fallback
	}
	return value
}
