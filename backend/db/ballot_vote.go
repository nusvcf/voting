package db

import (
	"context"
	"github.com/gofrs/uuid"
	"github.com/jackc/pgx/v4"
	"github.com/nusvcf/voting/backend/structs"
	"time"
)

func (d *Database) VoterHasVotedForBallot(voterId uuid.UUID, ballotId uuid.UUID) (bool, error) {
	return false, nil
}

func (d *Database) CastVote(ballotId uuid.UUID, vote structs.BallotVote) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	tx, err := d.Pool.Begin(ctx)
	if err != nil {
		return err
	}

	defer func(tx pgx.Tx, ctx context.Context) {
		_ = tx.Rollback(ctx)
	}(tx, ctx)

	err = d.exec(queryOpts{
		SQL: `INSERT INTO vote 
    		(ballot_id, voter_id, abstain, no_confidence, name_id) 
			VALUES ($1, $2, $3, $4, $5)`,
		Args: []interface{}{ballotId, vote.VoterId, vote.Abstain, vote.NoConfidence, nil},
	})

	//for _, name := range names {
	//	d.exec(queryOpts{
	//		SQL: `INSERT INTO vote (voter_i) VALUES ()`,
	//	})
	//}

	return err
}

func (d *Database) GetVotes(ballotId uuid.UUID) ([]structs.BallotVote, error) {
	votes := make([]structs.BallotVote, 0)

	rows, cancel, err := d.query(queryOpts{
		SQL:  `SELECT created, voter_id, abstain, no_confidence FROM vote WHERE ballot_id = $1`,
		Args: []interface{}{ballotId},
	})
	if err != nil {
		return nil, err
	}
	defer cancel()

	for rows.Next() {
		var vote structs.BallotVote
		err = rows.Scan(&vote.Created, &vote.VoterId, &vote.Abstain, &vote.NoConfidence)
		if err != nil {
			return nil, err
		}

		votes = append(votes, vote)
	}

	return votes, nil
}
