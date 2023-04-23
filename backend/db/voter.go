package db

import (
	"github.com/gofrs/uuid"
	"github.com/nusvcf/voting/backend/structs"
)

func (d *Database) CreateVoter(voter structs.Voter) (uuid.UUID, error) {
	var id uuid.UUID
	err := d.queryRow(queryOpts{
		SQL: `INSERT INTO voters (username, password) VALUES ($1, $2) RETURNING id`,
	})
	return id, err
}

func (d *Database) GetVoters() ([]structs.Voter, error) {
	rows, cancel, err := d.query(queryOpts{
		SQL: `SELECT id, username, password FROM voters`,
	})
	defer cancel()

	if err != nil {
		return nil, err
	}

	voters := make([]structs.Voter, 0)

	for rows.Next() {
		var voter structs.Voter
		err := rows.Scan(&voter.ID, &voter.Username, &voter.Password)
		if err != nil {
			return nil, err
		}

		voters = append(voters, voter)
	}

	return voters, nil
}

func (d *Database) CheckSingleVoter(username, password string) (uuid.UUID, error) {
	var id uuid.UUID

	err := d.queryRow(queryOpts{
		SQL:  `SELECT id FROM voters WHERE username = $1 AND password = $2`,
		Args: []interface{}{username, password},
		Scan: []interface{}{id},
	})

	if err != nil {
		return uuid.Nil, err
	}

	return id, err
}
