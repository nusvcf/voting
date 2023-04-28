package db_test

import (
	"github.com/gofrs/uuid"
	"github.com/nusvcf/voting/backend/structs"
	"github.com/nusvcf/voting/backend/testutils"
	"github.com/nusvcf/voting/backend/utils"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
	"time"
)

var _ = Describe("DB Ballot", func() {
	var ballot structs.AdminBallot
	var ballotId uuid.UUID

	BeforeEach(func() {
		ballot = testutils.CreateAdminBallot()
		ballotId, _ = dbObj.CreateBallot(ballot)
	})

	AfterEach(func() {
		_ = dbObj.DeleteAllBallots()
	})

	It("creates a ballot", func() {
		newBallot := testutils.CreateAdminBallot()
		ballotId, err := dbObj.CreateBallot(newBallot)
		Expect(err).To(BeNil())
		Expect(ballotId).ToNot(Equal(uuid.Nil))
	})

	It("gets ballot details with names", func() {
		ballots, err := dbObj.GetBallots()
		Expect(err).To(BeNil())
		Expect(ballots).To(ContainElement(testutils.EqualBallot(ballotId, ballot)))
	})

	It("can close ballots", func() {
		err := dbObj.CloseBallot(ballotId)
		Expect(err).To(BeNil())
		foundBallot := utils.GetBallotById(ballotId)
		Expect(time.Since(foundBallot.Closed.Time).Seconds()).To(BeNumerically("<", 1))
	})

	It("can invalidate ballots", func() {
		err := dbObj.InvalidateBallot(ballotId)
		Expect(err).To(BeNil())
		foundBallot := utils.GetBallotById(ballotId)
		Expect(time.Since(foundBallot.Invalidated.Time).Seconds()).To(BeNumerically("<", 1))
	})

	Describe("Latest Open Ballot", func() {
		It("returns the current open ballot", func() {
			openBallot, err := dbObj.GetEarliestOpenBallot()
			Expect(err).To(BeNil())
			Expect(openBallot).To(testutils.EqualUserBallot(ballotId, ballot))
		})

		When("ballot is closed", func() {
			BeforeEach(func() {
				_ = dbObj.CloseBallot(ballotId)
			})

			It("does not return ballot", func() {
				_, err := dbObj.GetEarliestOpenBallot()
				Expect(err).ToNot(BeNil())
			})
		})

		When("ballot is invalidated", func() {
			BeforeEach(func() {
				_ = dbObj.InvalidateBallot(ballotId)
			})

			It("does not return ballot", func() {
				_, err := dbObj.GetEarliestOpenBallot()
				Expect(err).ToNot(BeNil())
			})
		})
	})

	Describe("Get num valid voters", func() {
		var voterId uuid.UUID

		BeforeEach(func() {
			voterId, _ = dbObj.CreateVoter(testutils.CreateVoter())
			_ = dbObj.UpdateLastSeen(voterId)
		})

		AfterEach(func() {
			_ = dbObj.DeleteAllVoters()
		})

		When("ballot is open", func() {
			It("gets count from number of voters", func() {
				fetchedBallot := utils.GetBallotById(ballotId)
				Expect(fetchedBallot.NumValidVoters).To(BeNumerically(">", 0))
			})
		})

		When("ballot is closed", func() {
			BeforeEach(func() {
				_ = dbObj.CloseBallot(ballotId)
				_ = dbObj.InvalidateVoter(voterId)
			})

			It("gets count from stored value in ballot", func() {
				fetchedBallot := utils.GetBallotById(ballotId)
				Expect(fetchedBallot.NumValidVoters).To(BeNumerically(">", 0))
			})
		})
	})
})
