package db_test

import (
	"os"
	"testing"

	"github.com/nusvcf/voting/backend/db"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var dbObj = db.GetDB()

func TestMain(m *testing.M) {
	code := m.Run()
	dbObj.Pool.Close()
	os.Exit(code)
}

func TestBackend(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Database Suite")
}
