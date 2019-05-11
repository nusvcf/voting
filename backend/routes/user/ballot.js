const express = require("express");
const router = express.Router();

//Function to check if logged in
function checkIsLoggedIn(req, res, next) {
    if(!req.session.username) {
        res.status(401).send("Error: Not authorised").end();
    } else {
        next();
    }
}

router.route("/user/ballot/:id")
    .post(checkIsLoggedIn, (req, res) => {
        const id = req.params.id;
    });

router.route("/user/ballot")
    .get(checkIsLoggedIn, (req, res) => {

    });

module.exports = router;