package testutils

import (
	"github.com/brianvoe/gofakeit/v6"
	"github.com/gofrs/uuid"
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

func EqualBallot(otherBallot structs.AdminBallot) types.GomegaMatcher {
	return And(
		HaveField("ID", Not(Equal(uuid.Nil))), // TODO
		HaveField("Position", Equal(otherBallot.Position)),
		HaveField("MaxVotes", Equal(otherBallot.MaxVotes)),
		WithTransform(func(ballot structs.Ballot) bool {
			return time.Since(ballot.Created).Seconds() < 5
		}, BeTrue()),
		WithTransform(func(ballot structs.Ballot) bool {
			return checkBallotNames(ballot.Names, otherBallot.Names)
		}, BeTrue()),
	)
}

func EqualUserBallot(otherBallot structs.AdminBallot) types.GomegaMatcher {
	return And(
		HaveField("ID", Not(Equal(uuid.Nil))), // TODO
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
