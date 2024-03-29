package testutils

import (
	"github.com/brianvoe/gofakeit/v6"
	"github.com/gofrs/uuid"
	"github.com/nusvcf/voting/backend/db"
	"github.com/nusvcf/voting/backend/structs"

	"time"

	. "github.com/onsi/gomega"
	"github.com/onsi/gomega/types"
)

func CreateVoter() structs.Voter {
	return structs.Voter{
		Username: gofakeit.Name(),
		Password: gofakeit.Password(true, true, true, false, false, 8),
	}
}

func CreateAdminBallot() structs.AdminBallot {
	return structs.AdminBallot{
		Position: gofakeit.JobTitle(),
		MaxVotes: gofakeit.Number(1, 2),
		Names:    []string{gofakeit.Name(), gofakeit.Name(), gofakeit.Name()},
	}
}

func checkBallotNames(ballotNames []structs.BallotName, names []string) bool {
	if len(ballotNames) != len(names) {
		return false
	}

	d := make(map[string]bool)
	for _, name := range ballotNames {
		d[name.Name] = true
	}

	for _, name := range names {
		_, found := d[name]
		if !found {
			return false
		}
	}

	return true
}

func EqualBallot(ballotId uuid.UUID, otherBallot structs.AdminBallot) types.GomegaMatcher {
	return And(
		HaveField("ID", Equal(ballotId)),
		HaveField("Position", Equal(otherBallot.Position)),
		HaveField("MaxVotes", Equal(otherBallot.MaxVotes)),
		WithTransform(func(ballot structs.Ballot) float64 {
			return time.Since(ballot.Created).Seconds()
		}, BeNumerically("<", 1)),
		WithTransform(func(ballot structs.Ballot) bool {
			return time.Since(ballot.Created).Seconds() < 5
		}, BeTrue()),
		WithTransform(func(ballot structs.Ballot) bool {
			return checkBallotNames(ballot.Names, otherBallot.Names)
		}, BeTrue()),
	)
}

func EqualBallotWithoutId(otherBallot structs.AdminBallot) types.GomegaMatcher {
	return And(
		HaveField("ID", Not(Equal(uuid.Nil))),
		HaveField("Position", Equal(otherBallot.Position)),
		HaveField("MaxVotes", Equal(otherBallot.MaxVotes)),
		WithTransform(func(ballot structs.Ballot) float64 {
			return time.Since(ballot.Created).Seconds()
		}, BeNumerically("<", 1)),
		WithTransform(func(ballot structs.Ballot) bool {
			return time.Since(ballot.Created).Seconds() < 5
		}, BeTrue()),
		WithTransform(func(ballot structs.Ballot) bool {
			return checkBallotNames(ballot.Names, otherBallot.Names)
		}, BeTrue()),
	)
}

func EqualUserBallot(ballotId uuid.UUID, otherBallot structs.AdminBallot) types.GomegaMatcher {
	return And(
		HaveField("ID", Equal(ballotId)),
		HaveField("Position", Equal(otherBallot.Position)),
		HaveField("MaxVotes", Equal(otherBallot.MaxVotes)),
		WithTransform(func(ballot structs.UserBallot) bool {
			return checkBallotNames(ballot.Names, otherBallot.Names)
		}, BeTrue()),
	)
}

func EqualVote(otherVote structs.BallotVote) types.GomegaMatcher {
	return And(
		HaveField("VoterId", Equal(otherVote.VoterId)),
		HaveField("Abstain", Equal(otherVote.Abstain)),
		HaveField("NoConfidence", Equal(otherVote.NoConfidence)),
		HaveField("VotedFor", Equal(otherVote.VotedFor)),
	)
}

func GetVoterById(id uuid.UUID) structs.Voter {
	voters, _ := db.GetDB().GetVoters()

	for _, currVoter := range voters {
		if id == currVoter.ID {
			return currVoter
		}
	}

	return structs.Voter{}
}

func GetBallotById(id uuid.UUID) structs.Ballot {
	ballots, _ := db.GetDB().GetBallots()

	for _, currBallot := range ballots {
		if id == currBallot.ID {
			return currBallot
		}
	}

	return structs.Ballot{}
}
