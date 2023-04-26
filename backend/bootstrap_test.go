package main

import (
	"bytes"
	"encoding/json"
	"github.com/brianvoe/gofakeit/v6"
	"github.com/nusvcf/voting/backend/db"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"net/http"
	"net/http/httptest"
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
	AfterEach(func() {
		_ = db.GetDB().ClearBootstrap()
	})

	When("system is not yet bootstrapped", func() {
		It("returns bootstrapped = false", func() {
			resp, err := performCheckBootstrap()
			Expect(err).To(BeNil())
			Expect(resp.IsBootstrapped).To(BeFalse())
		})

		It("can boostrap", func() {
			statusCode := performBootstrap("my-admin-password")
			Expect(statusCode).To(Equal(http.StatusOK))
		})

		It("prevents admin login", func() {
			respRecorder := performLogin("admin", "my-admin-password")
			Expect(respRecorder.Code).To(Equal(http.StatusInternalServerError))
		})
	})

	When("system is bootstrapped", func() {
		BeforeEach(func() {
			performBootstrap("my-admin-password")
		})

		It("returns bootstrapped = true", func() {
			resp, err := performCheckBootstrap()
			Expect(err).To(BeNil())
			Expect(resp.IsBootstrapped).To(BeTrue())
		})

		It("does not allow further bootstrap calls", func() {
			statusCode := performBootstrap("my-admin-password")
			Expect(statusCode).To(Equal(http.StatusInternalServerError))
		})

		It("allows admin to log in", func() {
			resp, err := performLoginWithParsing("admin", "my-admin-password")
			Expect(err).To(BeNil())
			Expect(resp.Success).To(BeTrue())
			Expect(resp.UserType).To(Equal("admin"))
		})
	})
})

func performCheckBootstrap() (CheckBootstrapResponse, error) {
	router := setupRouter()
	req, _ := http.NewRequest("GET", "/bootstrap", nil)
	responseRecorder := httptest.NewRecorder()
	router.ServeHTTP(responseRecorder, req)
	Expect(responseRecorder.Code).To(Equal(http.StatusOK))

	var resp CheckBootstrapResponse
	err := json.NewDecoder(responseRecorder.Body).Decode(&resp)

	return resp, err
}

func performBootstrap(adminPassword string) int {
	router := setupRouter()
	body, _ := json.Marshal(BootstrapPayload{AdminPassword: adminPassword})

	req, _ := http.NewRequest("POST", "/bootstrap", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	responseRecorder := httptest.NewRecorder()
	router.ServeHTTP(responseRecorder, req)

	return responseRecorder.Code
}
