const express = require("express");
const router = express.Router();
const checkId = require("../checkId");
const checkIsAdmin = require("./checkIsAdmin");
const Voter = require("../../classes/Voter");

//Returns a padded string of zeros from an input value
//https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
function getPaddedString(val, width) {
    val = val + "";
    return val.length >= width ? val : new Array(width - val.length + 1).join('0') + val;
}

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
        .post(checkIsAdmin, (req, res) => { 
            const startIdx = parseInt(req.body.start);
            const endIdx = parseInt(req.body.end);
            const numberOfUsers = Object.keys(users).length;
            let response = {success: false};

            //Error checking
            if(isNaN(startIdx) || isNaN(endIdx)) {
                res.json(response);
                return;
            }
            if(startIdx < 0 || endIdx < 0 || startIdx > numberOfUsers || endIdx > numberOfUsers) {
                res.json(response);
                return;
            }

            //Generate voters
            let errorCreating = [];
            for(let i = startIdx;i <= endIdx;i++) {
                const username = getPaddedString(i, 4);

                //check for duplicate user
                if(req.app.locals.usernameToVoterIndex.hasOwnProperty(username)) {
                    errorCreating.push(username);
                    continue;
                }
                const id = users[username].id;
                const password = users[username].password;
                const voter = new Voter(username, id, password);
                req.app.locals.voters.push(voter);
                req.app.locals.idToVoterIndex[id] = req.app.locals.numVoters;
                req.app.locals.usernameToVoterIndex[username] = req.app.locals.numVoters;
                req.app.locals.numVoters++;
            }

            response.success = true;
            response.errorCreating = errorCreating;
            res.json(response);

        })
    return router;
}

module.exports = fn;