const express = require("express");
const router = express.Router();
const Ballot = require("../../classes/Ballot");
const uuid = require("uuid/v4");
const checkId = require("../checkId");
const checkIsAdmin = require("./checkIsAdmin");
const XlsxPopulate = require("xlsx-populate");

const local = require("../../localPersistance");

function write_excel_sheet(workbook, ballot, ballotsLength) {
    workbook.addSheet(ballot.position + ballotsLength);
    workbook
        .sheet(ballot.position + ballotsLength)
        .range("A1:C1")
        .value([["Voter Id", "Voted For", "Status"]]);
    var i = 2;
    Object.keys(ballot.submittedUsers).forEach(id => {
        workbook
            .sheet(ballot.position + ballotsLength)
            .range("A" + i + ":C" + i)
            .value([
                [
                    id,
                    ballot.submittedUsers[id].votedFor.join(", "),
                    ballot.submittedUsers[id].status
                ]
            ]);
        i++;
    });
}

router
    .route("/ballots/:id")
    .put(checkIsAdmin, (req, res) => {
        //invalidate a ballot
        const id = req.params.id;
        const idx = checkId(req.app.locals.idToBallotIndex, id);
        if (idx === -1) {
            res.json({ success: false });
            return;
        }
        req.app.locals.ballots[idx].isValid = false;
        local.save(req.app.locals);
        res.json({ success: true });
    })
    .post(checkIsAdmin, (req, res) => {
        //Closes ballot
        const id = req.params.id;
        const idx = checkId(req.app.locals.idToBallotIndex, id);
        if (idx === -1) {
            res.json({ success: false });
            return;
        }
        req.app.locals.ballots[idx].isOpen = false;
        local.save(req.app.locals);

        let ballotsLength = req.app.locals.ballots.length;
        let ballot = req.app.locals.ballots[idx];
        
        /*XlsxPopulate.fromFileAsync("./Votes.xlsx", {
            password: req.app.locals.adminPw
        }).then(workbook => {
            write_excel_sheet(workbook, ballot, ballotsLength);
            // Write to file.
            return workbook.toFileAsync("./Votes.xlsx", {
                password: req.app.locals.adminPw
            });
        });*/
        
        // Rewrite the entire excel file
        XlsxPopulate.fromBlankAsync().then(workbook => {
            for (let i = 0; i < req.app.locals.ballots.length; i++) {
                write_excel_sheet(workbook, req.app.locals.ballots[i], i)
            }
            
            // Write to file.
            return workbook.toFileAsync("./Votes.xlsx", {
                password: req.app.locals.adminPw
            });
        });
        
        res.json({ success: true });
    });

router
    .route("/ballots")
    .post(checkIsAdmin, (req, res) => {
        //Create new ballot
        let valid = true;
        const position = req.body.position;
        const names = req.body.names;
        const maxVotes = parseInt(req.body.maxVotes);
        //Error checking
        if (
            typeof position !== "string" ||
            !Array.isArray(names) ||
            isNaN(maxVotes) ||
            maxVotes < 0
        ) {
            valid = false;
        }
        if (!valid) {
            res.json({ success: false });
            return;
        }

        //Create vote
        let id;
        do {
            //make sure no collisions
            id = uuid();
        } while (req.app.locals.idToBallotIndex.hasOwnProperty(id));
        let numNonAbstainVoters = 0;
        for (let i = 0; i < req.app.locals.voters.length; i++) {
            if (req.app.locals.voters[i].isValid) {
                numNonAbstainVoters++;
            }
        }
        const ballot = new Ballot(
            id,
            position,
            names,
            maxVotes,
            numNonAbstainVoters
        );
        req.app.locals.idToBallotIndex[id] = req.app.locals.numBallots++;
        req.app.locals.ballots.push(ballot);
        local.save(req.app.locals);
        res.json({ success: true, id: id });
    })
    .get(checkIsAdmin, (req, res) => {
        //Get ballot details
        const ballots = req.app.locals.ballots;
        const numBallots = req.app.locals.numBallots;
        let output = [];
        for (let i = 0; i < numBallots; i++) {
            const ballot = ballots[i];

            //Generate percentage voted
            const numValidVoters = ballot.numValidVoters; //req.app.locals.numValidVoters;
            const numVotesInBallot = Object.keys(ballot.submittedUsers).length;
            let ballotPercentVotes = 0;
            let numNonAbstainVoters = 0;
            let numNoConfidence = 0;

            //calculate % non-abstain votes
            Object.keys(ballot.submittedUsers).forEach(key => {
                if (
                    ballot.submittedUsers[key].status === "Normal" ||
                    ballot.submittedUsers[key].status === "No Confidence"
                ) {
                    numNonAbstainVoters++;
                    if (ballot.submittedUsers[key].status == "No Confidence") {
                        numNoConfidence++;
                    }
                }
            });

            // if (ballot.isOpen) {
            //calculate percentage of people who have voted out of all the voters
            if (numValidVoters !== 0)
                ballotPercentVotes = (numVotesInBallot / numValidVoters) * 100;
            // } else {
            //     if (numValidVoters !== 0) {
            //         ballotPercentVotes =
            //             (numNonAbstainVoters / numValidVoters) * 100;
            //     }
            // }

            //Generate name array with percentage vote for each candidate
            let outputNameArray = [];
            const length = ballot.names.length;
            for (let i = 0; i < length; i++) {
                const name = ballot.names[i];
                const count = ballot.namesInBallot[name].count;
                let namePercentageVotes = 0;
                if (numVotesInBallot !== 0)
                    namePercentageVotes = (count / numVotesInBallot) * 100;
                outputNameArray.push({
                    name: name,
                    percentageVotes: namePercentageVotes
                });
            }

            //Generate each ballot object
            let outputBallotObj = {
                id: ballot.id,
                position: ballot.position,
                names: outputNameArray,
                maxVotes: ballot.maxVotes,
                isOpen: ballot.isOpen,
                isValid: ballot.isValid,
                percentageVotes: ballotPercentVotes,
                submittedUsers: ballot.submittedUsers,
                namesInBallot: ballot.namesInBallot,
                numNoConfidence: numNoConfidence,
                numVotesInBallot: numVotesInBallot,
                numValidVoters: numValidVoters,
                numNonAbstainVoters: numNonAbstainVoters
            };
            output.push(outputBallotObj);
        }
        
        res.json(output);
    });

module.exports = router;
