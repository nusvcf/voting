package auth

import (
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("JWTs", func() {
	It("generates a jwt", func() {
		signedJwt, err := CreateJWT("random-user-id", time.Minute*5)
		Expect(err).To(BeNil())
		Expect(signedJwt).ToNot(BeEmpty())
	})

	It("returns user id when parsing jwt", func() {
		signedJwt, _ := CreateJWT("random-user-id", time.Minute*5)
		userId, err := parseJWT(signedJwt)
		Expect(err).To(BeNil())
		Expect(userId).To(Equal("random-user-id"))
	})

	It("errors when receiving an expired jwt", func() {
		signedJwt, _ := CreateJWT("random-user-id", time.Minute*-5)
		userId, err := parseJWT(signedJwt)
		Expect(err).ToNot(BeNil())
		Expect(userId).To(BeEmpty())
	})
})
