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

		voter = testutils.CreateVoter()
		voter.ID, _ = db.GetDB().CreateVoter(voter)
	})

	AfterEach(func() {
		_ = db.GetDB().ClearBootstrap()
		_ = db.GetDB().DeleteAllBallots()
		_ = db.GetDB().DeleteAllVoters()
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
		Expect(ballots).To(ContainElement(testutils.EqualBallotWithoutId(structs.AdminBallot{
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

	It("lets user cast their vote", func() {
		req, _ := http.NewRequest("POST", "/user/ballot/"+ballotId.String(), bytes.NewBufferString(`{
			"abstain": true,
			"noConfidence": false,
			"votedFor": []
		}`))
		responseRecorder := serveWithCookie(req, voter.ID.String())
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		voted, err := db.GetDB().VoterHasVotedForBallot(voter.ID, ballotId)
		Expect(err).To(BeNil())
		Expect(voted).To(BeTrue())
	})

	When("voter has already cast their vote", func() {
		BeforeEach(func() {
			_ = db.GetDB().CastVote(ballotId, voter.ID, structs.VoteCast{Abstain: true})
		})

		It("does not return the current ballot if the voter already voted", func() {
			ExpectUserHasNullBallot(voter.ID)
		})
	})

	When("no ballot is created", func() {
		BeforeEach(func() {
			_ = db.GetDB().DeleteAllBallots()
		})

		It("does not return 500", func() {
			ExpectUserHasNullBallot(voter.ID)
		})
	})

	It("allows admin to close a ballot", func() {
		req, _ := http.NewRequest("POST", "/admin/ballots/"+ballotId.String(), nil)
		responseRecorder := serveWithCookie(req, "admin")
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		ExpectUserHasNullBallot(voter.ID)
	})
})

func ExpectUserHasNullBallot(voterId uuid.UUID) {
	req, _ := http.NewRequest("GET", "/user/ballot", nil)
	responseRecorder := serveWithCookie(req, voterId.String())
	Expect(responseRecorder.Code).To(Equal(http.StatusOK))

	var resp structs.UserBallot
	err := json.NewDecoder(responseRecorder.Body).Decode(&resp)
	Expect(err).To(BeNil())
	Expect(resp.ID).To(Equal(uuid.Nil))
	Expect(resp.Position).To(BeEmpty())
	Expect(resp.Names).To(BeEmpty())
}
