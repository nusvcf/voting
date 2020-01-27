const express = require("express");
const router = express.Router();
const checkId = require("../checkId");
const checkIsAdmin = require("./checkIsAdmin");
const Voter = require("../../classes/Voter");
const uuid = require("uuid/v4");
var local = require('../../localPersistance');

let usedStrings = {};

//Returns a padded string of zeros from an input value
//https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
function getPaddedString(val, width) {
    val = val + "";
    return val.length >= width ? val : new Array(width - val.length + 1).join('0') + val;
}

//Generates a string of length 8-10 randomly
function generateStr() {
    let output = "";
    let characters = "ABDEFGHJMNPQRTXYabdefghjmnpqrtxy23456789_?!@#$";
    let charLength = characters.length;
    let length = Math.floor(Math.random() * 3) + 8; //Get a value between 8 and 10 
    for (let i = 0; i < length; i++) {
        output += characters.charAt(Math.floor(Math.random() * charLength));
    }
    return output;
}

//Makes sure the string generated has not been generated before
function getUniqueString(usedStrings) {
    let randString = "";
    do {
        randString = generateStr();
        usedStrings[randString] = true;
    } while (usedStrings[randString] != true);
    return randString;
}


function fn() {
    router.route("/voters/:id")
        .put(checkIsAdmin, (req, res) => { //Invalidate user with given id
            const userId = req.params.id;
            const idx = checkId(req.app.locals.idToVoterIndex, userId);
            let response = { success: false };

            //Fail to find id
            if (idx === -1) {
                res.json(response);
                return;
            }

            req.app.locals.voters[idx].isValid = false;
            response.success = true;
            local.save(req.app.locals);
            res.json(response);
        })
        .delete(checkIsAdmin, (req, res) => { //Deletes user with given id
            const userId = req.params.id;
            const idx = checkId(req.app.locals.idToVoterIndex, userId);
            let response = { success: false };

            //Fail to find id
            if (idx === -1) {
                res.json(response);
                return;
            }

            req.app.locals.voters[idx].isValid = false;
            response.success = true;
            local.save(req.app.locals);
            res.json(response);
        })

    router.route("/voters")
        .get(checkIsAdmin, (req, res) => { //Get list of voters
            res.json(req.app.locals.voters);
        })
        .post(checkIsAdmin, (req, res) => {
            const startIdx = parseInt(req.body.start);
            const endIdx = parseInt(req.body.end);
            let response = { success: false };

            //Error checking
            if (isNaN(startIdx) || isNaN(endIdx)) {
                res.json(response);
                return;
            }
            if (startIdx < 0 || endIdx < 0 || startIdx > endIdx) {
                res.json(response);
                return;
            }

            //Generate voters
            let errorCreating = [];
            for (let i = startIdx; i <= endIdx; i++) {
                const username = getPaddedString(i, 4);

                //check for duplicate user
                if (req.app.locals.usernameToVoterIndex.hasOwnProperty(username)) {
                    errorCreating.push(username);
                    continue;
                }
                // const id = users[username].id;
                // const id = getUniqueString(usedStrings);
                let id;
                do { //make sure no collisions
                    id = uuid();
                } while (usedStrings.hasOwnProperty(id));
                usedStrings[id] = true;
                // const password = users[username].password;
                const password = getUniqueString({});
                const voter = new Voter(username, id, password);
                req.app.locals.voters.push(voter);
                req.app.locals.idToVoterIndex[id] = req.app.locals.numVoters;
                req.app.locals.usernameToVoterIndex[username] = req.app.locals.numVoters;
                req.app.locals.numVoters++;
            }

            local.save(req.app.locals);

            response.success = true;
            response.errorCreating = errorCreating;
            res.json(response);

        })
    return router;
}

module.exports = fn;