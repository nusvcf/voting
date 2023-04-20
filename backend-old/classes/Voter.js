/** This class stores voter information */

class Voter {
    /**
     * @param  {string} username
     * @param  {string} id
     * @param  {string} password
     */
    constructor(username, id, password) {
        /** Log in username of voter, string of numbers eg 0000, 0001*/
        this.username = username;
        /** Unique id assigned to voter*/
        this.id = id;
        /** Password assigned to voter */
        this.password = password;
        /** Denoting if voter is valid */
        this.isValid = true;
    }
}

module.exports = Voter;