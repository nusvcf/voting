const express = require("express");
const router = express.Router();

module.exports = function(users) {
    //Log in authentication
    router.post("/", (req, res) => {
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
    return router;
};