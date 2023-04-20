package structs

import (
	"github.com/gofrs/uuid"
	"gopkg.in/guregu/null.v4"
)

type Voter struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	Password string    `json:"password"`
	LastSeen null.Time `json:"last_seen"`
}
