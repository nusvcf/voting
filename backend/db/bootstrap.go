package db

import "fmt"

func (d *Database) GetBootstrapPassword() (string, error) {
	var password string
	err := d.queryRow(queryOpts{
		SQL:  `SELECT admin_pw_hashed FROM bootstrap LIMIT 1`,
		Scan: []interface{}{&password},
	})
	return password, err
}

//func (d *Database) GetBootstrapId() (string, error) {
//	var id string
//	err := d.queryRow(queryOpts{
//		SQL:  `SELECT id FROM bootstrap LIMIT 1`,
//		Scan: []interface{}{&id},
//	})
//	return id, err
//}

func (d *Database) SetBootstrap(password string) error {
	pw, _ := d.GetBootstrapPassword()
	if pw != "" {
		return fmt.Errorf("system already bootstrapped")
	}

	return d.exec(queryOpts{
		SQL:  `INSERT INTO bootstrap (admin_pw_hashed) VALUES ($1)`,
		Args: []interface{}{password},
	})
}

func (d *Database) ClearBootstrap() error {
	return d.exec(queryOpts{
		SQL: `DELETE FROM bootstrap`,
	})
}
