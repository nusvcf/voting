package main

import (
	"bytes"
	"encoding/json"
	"github.com/gofrs/uuid"
	"github.com/nusvcf/voting/backend/db"
	"github.com/nusvcf/voting/backend/structs"
	"github.com/nusvcf/voting/backend/testutils"
	"net/http"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("Ballots", func() {
	var ballot structs.AdminBallot
	var ballotId uuid.UUID
	var voter structs.Voter

	BeforeEach(func() {
		performBootstrap("admin-pw")

		ballot = testutils.CreateAdminBallot()
		ballotId, _ = db.GetDB().CreateBallot(ballot)
		voter.ID, _ = db.GetDB().CreateVoter(voter)
	})

	AfterEach(func() {
		_ = db.GetDB().ClearBootstrap()
		_ = db.GetDB().DeleteAllBallots()
	})

	It("can get the list of existing ballots", func() {
		req, _ := http.NewRequest("GET", "/admin/ballots", nil)
		responseRecorder := serveWithCookie(req, "admin")
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		var resp []structs.Ballot
		err := json.NewDecoder(responseRecorder.Body).Decode(&resp)
		Expect(err).To(BeNil())
		Expect(resp).To(ContainElement(testutils.EqualBallot(ballotId, ballot)))
	})

	It("can create a new ballot", func() {
		req, _ := http.NewRequest("POST", "/admin/ballots", bytes.NewBufferString(`{
			"position": "Chair",
			"maxVotes": 2,
			"names": ["Matthew", "Mark"]
		}`))
		responseRecorder := serveWithCookie(req, "admin")
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		ballots, err := db.GetDB().GetBallots()
		Expect(err).To(BeNil())
		Expect(ballots).To(ContainElement(testutils.EqualBallot(ballotId, structs.AdminBallot{
			Position: "Chair",
			MaxVotes: 2,
			Names:    []string{"Matthew", "Mark"},
		})))
	})

	It("returns the current open ballot for a voter", func() {
		req, _ := http.NewRequest("GET", "/user/ballot", nil)
		responseRecorder := serveWithCookie(req, voter.ID.String())
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		var resp structs.UserBallot
		err := json.NewDecoder(responseRecorder.Body).Decode(&resp)
		Expect(err).To(BeNil())
		Expect(resp).To(testutils.EqualUserBallot(ballotId, ballot))
	})

	It("does not return the current ballot if the voter already voted", func() {

	})
})
