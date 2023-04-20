package main

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

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
