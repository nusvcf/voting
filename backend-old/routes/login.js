const express = require("express");
const router = express.Router();
const checkId = require("./checkId");
const bcrypt = require("bcrypt");
const XlsxPopulate = require("xlsx-populate");

var local = require("../localPersistance");

//Log in authentication
router.post("/", (req, res) => {
    const ADMIN = "admin";
    const USER = "user";

    //Error checking
    const username = req.body.username;
    const password = req.body.password;
    const usernameToVoterIndex = req.app.locals.usernameToVoterIndex;
    const voters = req.app.locals.voters;

    let response = {
        success: false
    };

    let id = "admin";

    if (username !== ADMIN) {
        // User
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

        // Check if voter is invalidated
        if (!voters[idx].isValid) {
            res.json(response);
            return;
        }
        id = voters[idx].id;
    } else {
        // Admin
        // Check if password is correct
        let match = bcrypt.compareSync(password, req.app.locals.adminPwHash);
        if (!match) {
            res.json(response);
            return;
        } else {
            req.app.locals.adminPw = password;
        }
    }

    //Successful, set session states
    req.session.username = username;
    req.session.userid = id;
    if (username === ADMIN) {
        req.session.userType = ADMIN;
        response.userType = ADMIN;

        // Prepare workbook
        XlsxPopulate.fromBlankAsync().then(workbook => {
            return workbook.toFileAsync("./Votes.xlsx", {
                password: req.app.locals.adminPw
            });
        });

        // Try to load files if possible
        let data = local.load(req.app.locals.adminPw);
        for (let key in data) {
            req.app.locals[key] = data[key];
        }
    } else {
        req.session.userType = USER;
        response.userType = USER;
    }
    response.success = true;
    response.id = id;
    res.json(response);
});

module.exports = router;
