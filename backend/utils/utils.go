package utils

import (
	"crypto/rand"
	"github.com/gofrs/uuid"
	"github.com/nusvcf/voting/backend/db"
	"github.com/nusvcf/voting/backend/structs"
	"math/big"
)

var letters = []rune("ABCDEFGHJKLMNPQRSTUVWXY3456789-@!?&#%")

func RandStr(n int) string {
	b := make([]rune, n)
	for i := range b {
		x, _ := rand.Int(rand.Reader, big.NewInt(int64(len(letters))))
		b[i] = letters[x.Int64()]

	}
	return string(b)
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
