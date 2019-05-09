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
passport.serializeUser((user, done) => {
    done(null, user.username);
})

//set up express
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

//Log in authentication
app.post("/login", passport.authenticate("local_login"), (req, res) => {
    res.send("authenticated :)\n"); //sends if authenticated
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
