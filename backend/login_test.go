package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("Login", func() {
	BeforeEach(func() {
		// Create users
	})

	AfterEach(func() {
		// Delete users
	})

	It("fails on wrong password", func() {
		resp, err := login("myusername", "wrongpassword")
		Expect(err).To(BeNil())
		Expect(resp.Success).To(BeFalse())
	})

	It("passes with correct admin credentials", func() {
		resp, err := login("admin", "myadminpassword")
		Expect(err).To(BeNil())
		Expect(resp.Success).To(BeTrue())
		Expect(resp.UserType).To(Equal("admin"))
	})

	It("passes with correct user credentials", func() {
		resp, err := login("myusername", "mypassword")
		Expect(err).To(BeNil())
		Expect(resp.Success).To(BeTrue())
		Expect(resp.UserType).To(Equal("user"))
	})
})

func login(username, password string) (LoginResponse, error) {
	router := setupRouter()
	body, _ := json.Marshal(LoginPayload{Username: username, Password: password})

	req, _ := http.NewRequest("POST", "/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	responseRecorder := httptest.NewRecorder()
	router.ServeHTTP(responseRecorder, req)

	Expect(responseRecorder.Code).To(Equal(http.StatusOK))

	var resp LoginResponse
	_ = json.NewDecoder(responseRecorder.Body).Decode(&resp)

	return resp, nil
}
