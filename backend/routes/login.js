const express = require('express');
const router = express.Router();
const checkId = require('./checkId');
const bcrypt = require('bcrypt');

//Log in authentication
router.post('/', (req, res) => {
	const ADMIN = 'admin';
	const USER = 'user';

	//Error checking
	const username = req.body.username;
	const password = req.body.password;
	const usernameToVoterIndex = req.app.locals.usernameToVoterIndex;
	const voters = req.app.locals.voters;

	let response = {
		success: false
	};

	let id = 'admin';

	//Check if username is valid
	if (username !== ADMIN) {
		const idx = checkId(usernameToVoterIndex, username);
		if (idx === -1) {
			res.json(response);
			return;
		}

		//Check if username and password tally
		if (password !== voters[idx].password) {
			res.json(response);
			return;
		}
		id = voters[idx].id;
	} else {
		// Check if password is correct
		let match = bcrypt.compareSync(password, req.app.locals.adminPwHash);
		if (!match) {
			res.json(response);
			return;
		} else {
			req.app.locals.adminPw = password
		}
	}

	//Successful, set session states
	req.session.username = username;
	req.session.userid = id;
	if (username === ADMIN) {
		req.session.userType = ADMIN;
		response.userType = ADMIN;
	} else {
		req.session.userType = USER;
		response.userType = USER;
	}
	response.success = true;
	response.id = id;
	res.json(response);
});

module.exports = router;
