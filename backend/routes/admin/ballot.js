const express = require("express");
const router = express.Router();
const Ballot = require("../../classes/Ballot");
const uuid = require("uuid/v4");
const checkId = require("../checkId");
const checkIsAdmin = require("./checkIsAdmin");

router.route("/ballots/:id")
    .delete(checkIsAdmin, (req, res) => { //invalidate a ballot
        const id = req.params.id;
        const idx = checkId(req.app.locals.idToBallotIndex, id);
        if(idx === -1) {
            res.json({success: false});
            return;
        }
        req.app.locals.ballots[idx].isValid = false;
        res.json({success: true});
    })
    .post(checkIsAdmin, (req, res) => { //Closes ballot
        const id = req.params.id;
        const idx = checkId(req.app.locals.idToBallotIndex, id);
        if(idx === -1) {
            res.json({success: false});
            return;
        }
        req.app.locals.ballots[idx].isOpen = false;
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
        } while(req.app.locals.idToBallotIndex.hasOwnProperty(id));
        const ballot = new Ballot(id, position, names, maxVotes);
        req.app.locals.idToBallotIndex[id] = req.app.locals.numBallots++;
        req.app.locals.ballots.push(ballot);
        res.json({success: true, id: id});
    })
    .get(checkIsAdmin, (req, res) => { //Get ballot details
        const ballots = req.app.locals.ballots;
        const numBallots = req.app.locals.numBallots;
        let output = [];
        for(let i = 0;i < numBallots; i++) {
            const ballot = ballots[i];

            //Generate percentage voted
            const numVoters = req.app.locals.numVoters;
            const numVotesInBallot = Object.keys(ballot.submittedUsers).length;
            let ballotPercentVotes = 0;
            if(ballot.isOpen) { //calculate percentage of people who have voted out of all the voters
                if(numVoters !== 0)
                    ballotPercentVotes = (numVotesInBallot/numVoters) * 100;
            } else { //calculate % valid votes
                let numValidVotes = 0;
                Object.keys(ballot.submittedUsers).forEach((key) => {
                    if(ballot.submittedUsers[key].status === "Normal" || ballot.submittedUsers[key].status === "No Confidence") {
                        numValidVotes++;
                    }
                });
                if(numVoters !== 0) {
                    ballotPercentVotes = (numValidVotes/numVoters) * 100;
                }
            }

            //Generate name array with percentage vote for each candidate
            let outputNameArray = [];
            const length = ballot.names.length;
            for(let i = 0;i < length; i++) {
                const name = ballot.names[i];
                const count = ballot.namesInBallot[name].count;
                let namePercentageVotes = 0;
                if(numVotesInBallot !== 0)
                    namePercentageVotes= (count/numVotesInBallot) * 100;
                outputNameArray.push({name: name, percentageVotes: namePercentageVotes});
            }

            //Generate each ballot object
            let outputBallotObj = {
                id: ballot.id,
                position: ballot.position,
                names: outputNameArray,
                maxVotes: ballot.maxVotes,
                isOpen: ballot.isOpen,
                isValid: ballot.isValid,
                percentageVotes: ballotPercentVotes
            }
            output.push(outputBallotObj);
        }
        res.json(output);
    });

module.exports = router;