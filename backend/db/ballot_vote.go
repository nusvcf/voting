package db

import (
	"context"
	"github.com/gofrs/uuid"
	"github.com/jackc/pgx/v4"
	"github.com/nusvcf/voting/backend/structs"
	"time"
)

func (d *Database) VoterHasVotedForBallot(voterId uuid.UUID, ballotId uuid.UUID) (bool, error) {
	var count int
	err := d.queryRow(queryOpts{
		SQL:  `SELECT COUNT(id) FROM vote WHERE voter_id = $1 AND ballot_id = $2`,
		Args: []interface{}{voterId, ballotId},
		Scan: []interface{}{&count},
	})
	return count > 0, err
}

func (d *Database) CastVote(ballotId uuid.UUID, voterId uuid.UUID, vote structs.VoteCast) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	tx, err := d.Pool.Begin(ctx)
	if err != nil {
		return err
	}

	defer func(tx pgx.Tx, ctx context.Context) {
		_ = tx.Rollback(ctx)
	}(tx, ctx)

	var voteId uuid.UUID

	row := tx.QueryRow(ctx,
		`INSERT INTO vote (ballot_id, voter_id, abstain, no_confidence) VALUES ($1, $2, $3, $4) RETURNING id`,
		ballotId, voterId, vote.Abstain, vote.NoConfidence)
	if err := row.Scan(&voteId); err != nil {
		return err
	}

	if !vote.Abstain && !vote.NoConfidence && len(vote.VotedFor) > 0 {
		for _, nameId := range vote.VotedFor {
			_, err = tx.Exec(ctx, `INSERT INTO vote_name (vote_id, name_id) VALUES ($1, $2)`, voteId, nameId)
			if err != nil {
				return err
			}
		}
	}

	err = tx.Commit(ctx)

	return err
}

func (d *Database) GetVotes(ballotId uuid.UUID) ([]structs.BallotVote, error) {
	votes := make([]structs.BallotVote, 0)

	rows, cancel, err := d.query(queryOpts{
		SQL:  `SELECT id, created, voter_id, abstain, no_confidence FROM vote WHERE ballot_id = $1`,
		Args: []interface{}{ballotId},
	})
	if err != nil {
		return nil, err
	}
	defer cancel()

	for rows.Next() {
		var vote structs.BallotVote
		err = rows.Scan(&vote.Id, &vote.Created, &vote.VoterId, &vote.Abstain, &vote.NoConfidence)
		if err != nil {
			return nil, err
		}

		votes = append(votes, vote)
	}

	for i, vote := range votes {
		if !vote.Abstain && !vote.NoConfidence {
			votes[i].VotedFor, err = d.getVotedForIds(vote.Id)
			if err != nil {
				return nil, err
			}
		}
	}

	return votes, nil
}

func (d *Database) getVotedForIds(voteId uuid.UUID) ([]uuid.UUID, error) {
	ids := make([]uuid.UUID, 0)
	rows, cancel, err := d.query(queryOpts{
		SQL:  `SELECT name_id FROM vote_name WHERE vote_id = $1`,
		Args: []interface{}{voteId},
	})
	if err != nil {
		return nil, err
	}
	defer cancel()

	for rows.Next() {
		var id uuid.UUID
		err := rows.Scan(&id)
		if err != nil {
			return nil, err
		}

		ids = append(ids, id)
	}

	return ids, nil
}
