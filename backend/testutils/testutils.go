package testutils

import (
	"github.com/brianvoe/gofakeit/v6"
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

func CreateBallot() structs.Ballot {
	return structs.Ballot{
		Position: gofakeit.JobTitle(),
		MaxVotes: gofakeit.Number(1, 2),
		Names:    []string{gofakeit.Name(), gofakeit.Name(), gofakeit.Name()},
		Created:  time.Now(),
	}
}

func EqualBallot(otherBallot structs.Ballot) types.GomegaMatcher {
	return And(
		HaveField("Position", Equal(otherBallot.Position)),
		HaveField("MaxVotes", Equal(otherBallot.MaxVotes)),
		WithTransform(func(ballot structs.Ballot) bool {
			return time.Since(ballot.Created).Seconds() < 5
		}, BeTrue()),
		HaveField("Names", Equal(otherBallot.Names)),
	)
}
