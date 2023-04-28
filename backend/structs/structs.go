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
	LastSeen    null.Time `json:"lastSeen"`
	Invalidated null.Time `json:"invalidated"`
}

type BallotVote struct {
	ID       uuid.UUID `json:"id"`
	VoterID  uuid.UUID `json:"voterId"`
	Status   string    `json:"status"`
	VotedFor []string  `json:"votedFor"`
}

type Ballot struct {
	ID          uuid.UUID    `json:"id"`
	Position    string       `json:"position" binding:"required"`
	MaxVotes    int          `json:"maxVotes" binding:"required"`
	Created     time.Time    `json:"created"`
	Closed      null.Time    `json:"closed"`
	Invalidated null.Time    `json:"invalidated"`
	Names       []string     `json:"names" binding:"required"`
	Votes       []BallotVote `json:"votes"`
}

// UserBallot represents a subset of the fields found on the
// actual Ballot object. This is done to make it explicit which
// fields would not be populated for users.
type UserBallot struct {
	ID       uuid.UUID `json:"id"`
	Position string    `json:"position" binding:"required"`
	MaxVotes int       `json:"maxVotes" binding:"required"`
	Names    []string  `json:"names" binding:"required"`
}
