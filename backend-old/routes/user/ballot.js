const express = require("express");
const router = express.Router();
const checkId = require("../checkId");

//Function to check if logged in
function checkIsLoggedIn(req, res, next) {
    if(!req.session.username || !req.session.userid) {
        res.status(401).send("Error: Not authorised").end();
    } else {
        next();
    }
}

router.route("/ballot/:id")
    .post(checkIsLoggedIn, (req, res) => {
        const names = req.body.names;
        const userId = req.session.userid;
        const userIdx = checkId(req.app.locals.idToVoterIndex, userId);
        const ballotId = req.params.id;
        const ballotIdx = checkId(req.app.locals.idToBallotIndex, ballotId);
        if(userIdx === -1 || ballotIdx === -1 || !Array.isArray(names)) {
            res.json({success: false});
            return;
        }
        
        //Error checking
        let ballot = req.app.locals.ballots[ballotIdx];
        let voter = req.app.locals.voters[userIdx];
        let valid = true;
        //Check if the voter in question is valid
        if(!voter.isValid) {
            valid = false;
        }
        //Check if names submitted belongs in vote
        for(let i = 0;i < names.length;i++) {
            if(!ballot.isNameInBallot(names[i]) && names[i] != "Abstain" && names[i] != "No Confidence") {
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
        if(ballot.userHasSubmitted(userId)) {
            valid = false;
        }
        if(!valid) {
            res.json({success: false});
            return;
        }

        //Submit the vote
        ballot.submitVote(userId, names);
        res.json({success: true});
    });

router.route("/ballot")
    .get(checkIsLoggedIn, (req, res) => {
        const userId = req.session.userid;
        const ballotIdx = req.app.locals.numBallots - 1;
        const ballots = req.app.locals.ballots;
        let output = {
            id: "",
            position: "",
            names: [],
            maxVotes: -1
        }
        //check if any active ballots happening
        if(ballotIdx === -1) { //0 - 1 = -1, since we minused 1 to current numBallot count to get the last index of the ballots array.
            res.json(output);
            return;
        }
        if(!ballots[ballotIdx].isValid || !ballots[ballotIdx].isOpen) {
            res.json(output);
            return;
        }
        // If user has submitted, they will not be able to view the ballot already
        if(ballots[ballotIdx].userHasSubmitted(userId)) {
            res.json(output);
            return;
        }
        output.id = ballots[ballotIdx].id;
        output.position = ballots[ballotIdx].position;
        output.names = ballots[ballotIdx].names;
        output.maxVotes = ballots[ballotIdx].maxVotes;
        res.json(output);
    });

module.exports = router;