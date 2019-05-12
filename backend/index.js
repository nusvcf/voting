"use strict";
//imports
require("dotenv").config();
const fs = require("fs");
const express = require("express");
const session = require("express-session");
const MemoryStore = require("memorystore")(session)
const uuid = require("uuid/v4");
const bodyParser = require("body-parser");

//Load users.json
const users = JSON.parse(fs.readFileSync("users.json"));
console.log(`Loaded ${Object.keys(users).length} users.`);

//Variables
const app = express();
app.locals.ballots = [];
app.locals.idToBallotIndex = {};
app.locals.numBallots = 0;

//Set up express
const port = 8080;
app.use(session({ //session cookie settings
    secret: process.env.secret,
    genid: () => {return uuid()},
    resave: false,
    saveUninitialized: true,
    store: new MemoryStore({
        checkPeriod: 600000
    }),
    cookie: {
        expires: 1800000 //30 minutes
    }
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//Log in route
app.use("/login", require("./routes/login")(users));
//Admin ballot route
app.use("/admin", require("./routes/admin/ballot"));
//User ballot route
app.use("/user", require("./routes/user/ballot"));

//route for unavailable routes
app.use(function (req, res, next) {
    res.status(404).send("404, content unavailable");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
