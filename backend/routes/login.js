const express = require("express");
const router = express.Router();
const checkId = require("./checkId");

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

    //Check if username is valid
    const idx = checkId(usernameToVoterIndex, username);
    if(idx === -1) {
        res.json(response);
        return;
    }

    //Check if username and password tally
    if(password !== voters[idx].password) {
        res.json(response);
        return;
    }

    //Successful, set session states
    const id = voters[idx].id;
    req.session.username = username;
    req.session.id = id;
    if(username === ADMIN) {
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