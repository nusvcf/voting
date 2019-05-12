/** This function checks if request is an admin */
function checkIsAdmin(req, res, next) {
    const ADMIN = "admin";
    if(!req.session.username || !req.session.id || req.session.userType !== ADMIN) {
        res.status(401).send("Error: Not authorised").end();
    } else {
        next();
    }
};

module.exports = checkIsAdmin;