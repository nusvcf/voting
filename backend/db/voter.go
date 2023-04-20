package db

import (
	"github.com/gofrs/uuid"
	"github.com/nusvcf/voting/backend/structs"
)

func (d *Database) CreateVoter(voter structs.Voter) (uuid.UUID, error) {
	return uuid.NewV4()
}

func (d *Database) GetVoters() ([]structs.Voter, error) {
	return nil, nil
}

func (d *Database) CheckSingleVoter(username, password string) (uuid.UUID, error) {
	return uuid.NewV4()
}
