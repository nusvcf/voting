package main

import (
	"github.com/nusvcf/voting/backend/db"
	"github.com/nusvcf/voting/backend/structs"
	"github.com/nusvcf/voting/backend/testutils"
	"github.com/nusvcf/voting/backend/utils"
	"time"

	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"

	"github.com/brianvoe/gofakeit/v6"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("Login", func() {
	When("system has been bootstrapped", func() {
		var adminPw string

		BeforeEach(func() {
			adminPw = gofakeit.Password(true, true, true, false, false, 8)
			hashedPw, _ := generateSaltAndHashPassword(adminPw)
			err := db.GetDB().SetBootstrap(hashedPw)
			Expect(err).To(BeNil())
		})

		AfterEach(func() {
			_ = db.GetDB().ClearBootstrap()
		})

		It("fails on wrong password", func() {
			resp, err := performLoginWithParsing("admin", "wrongpassword")
			Expect(err).To(BeNil())
			Expect(resp.Success).To(BeFalse())
		})

		It("passes with correct admin credentials", func() {
			resp, err := performLoginWithParsing("admin", adminPw)
			Expect(err).To(BeNil())
			Expect(resp.Success).To(BeTrue())
			Expect(resp.UserType).To(Equal("admin"))
		})
	})

	When("voter has been created", func() {
		var voter structs.Voter

		BeforeEach(func() {
			voter = testutils.CreateVoter()
			voter.ID, _ = db.GetDB().CreateVoter(voter)
		})

		AfterEach(func() {
			_ = db.GetDB().DeleteVoter(voter.ID)
		})

		It("fails on wrong password", func() {
			resp, err := performLoginWithParsing(voter.Username, "incorrect-password")
			Expect(err).To(BeNil())
			Expect(resp.Success).To(BeFalse())
		})

		It("passes with correct user credentials", func() {
			resp, err := performLoginWithParsing(voter.Username, voter.Password)
			Expect(err).To(BeNil())
			Expect(resp.Success).To(BeTrue())
			Expect(resp.UserType).To(Equal("user"))
		})

		It("updates voter's last seen after they log in", func() {
			_, _ = performLoginWithParsing(voter.Username, voter.Password)
			fetchedVoter := utils.GetVoterById(voter.ID)
			Expect(time.Since(fetchedVoter.LastSeen.Time).Seconds()).To(BeNumerically("<", 1))
		})
	})

	Describe("login check", func() {
		It("returns fail if user has not yet logged in", func() {
			router := setupRouter()
			req, _ := http.NewRequest("GET", "/login", nil)
			responseRecorder := httptest.NewRecorder()
			router.ServeHTTP(responseRecorder, req)
			Expect(responseRecorder.Code).To(Equal(http.StatusOK))

			var resp LoginResponse
			err := json.NewDecoder(responseRecorder.Body).Decode(&resp)
			Expect(err).To(BeNil())
			Expect(resp.Success).To(BeFalse())
		})

		It("returns success if user has logged in before", func() {
			router := setupRouter()
			req, _ := http.NewRequest("GET", "/login", nil)
			responseRecorder := serveWithCookie(req, "0001")
			router.ServeHTTP(responseRecorder, req)
			Expect(responseRecorder.Code).To(Equal(http.StatusOK))

			var resp LoginResponse
			err := json.NewDecoder(responseRecorder.Body).Decode(&resp)
			Expect(err).To(BeNil())
			Expect(resp.Success).To(BeTrue())
			Expect(resp.UserType).To(Equal("user"))
			Expect(resp.Token).To(Not(BeEmpty()))
		})

		It("returns success if admin has logged in before", func() {
			router := setupRouter()
			req, _ := http.NewRequest("GET", "/login", nil)
			responseRecorder := serveWithCookie(req, "admin")
			router.ServeHTTP(responseRecorder, req)
			Expect(responseRecorder.Code).To(Equal(http.StatusOK))

			var resp LoginResponse
			err := json.NewDecoder(responseRecorder.Body).Decode(&resp)
			Expect(err).To(BeNil())
			Expect(resp.Success).To(BeTrue())
			Expect(resp.UserType).To(Equal("admin"))
			Expect(resp.Token).To(Not(BeEmpty()))
		})
	})

})

func performLogin(username, password string) *httptest.ResponseRecorder {
	router := setupRouter()
	body, _ := json.Marshal(LoginPayload{Username: username, Password: password})

	req, _ := http.NewRequest("POST", "/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	responseRecorder := httptest.NewRecorder()
	router.ServeHTTP(responseRecorder, req)

	return responseRecorder
}

func performLoginWithParsing(username, password string) (LoginResponse, error) {
	responseRecorder := performLogin(username, password)
	Expect(responseRecorder.Code).To(Equal(http.StatusOK))

	var resp LoginResponse
	err := json.NewDecoder(responseRecorder.Body).Decode(&resp)

	return resp, err
}
