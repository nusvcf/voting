const express = require("express");
const router = express.Router();
const checkId = require("../checkId");
const checkIsAdmin = require("./checkIsAdmin");
const Voter = require("../../classes/Voter");

function fn(users) {
    router.route("/voters/:id")
        .delete(checkIsAdmin, (req, res) => { //Invalidate user with given id
            const userId = req.params.id;
            const idx = checkId(req.locals.app.idToVoterIndex[userId]);
            let response = {success: false};

            //Fail to find id
            if(idx === -1) {
                res.json(response);
                return;
            }

            req.locals.app.voters[idx].isValid = false;
            response.success = true;
            res.json(response);
        })

    router.route("/voters")
        .get(checkIsAdmin, (req, res) => { //Get list of voters
            res.json(req.app.locals.voters);
        })
        .post(checkIsAdmin, (req, res) => { //Generate voters from 0000 to numVoters
            const numVoters = parseInt(req.body.numVoters);
            let response = {success: false};
            if(isNaN(numVoters) || numVoters < 0) {
                res.json(response);
                return;
            }

            //Generate voters
            const usernames = Object.keys(users);
            for(let i = 0;i < numVoters;i++) {
                const username = usernames[i];
                const id = users[username].id;
                const password = users[username].password
                const voter = new Voter(username, id, password)
                req.app.locals.voters.push(voter);
                req.app.locals.idToVoterIndex[id] = i+1;
                req.app.locals.usernameToVoterIndex[username] = i+1;
            }

            response.success = true;
            res.json(response);

        })
    return router;
}

module.exports = fn;