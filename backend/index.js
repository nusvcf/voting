"use strict";
//imports
require("dotenv").config();
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const uuid = require("uuid/v4");
const bodyParser = require("body-parser");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//Load users.json
const users = JSON.parse(fs.readFileSync("users.json"));
console.log(`Loaded ${Object.keys(users).length} users.`);

//Set up passport
//Checks if username exists within users object and then checks if password corresponds.
passport.use("local_login", new LocalStrategy(
    (username, password, done) => {
        if(users.hasOwnProperty(username) === true && password === users[username]) {
            const user = {
                username: username,
                password: password
            };
            return done(null, user);
        } else {
            return done(null, false);
        }
    }
));

//How serialisation and deserialisation works
//https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize?answertab=votes#tab-top
passport.serializeUser((user, done) => {
    done(null, user.username);
});
passport.deserializeUser(function(username, done) {
    let user = {
        username: username,
        password: users[username]
    };
    done(null, user);
});

//Function to check if logged in
function isLoggedIn(req, res, next) {
    if(req.user) {
        next();
    } else {
        res.status(401).json({error: "Not authorised"});
    }
}

//Function to use application/json headers
function sendJson(req, res, next) {
    res.setHeader("Content-Type", "application/json");
    next();
}

//Set up express
const app = express();
const port = 8080;
app.use(session({
    secret: process.env.secret,
    genid: () => {return uuid()},
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(sendJson);

//Log in authentication
app.post("/login", (req, res, next) => {
    console.log(req.body);
    passport.authenticate("local_login", (err, user, info) => {
        if(info)
            return res.json({success: false, message: info.message});
        if(err) 
            return next(err)
        if(!user) 
            return res.json({success: false});

        //Log user in if no errors
        req.login(user, (err) => {
            if(err) 
                return next(err);
            return res.json({success: true});
        });
    })(req, res, next);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
