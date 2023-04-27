package db

import (
	"github.com/nusvcf/voting/backend/structs"
)

func (d *Database) CreateBallot(ballot *structs.Ballot) error {
	err := d.queryRow(queryOpts{
		SQL:  `INSERT INTO ballot (position, max_votes) VALUES ($1, $2) RETURNING id`,
		Args: []interface{}{ballot.Position, ballot.MaxVotes},
		Scan: []interface{}{&ballot.ID},
	})

	if err != nil {
		return err
	}

	for _, name := range ballot.Names {
		err = d.exec(queryOpts{
			SQL:  `INSERT INTO ballot_name (ballot_id, name) VALUES ($1, $2)`,
			Args: []interface{}{ballot.ID, name},
		})
	}

	return nil
}

func (d *Database) GetBallots() ([]structs.Ballot, error) {
	ballots := make([]structs.Ballot, 0)

	rows, cancel, err := d.query(queryOpts{
		SQL: `SELECT id, position, max_votes, created FROM ballot ORDER BY created`,
	})
	if err != nil {
		return nil, err
	}
	defer cancel()

	for rows.Next() {
		var ballot structs.Ballot
		ballot.Votes = make([]structs.BallotVote, 0)
		err = rows.Scan(&ballot.ID, &ballot.Position, &ballot.MaxVotes, &ballot.Created)
		ballots = append(ballots, ballot)
	}

	for i, ballot := range ballots {
		ballots[i].Names, err = d.getBallotNames(ballot)
		if err != nil {
			return nil, err
		}
	}

	return ballots, nil
}

func (d *Database) getBallotNames(ballot structs.Ballot) ([]string, error) {
	rows, cancel, err := d.query(queryOpts{
		SQL:  `SELECT name FROM ballot_name WHERE ballot_id = $1`,
		Args: []interface{}{ballot.ID},
	})
	if err != nil {
		return nil, err
	}
	defer cancel()

	ballotNames := make([]string, 0)

	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			return nil, err
		}
		ballotNames = append(ballotNames, name)
	}

	return ballotNames, nil
}

func (d *Database) DeleteAllBallots() error {
	return d.exec(queryOpts{SQL: `DELETE FROM ballot`})
}
