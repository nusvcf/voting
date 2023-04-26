package main

import (
	"bytes"
	"encoding/json"
	"github.com/nusvcf/voting/backend/auth"
	"github.com/nusvcf/voting/backend/db"
	"github.com/nusvcf/voting/backend/structs"
	"github.com/nusvcf/voting/backend/utils"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"net/http"
	"net/http/httptest"
	"time"
)

var _ = Describe("Voters API", func() {
	var voter1, voter2 structs.Voter

	BeforeEach(func() {
		voter1 = utils.CreateVoter()
		voter1.ID, _ = db.GetDB().CreateVoter(voter1)
		voter2 = utils.CreateVoter()
		voter2.ID, _ = db.GetDB().CreateVoter(voter2)

		performBootstrap("admin-pw")

	})

	AfterEach(func() {
		_ = db.GetDB().DeleteAllVoters()
		_ = db.GetDB().ClearBootstrap()
	})

	It("can get the list of existing voters", func() {
		req, _ := http.NewRequest("GET", "/admin/voters", nil)
		responseRecorder := serveWithCookie(req)
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		var resp []structs.Voter
		err := json.NewDecoder(responseRecorder.Body).Decode(&resp)
		Expect(err).To(BeNil())
		Expect(resp).To(BeEquivalentTo([]structs.Voter{voter1, voter2}))
	})

	It("can create new voters", func() {
		req, _ := http.NewRequest("POST", "/admin/voters", bytes.NewBuffer([]byte(`
		{
			"start": 3,
			"end": 5
		}
		`)))
		responseRecorder := serveWithCookie(req)
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		voters, _ := db.GetDB().GetVoters()
		Expect(voters).To(HaveLen(5))
		Expect(voters[2].Username).To(Equal("0003"))
		Expect(voters[3].Username).To(Equal("0004"))
		Expect(voters[4].Username).To(Equal("0005"))
	})

	It("can fails with missing values", func() {
		req, _ := http.NewRequest("POST", "/admin/voters", bytes.NewBuffer([]byte(`{}`)))
		responseRecorder := serveWithCookie(req)
		Expect(responseRecorder.Code).To(Equal(http.StatusBadRequest))
	})

	It("can fails with invalid values", func() {
		req, _ := http.NewRequest("POST", "/admin/voters", bytes.NewBuffer([]byte(`
		{
			"start": 5,
			"end": 3
		}
		`)))
		responseRecorder := serveWithCookie(req)
		Expect(responseRecorder.Code).To(Equal(http.StatusBadRequest))
	})

	It("can invalidate a single voter", func() {
		req, _ := http.NewRequest("PUT", "/admin/voters/"+voter2.ID.String(), nil)
		responseRecorder := serveWithCookie(req)
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		voters, _ := db.GetDB().GetVoters()
		Expect(voters[0].Invalidated.Valid).To(BeFalse())
		Expect(voters[1].Invalidated.Valid).To(BeTrue())
		Expect(time.Since(voters[1].Invalidated.Time).Seconds()).To(BeNumerically("<", 1))
	})

	It("can delete a single voter", func() {
		req, _ := http.NewRequest("DELETE", "/admin/voters/"+voter2.ID.String(), nil)
		responseRecorder := serveWithCookie(req)
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		voters, _ := db.GetDB().GetVoters()
		Expect(voters).To(HaveLen(1))
		Expect(voters).To(BeEquivalentTo([]structs.Voter{voter1}))
	})
})

func serveWithCookie(req *http.Request) *httptest.ResponseRecorder {
	validAdminJWT, _ := auth.CreateJWT("admin", time.Minute)

	req.AddCookie(&http.Cookie{
		Name:  "auth",
		Value: validAdminJWT,
	})

	responseRecorder := httptest.NewRecorder()
	router := setupRouter()
	router.ServeHTTP(responseRecorder, req)

	return responseRecorder
}
