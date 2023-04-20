'use strict';
const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 15;
const prompt = require('prompt');

var schema = {
	properties: {
		password: {
			description: 'Password',
			required: true,
			hidden: true
		},
		password2: {
			description: 'Repeat password',
			required: true,
			hidden: true
		}
	}
};

function main() {
	prompt.start();
	prompt.get(schema, function(err, result) {
		if (result.password !== result.password2) {
			console.log('Passwords do not match. ');
		} else {
			console.log('Hashing...');
			bcrypt.hash(result.password, saltRounds, function(err, pwHash) {
				fs.writeFileSync('admin.auth', JSON.stringify(pwHash), (err) => {
					if (err) {
						console.log(err);
					} else {
						console.log('Hashed credentials saved to admin.auth');
					}
				});
			});
		}
	});
}

main();
