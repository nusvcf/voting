package db

import (
	"context"
	"github.com/jackc/pgx/v4"
)

type queryOpts struct {
	SQL  string
	Args []interface{}
	Scan []interface{}
}

func (d *Database) query(opts queryOpts) (pgx.Rows, context.CancelFunc, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	rows, err := d.Pool.Query(ctx, opts.SQL, opts.Args...)
	return rows, cancel, err
}

func (d *Database) queryRow(opts queryOpts) error {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	err := d.Pool.QueryRow(ctx, opts.SQL, opts.Args...).Scan(opts.Scan...)
	return err
}

func (d *Database) exec(opts queryOpts) error {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()
	_, err := d.Pool.Exec(ctx, opts.SQL, opts.Args...)
	return err
}
