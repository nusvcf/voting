"use strict";
//imports
require("dotenv").config();
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const uuid = require("uuid/v4");
const bodyParser = require("body-parser");

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

//Function to check if logged in
function checkLoggedIn(req, res, next) {
    if(!req.session.user) {
        res.status(401).send("Error: Not authorised");
    }
    next();
}

//Log in authentication
app.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if(users.hasOwnProperty(username) && users[username] === password) {
        req.session.userID = username;
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



app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
