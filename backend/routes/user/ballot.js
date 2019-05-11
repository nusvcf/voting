const express = require("express");
const router = express.Router();
const checkId = require("../checkId");

//Function to check if logged in
function checkIsLoggedIn(req, res, next) {
    if(!req.session.username || !req.session.userID) {
        res.status(401).send("Error: Not authorised").end();
    } else {
        next();
    }
}

router.route("/ballot/:id")
    .post(checkIsLoggedIn, (req, res) => {
        const names = req.body.names;
        const userID = req.session.userID;
        const id = req.params.id;
        const idx = checkId(req.app.locals.idToBallotIndex, id);
        if(idx === -1 || !Array.isArray(names)) {
            res.json({success: false});
            return;
        }
        
        //Error checking
        let ballot = req.app.locals.ballots[idx];
        let valid = true;
        //Check if names submitted belongs in vote
        for(let i = 0;i < names.length;i++) {
            if(!ballot.isNameInVote(names[i])) {
                valid = false;
            }
        }
        //Check if ballot is invalidated or closed
        if(!ballot.isOpen || !ballot.isValid) {
            valid = false;
        }
        //Check if user is submitting more names than allowed
        if(names.length > ballot.maxVotes) {
            valid = false;
        }
        //Check if user has submitted before
        if(ballot.userHasSubmitted(userID)) {
            valid = false;
        }
        if(!valid) {
            res.json({success: false});
            return;
        }

        //Submit the vote
        if(names.length === 0) {
            ballot.submittedUsers[userID] = {votedFor: [], abstained: true}
        } else {
            ballot.submittedUsers[userID] = {votedFor: names, abstained: false};
            for(let i = 0;i < names.length; i++) {
                const name = names[i];
                ballot.namesInBallot[name].count++;
                ballot.namesInBallot[name].voters.push(userID);
            }
        }
        req.app.locals.ballots[idx] = ballot;
        //console.log(req.app.locals.ballots[idx]);
        res.json({success: true});
    });

router.route("/ballot")
    .get(checkIsLoggedIn, (req, res) => {
        const idx = req.app.locals.numBallots - 1;
        const ballots = req.app.locals.ballots;
        let output = {
            id: "",
            position: "",
            names: [],
            maxVotes: -1
        }
        //check if any active ballots happening
        if(idx === 0) {
            res.json(output);
            return;
        }
        if(!ballots[idx].isValid || !ballots[idx].isOpen) {
            res.json(output);
            return;
        }
        output.id = ballots[idx].id;
        output.position = ballots[idx].position;
        output.names = ballots[idx].names;
        output.maxVotes = ballots[idx].maxVotes;
        res.json(output);
    });

module.exports = router;