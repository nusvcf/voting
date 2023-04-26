package main

import (
	"github.com/brianvoe/gofakeit/v6"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("Password hashing", func() {
	It("hashes password", func() {
		hashedPw, err := generateSaltAndHashPassword("my-admin-password")
		Expect(err).To(BeNil())
		Expect(hashedPw).ToNot(BeEmpty())
	})

	When("comparing hashed password", func() {
		var pw, hashedPw string

		BeforeEach(func() {
			pw = gofakeit.Password(true, true, true, false, false, 8)
			hashedPw, _ = generateSaltAndHashPassword(pw)
		})

		It("returns no error if correct password is passed", func() {
			err := verifyPassword(hashedPw, pw)
			Expect(err).To(BeNil())
		})

		It("throws an error with incorrect password", func() {
			err := verifyPassword(hashedPw, "incorrect-password")
			Expect(err).ToNot(BeNil())
		})
	})
})

var _ = Describe("Bootstrap", func() {
	When("system is not yet bootstrapped", func() {
		It("can boostrap", func() {
			// Call API
			// Expect success
			Expect(true).To(BeFalse())
		})

		It("prevents admin login", func() {
			Expect(true).To(BeFalse())
		})
	})

	When("system is bootstrapped", func() {
		BeforeEach(func() {
			// Do bootstrapping
		})

		It("does not allow further bootstrap calls", func() {
			// Call API
			// Expect error
			Expect(true).To(BeFalse())
		})

		It("allows admin to log in", func() {
			Expect(true).To(BeFalse())
		})
	})
})
