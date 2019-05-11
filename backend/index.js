"use strict";
//imports
require("dotenv").config();
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const uuid = require("uuid/v4");
const bodyParser = require("body-parser");
const Vote = require("./classes/Vote");

//Variables
let ballots = [];
let idToBallotIndex = {};
let numBallots = 0;

//Load users.json
const users = JSON.parse(fs.readFileSync("users.json"));
console.log(`Loaded ${Object.keys(users).length} users.`);

//Set up express
const app = express();
const port = 8080;
app.use(session({ //session cookie settings
    secret: process.env.secret,
    genid: () => {return uuid()},
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: 600000
    }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//Log in authentication
app.route("/login")
    .post((req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        if(users.hasOwnProperty(username) && users[username].password === password) {
            req.session.username = username;
            req.session.userID = users[username].id;
            if(username === "admin")
                req.session.userType = "admin";
            else
                req.session.userType = "user";
            const response = {
                success: true,
                userType: req.session.userType,
                userID: req.session.userID
            };
            res.json(response);
        } else {
            const response = {
                success: false
            };
            res.json(response);
        }
    });

app.route("/admin/ballots")
    .post(checkIsAdmin, (req, res) => {
        let valid = true;
        const position = req.body.position;
        const names = req.body.names;
        const maxVotes = parseInt(req.body.maxVotes);
        //Error checking
        if(typeof(position) !== "string" || !Array.isArray(names) || isNaN(maxVotes)) {
            valid = false;
        }
        if(!valid) {
            res.json({success: false});
            return;
        }
        let id;
        do { //make sure no collisions
            id = uuid();
        } while(ballots.hasOwnProperty(id));
        const vote = Vote(id, position, names, maxVotes);
        idToBallotIndex[id] = numBallots++;
        ballots.push(vote);
        res.json({success: true});
    })
    .get(checkIsAdmin, (req, res) => {

    });
    
app.route("/admin/ballots/:id")
    .post(checkIsAdmin, (req, res) => {
        const id = req.params.id;
    })
    .delete(checkIsAdmin, (req, res) => {
        const id = req.params.id;
    })
    .get(checkIsAdmin, (req, res) => {
        const id = req.params.id;
    });

app.route("user/ballot")
    .get(checkIsUser, (req, res) => {

    });

app.route("user/ballot/:id")
    .post(checkIsUser, (req, res) => {
        const id = req.params.id;
    });

//Function to check if admin
function checkIsAdmin(req, res, next) {
    if(!req.session.user || req.session.userType !== "admin") {
        res.status(401).send("Error: Not authorised");
    }
    next();
}

//Function to check if user
function checkIsUser(req, res, next) {
    if(!req.session.user || req.session.userType !== "user") {
        res.status(401).send("Error: Not authorised");
    }
    next();
}

//route for unavailable routes
app.use(function (req, res, next) {
    res.status(404).send("404, content unavailable");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
