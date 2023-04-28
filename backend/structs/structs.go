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

// VoteCast by a voter through the API
type VoteCast struct {
	Abstain      bool        `json:"abstain"`
	NoConfidence bool        `json:"noConfidence"`
	VotedFor     []uuid.UUID `json:"votedFor"`
}

// BallotVote that is stored in the database when a voter makes a vote using VoteCast, and
// passed to the admin when retrieving information on a ballot.
type BallotVote struct {
	Id           uuid.UUID   `json:"id"`
	VoterId      uuid.UUID   `json:"voterId"`
	Created      time.Time   `json:"created"`
	Status       string      `json:"status"`
	Abstain      bool        `json:"abstain"`
	NoConfidence bool        `json:"noConfidence"`
	VotedFor     []uuid.UUID `json:"votedFor"`
}

type BallotName struct {
	Id   uuid.UUID `json:"id"`
	Name string    `json:"name"`
}

type Ballot struct {
	ID          uuid.UUID    `json:"id"`
	Position    string       `json:"position"`
	MaxVotes    int          `json:"maxVotes"`
	Created     time.Time    `json:"created"`
	Closed      null.Time    `json:"closed"`
	Invalidated null.Time    `json:"invalidated"`
	Names       []BallotName `json:"names"`
	Votes       []BallotVote `json:"votes"`
}

// UserBallot represents a subset of the fields found on the
// actual Ballot object. This is done to make it explicit which
// fields would not be populated for users.
type UserBallot struct {
	ID       uuid.UUID    `json:"id"`
	Position string       `json:"position"`
	MaxVotes int          `json:"maxVotes"`
	Names    []BallotName `json:"names"`
}

// AdminBallot is the payload expected from the admin endpoint
// when creating a new ballot.
type AdminBallot struct {
	Position string   `json:"position" binding:"required"`
	MaxVotes int      `json:"maxVotes" binding:"required"`
	Names    []string `json:"names" binding:"required"`
}
