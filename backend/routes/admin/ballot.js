const express = require("express");
const router = express.Router();
const Ballot = require("../../classes/Ballot");
const uuid = require("uuid/v4");

//Function to check if admin
function checkIsAdmin(req, res, next) {
    if(!req.session.username || req.session.userType !== "admin") {
        res.status(401).send("Error: Not authorised").end();
    } else {
        next();
    }
}

//Function to check if id is valid & return index, if valid. if not return -1
function checkId(idToBallotIndex, id) {
    if(!idToBallotIndex.hasOwnProperty(id)) { //not a valid id
        return -1;
    }
    return idToBallotIndex[id];
}

router.route("/ballots/:id")
    .get(checkIsAdmin, (req, res) => { //View result
        const id = req.params.id;
        const idx = checkId(req.app.locals.idToBallotIndex, id);
        if(idx === -1) {
            res.json({success: false});
            return;
        }
        const ballot = req.app.locals.ballots[idx];
        res.json(ballot.namesInBallot);

    })
    .delete(checkIsAdmin, (req, res) => { //invalidate a ballot
        const id = req.params.id;
        const idx = checkId(req.app.locals.idToBallotIndex, id);
        if(idx === -1) {
            res.json({success: false});
            return;
        }
        req.app.locals.ballot[idx].isValid = false;
        res.json({success: true});
    })
    .post(checkIsAdmin, (req, res) => { //Closes ballot
        const id = req.params.id;
        const idx = checkId(req.app.locals.idToBallotIndex, id);
        if(idx === -1) {
            res.json({success: false});
            return;
        }
        req.app.locals.ballot[idx].isClosed = true;
        res.json({success: true});
    });

router.route("/ballots")
    .post(checkIsAdmin, (req, res) => { //Create new ballot
        let valid = true;
        const position = req.body.position;
        const names = req.body.names;
        const maxVotes = parseInt(req.body.maxVotes);
        //Error checking
        if(typeof(position) !== "string" || !Array.isArray(names) || isNaN(maxVotes) || maxVotes < 0) {
            valid = false;
        }
        if(!valid) {
            res.json({success: false});
            return;
        }

        //Create vote
        let id;
        do { //make sure no collisions
            id = uuid();
        } while(req.app.locals.ballots.hasOwnProperty(id));
        const ballot = new Ballot(id, position, names, maxVotes);
        req.app.locals.idToBallotIndex[id] = req.app.locals.numBallots++;
        req.app.locals.ballots.push(ballot);
        res.json({success: true, id: id});
    })
    .get(checkIsAdmin, (req, res) => { //Get ballot details
        res.json(req.app.locals.ballots);
    });

module.exports = router;