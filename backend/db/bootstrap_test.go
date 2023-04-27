package db_test

import (
	"github.com/brianvoe/gofakeit/v6"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("DB Bootstrap", func() {
	AfterEach(func() {
		_ = dbObj.ClearBootstrap()
	})

	When("system is not yet bootstrapped", func() {
		It("returns error when trying to get admin password", func() {
			pw, err := dbObj.GetBootstrap()
			Expect(err).ToNot(BeNil())
			Expect(pw).To(BeEmpty())
		})

		It("can set admin password", func() {
			err := dbObj.SetBootstrap("my-admin-password")
			Expect(err).To(BeNil())
		})
	})

	When("system is bootstrapped", func() {
		var password string
		BeforeEach(func() {
			password = gofakeit.Password(true, true, true, true, false, 12)
			_ = dbObj.SetBootstrap(password)
		})

		It("returns the password", func() {
			retrievedPassword, err := dbObj.GetBootstrap()
			Expect(err).To(BeNil())
			Expect(retrievedPassword).To(Equal(password))
		})

		It("cannot set again", func() {
			err := dbObj.SetBootstrap("another-password")
			Expect(err).ToNot(BeNil())
		})

		It("can clear the bootstrap", func() {
			err := dbObj.ClearBootstrap()
			Expect(err).To(BeNil())

			_, err = dbObj.GetBootstrap()
			Expect(err).ToNot(BeNil())
		})
	})
})
