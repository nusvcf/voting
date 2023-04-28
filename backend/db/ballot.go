package db

import (
	"github.com/gofrs/uuid"
	"github.com/nusvcf/voting/backend/structs"
)

func (d *Database) CreateBallot(ballot structs.AdminBallot) (uuid.UUID, error) {
	id := uuid.Nil

	err := d.queryRow(queryOpts{
		SQL:  `INSERT INTO ballot (position, max_votes) VALUES ($1, $2) RETURNING id`,
		Args: []interface{}{ballot.Position, ballot.MaxVotes},
		Scan: []interface{}{&id},
	})

	if err != nil {
		return id, err
	}

	for _, name := range ballot.Names {
		err = d.exec(queryOpts{
			SQL:  `INSERT INTO ballot_name (ballot_id, name) VALUES ($1, $2)`,
			Args: []interface{}{id, name},
		})
		if err != nil {
			return id, err
		}
	}

	return id, nil
}

func (d *Database) GetBallots() ([]structs.Ballot, error) {
	ballots := make([]structs.Ballot, 0)

	rows, cancel, err := d.query(queryOpts{
		SQL: `SELECT id, position, max_votes, created, closed, invalidated 
			FROM ballot ORDER BY created`,
	})
	if err != nil {
		return nil, err
	}
	defer cancel()

	for rows.Next() {
		var ballot structs.Ballot
		ballot.Votes = make([]structs.BallotVote, 0)
		err = rows.Scan(&ballot.ID, &ballot.Position, &ballot.MaxVotes, &ballot.Created, &ballot.Closed, &ballot.Invalidated)
		ballots = append(ballots, ballot)
	}

	for i, ballot := range ballots {
		ballots[i].Names, err = d.getBallotNames(ballot.ID)
		if err != nil {
			return nil, err
		}
	}

	return ballots, nil
}

func (d *Database) getBallotNames(ballotID uuid.UUID) ([]structs.BallotName, error) {
	rows, cancel, err := d.query(queryOpts{
		SQL:  `SELECT id, name FROM ballot_name WHERE ballot_id = $1`,
		Args: []interface{}{ballotID},
	})
	if err != nil {
		return nil, err
	}
	defer cancel()

	ballotNames := make([]structs.BallotName, 0)

	for rows.Next() {
		var ballotName structs.BallotName
		if err := rows.Scan(&ballotName.Id, &ballotName.Name); err != nil {
			return nil, err
		}
		ballotNames = append(ballotNames, ballotName)
	}

	return ballotNames, nil
}

func (d *Database) DeleteAllBallots() error {
	return d.exec(queryOpts{SQL: `DELETE FROM ballot`})
}

func (d *Database) CloseBallot(id uuid.UUID) error {
	return d.exec(queryOpts{
		SQL:  `UPDATE ballot SET closed = NOW() WHERE id = $1`,
		Args: []interface{}{id},
	})
}

func (d *Database) InvalidateBallot(id uuid.UUID) error {
	return d.exec(queryOpts{
		SQL:  `UPDATE ballot SET invalidated = NOW() WHERE id = $1`,
		Args: []interface{}{id},
	})
}

func (d *Database) GetEarliestOpenBallot() (structs.UserBallot, error) {
	var ballot structs.UserBallot

	err := d.queryRow(queryOpts{
		SQL:  "SELECT id, position, max_votes FROM ballot WHERE invalidated IS NULL AND closed IS NULL ORDER BY created LIMIT 1",
		Scan: []interface{}{&ballot.ID, &ballot.Position, &ballot.MaxVotes},
	})

	if err != nil {
		return structs.UserBallot{}, err
	}

	ballot.Names, err = d.getBallotNames(ballot.ID)

	return ballot, err
}
