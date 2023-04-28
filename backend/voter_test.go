package main

import (
	"bytes"
	"encoding/json"
	"github.com/nusvcf/voting/backend/auth"
	"github.com/nusvcf/voting/backend/db"
	"github.com/nusvcf/voting/backend/structs"
	"github.com/nusvcf/voting/backend/testutils"
	"github.com/nusvcf/voting/backend/utils"
	"net/http"
	"net/http/httptest"
	"time"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("Voters API", func() {
	var voter1, voter2 structs.Voter

	BeforeEach(func() {
		performBootstrap("admin-pw")

		voter1 = testutils.CreateVoter()
		voter1.ID, _ = db.GetDB().CreateVoter(voter1)
		voter2 = testutils.CreateVoter()
		voter2.ID, _ = db.GetDB().CreateVoter(voter2)
	})

	AfterEach(func() {
		_ = db.GetDB().ClearBootstrap()
		_ = db.GetDB().DeleteAllVoters()
	})

	It("can get the list of existing voters", func() {
		req, _ := http.NewRequest("GET", "/admin/voters", nil)
		responseRecorder := serveWithCookie(req, "admin")
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		var resp []structs.Voter
		err := json.NewDecoder(responseRecorder.Body).Decode(&resp)
		Expect(err).To(BeNil())
		Expect(resp).To(ContainElements(voter1, voter2))
	})

	It("can create new voters", func() {
		req, _ := http.NewRequest("POST", "/admin/voters", bytes.NewBuffer([]byte(`
		{
			"start": 3,
			"end": 5
		}
		`)))
		responseRecorder := serveWithCookie(req, "admin")
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		voters, _ := db.GetDB().GetVoters()
		Expect(voters).To(HaveLen(5))
		Expect(voters[0].Username).To(Equal("0003"))
		Expect(voters[1].Username).To(Equal("0004"))
		Expect(voters[2].Username).To(Equal("0005"))
	})

	It("can fails with missing values", func() {
		req, _ := http.NewRequest("POST", "/admin/voters", bytes.NewBuffer([]byte(`{}`)))
		responseRecorder := serveWithCookie(req, "admin")
		Expect(responseRecorder.Code).To(Equal(http.StatusBadRequest))
	})

	It("can fails with invalid values", func() {
		req, _ := http.NewRequest("POST", "/admin/voters", bytes.NewBuffer([]byte(`
		{
			"start": 5,
			"end": 3
		}
		`)))
		responseRecorder := serveWithCookie(req, "admin")
		Expect(responseRecorder.Code).To(Equal(http.StatusBadRequest))
	})

	It("can invalidate a single voter", func() {
		req, _ := http.NewRequest("PUT", "/admin/voters/"+voter2.ID.String(), nil)
		responseRecorder := serveWithCookie(req, "admin")
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		voter1Found := utils.GetVoterById(voter1.ID)
		voter2Found := utils.GetVoterById(voter2.ID)
		Expect(voter1Found.Invalidated.Valid).To(BeFalse())
		Expect(voter2Found.Invalidated.Valid).To(BeTrue())
		Expect(time.Since(voter2Found.Invalidated.Time).Seconds()).To(BeNumerically("<", 1))
	})

	It("can delete a single voter", func() {
		req, _ := http.NewRequest("DELETE", "/admin/voters/"+voter2.ID.String(), nil)
		responseRecorder := serveWithCookie(req, "admin")
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		voters, _ := db.GetDB().GetVoters()
		Expect(voters).To(HaveLen(1))
		Expect(voters).To(BeEquivalentTo([]structs.Voter{voter1}))
	})
})

func serveWithCookie(req *http.Request, userId string) *httptest.ResponseRecorder {
	validAdminJWT, _ := auth.CreateJWT(userId, time.Minute)

	req.AddCookie(&http.Cookie{
		Name:  "auth",
		Value: validAdminJWT,
	})

	responseRecorder := httptest.NewRecorder()
	router := setupRouter()
	router.ServeHTTP(responseRecorder, req)

	return responseRecorder
}
