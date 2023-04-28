package db_test

import (
	"github.com/gofrs/uuid"
	"github.com/nusvcf/voting/backend/structs"
	"github.com/nusvcf/voting/backend/testutils"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("DB Ballot Vote", func() {
	var ballot structs.AdminBallot
	var ballotId uuid.UUID
	var voter structs.Voter

	BeforeEach(func() {
		ballot = testutils.CreateAdminBallot()
		ballotId, _ = dbObj.CreateBallot(ballot)

		voter = testutils.CreateVoter()
		voter.ID, _ = dbObj.CreateVoter(voter)
	})

	AfterEach(func() {
		_ = dbObj.DeleteAllBallots()
		_ = dbObj.DeleteAllVoters()
	})

	Describe("allows voter to cast vote", func() {
		It("can vote for 2 names", func() {
			//err := dbObj.CastVote(ballotId, structs.BallotVote{VoterId: voter.ID, VotedFor: []string{ballot.Names[0], ballot.Names[1]}})
			//Expect(err).To(BeNil())
			//
			//votes, err := dbObj.GetVotes(ballotId)
			//Expect(err).To(BeNil())
			//Expect(votes).To(ContainElement(testutils.EqualVote(structs.BallotVote{
			//	VoterId:      voter.ID,
			//	NoConfidence: true,
			//})))
		})

		It("can cast no confidence vote", func() {
			err := dbObj.CastVote(ballotId, structs.BallotVote{VoterId: voter.ID, NoConfidence: true})
			Expect(err).To(BeNil())

			votes, err := dbObj.GetVotes(ballotId)
			Expect(err).To(BeNil())
			Expect(votes).To(ContainElement(testutils.EqualVote(structs.BallotVote{
				VoterId:      voter.ID,
				NoConfidence: true,
			})))
		})

		It("can cast abstain vote", func() {
			err := dbObj.CastVote(ballotId, structs.BallotVote{VoterId: voter.ID, Abstain: true})
			Expect(err).To(BeNil())

			votes, err := dbObj.GetVotes(ballotId)
			Expect(err).To(BeNil())
			Expect(votes).To(ContainElement(testutils.EqualVote(structs.BallotVote{
				VoterId: voter.ID,
				Abstain: true,
			})))
		})
	})

	Describe("Check if voter has voted for ballot", func() {
		When("voter has not yet voted", func() {
			It("returns false", func() {
				hasVoted, err := dbObj.VoterHasVotedForBallot(voter.ID, ballotId)
				Expect(err).To(BeNil())
				Expect(hasVoted).To(BeFalse())
			})
		})

		When("voter has already voted", func() {
			BeforeEach(func() {
				_ = dbObj.CastVote(ballotId, structs.BallotVote{VoterId: voter.ID, Abstain: true})
			})

			It("returns false", func() {
				//hasVoted, err := dbObj.VoterHasVotedForBallot(voter.ID, ballotId)
				//Expect(err).To(BeNil())
				//Expect(hasVoted).To(BeTrue())
			})
		})
	})
})
