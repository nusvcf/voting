package db

import (
	"github.com/gofrs/uuid"
	"github.com/nusvcf/voting/backend/structs"
)

func (d *Database) CreateVoter(voter structs.Voter) (uuid.UUID, error) {
	var id uuid.UUID
	err := d.queryRow(queryOpts{
		SQL:  `INSERT INTO voter (username, password) VALUES ($1, $2) RETURNING id`,
		Args: []interface{}{voter.Username, voter.Password},
		Scan: []interface{}{&id},
	})
	return id, err
}

func (d *Database) GetVoters() ([]structs.Voter, error) {
	rows, cancel, err := d.query(queryOpts{
		SQL: `SELECT id, username, password, last_seen, invalidated FROM voter ORDER BY username`,
	})
	defer cancel()

	if err != nil {
		return nil, err
	}

	voters := make([]structs.Voter, 0)

	for rows.Next() {
		var voter structs.Voter
		err := rows.Scan(&voter.ID, &voter.Username, &voter.Password, &voter.LastSeen, &voter.Invalidated)
		if err != nil {
			return nil, err
		}

		voters = append(voters, voter)
	}

	return voters, nil
}

func (d *Database) CheckSingleVoter(username, password string) (uuid.UUID, error) {
	id := uuid.Nil

	err := d.queryRow(queryOpts{
		SQL:  `SELECT id FROM voter WHERE username = $1 AND password = $2 AND invalidated IS NULL`,
		Args: []interface{}{username, password},
		Scan: []interface{}{&id},
	})

	if err != nil {
		return uuid.Nil, err
	}

	return id, err
}

func (d *Database) CheckIfVoterIdValid(id uuid.UUID) (bool, error) {
	var count int
	err := d.queryRow(queryOpts{
		SQL:  `SELECT COUNT(id) FROM voter WHERE id = $1 AND invalidated IS NULL`,
		Args: []interface{}{id},
		Scan: []interface{}{&count},
	})

	if err != nil {
		return false, err
	}

	if count == 0 {
		return false, nil
	}

	err = d.UpdateLastSeen(id)

	return true, err
}

func (d *Database) UpdateLastSeen(id uuid.UUID) error {
	return d.exec(queryOpts{
		SQL:  `UPDATE voter SET last_seen = NOW() WHERE id = $1`,
		Args: []interface{}{id},
	})
}

func (d *Database) InvalidateVoter(id uuid.UUID) error {
	return d.exec(queryOpts{
		SQL:  `UPDATE voter SET invalidated = NOW() WHERE id = $1`,
		Args: []interface{}{id},
	})
}

func (d *Database) DeleteVoter(id uuid.UUID) error {
	return d.exec(queryOpts{
		SQL:  `DELETE FROM voter WHERE id = $1`,
		Args: []interface{}{id},
	})
}

func (d *Database) DeleteAllVoters() error {
	return d.exec(queryOpts{
		SQL: `DELETE FROM voter`,
	})
}

func (d *Database) GetNumValidVoters() (int, error) {
	var count int
	err := d.queryRow(queryOpts{
		SQL:  `SELECT COUNT(id) FROM voter WHERE invalidated IS NULL AND last_seen IS NOT NULL`,
		Scan: []interface{}{&count},
	})
	return count, err
}
