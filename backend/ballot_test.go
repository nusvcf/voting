package main

import (
	"bytes"
	"encoding/json"
	"github.com/nusvcf/voting/backend/db"
	"github.com/nusvcf/voting/backend/structs"
	"github.com/nusvcf/voting/backend/testutils"
	"net/http"

	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("Ballots", func() {
	var ballot structs.Ballot

	BeforeEach(func() {
		performBootstrap("admin-pw")

		ballot = testutils.CreateBallot()
		_ = db.GetDB().CreateBallot(&ballot)
	})

	AfterEach(func() {
		_ = db.GetDB().ClearBootstrap()
		_ = db.GetDB().DeleteAllBallots()
	})

	It("can get the list of existing ballots", func() {
		req, _ := http.NewRequest("GET", "/admin/ballots", nil)
		responseRecorder := serveWithCookie(req)
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		var resp []structs.Ballot
		err := json.NewDecoder(responseRecorder.Body).Decode(&resp)
		Expect(err).To(BeNil())
		Expect(resp).To(ContainElement(testutils.EqualBallot(ballot)))
	})

	It("can create a new ballot", func() {
		req, _ := http.NewRequest("POST", "/admin/ballots", bytes.NewBufferString(`{
			"position": "Chair",
			"maxVotes": 2,
			"names": ["Matthew", "Mark"]
		}`))
		responseRecorder := serveWithCookie(req)
		Expect(responseRecorder.Code).To(Equal(http.StatusOK))

		ballots, err := db.GetDB().GetBallots()
		Expect(err).To(BeNil())
		Expect(ballots).To(ContainElement(testutils.EqualBallot(structs.Ballot{
			Position: "Chair",
			MaxVotes: 2,
			Names:    []string{"Matthew", "Mark"},
			Votes:    []structs.BallotVote{},
		})))
	})
})
