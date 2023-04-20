package db_test

import (
	"github.com/nusvcf/voting/backend/structs"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"gopkg.in/guregu/null.v4"
)

var _ = Describe("Login", func() {
	BeforeEach(func() {
		// Create account
	})

	AfterEach(func() {
		// Delete all accounts
	})

	It("can create account", func() {
		voter := structs.Voter{
			Username: "",
			Password: "",
			LastSeen: null.Time{},
		}

		var err error
		voter.ID, err = dbObj.CreateVoter(voter)

		Expect(err).To(BeNil())
	})

	It("can login", func() {})

	It("retrieves the list of users", func() {})
})
