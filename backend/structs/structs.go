package structs

import (
	"github.com/gofrs/uuid"
	"gopkg.in/guregu/null.v4"
	"time"
)

type Voter struct {
	ID          uuid.UUID `json:"id"`
	Username    string    `json:"username"`
	Password    string    `json:"password"`
	LastSeen    null.Time `json:"last_seen"`
	Invalidated null.Time `json:"invalidated"`
}

type Ballot struct {
	ID          uuid.UUID `json:"id"`
	Position    string    `json:"position"`
	MaxVotes    int       `json:"max_votes"`
	Created     time.Time `json:"created"`
	Closed      null.Time `json:"closed"`
	Invalidated null.Time `json:"invalidated"`
	Names       []string  `json:"names"`
}
