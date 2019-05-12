/** This class stores ballot information */

class Ballot {
    /**
     * @param  {string} id Ballot id
     * @param  {string} position Leadership position this ballot is for
     * @param  {[string]} names Array of names of people running for this position
     * @param  {integer} maxVotes Max number of votes per voter for this ballot
     */
    constructor(id, position, names, maxVotes) {
        /** Ballot id */
        this.id = id;
        /** Position this ballot is for */
        this.position = position;
        /** Array of names of people running for this position*/
        this.names = names;
        /** max number of votes */
        this.maxVotes = maxVotes; 
        /** Boolean if ballot is valid */
        this.isValid = true; 
        /** Boolean if ballot is open */
        this.isOpen = true;
        /**Stores users that have voted in this ballot, and who they have voted for. {id: {votedFor: [], abstained: bool}}  */
        this.submittedUsers = {};
        /** Stores vote information for each person running. {name: {count: integer, voters: [string]}} */
        this.namesInBallot = this.generateNamesInBallot(names);
    }

    //Generates an object that stores the count, and the ids of who voted
    generateNamesInBallot(names) {
        let output = {};
        for(let i = 0;i < names.length;i++) {
            output[names[i]] = {count: 0, voters: []};
        }
        return output;
    }

    //Checks if the name specified is indeed in this vote
    isNameInBallot(name) {
        return this.namesInBallot.hasOwnProperty(name);
    }

    //Checks if a user has submitted once already
    userHasSubmitted(id) {
        return this.submittedUsers.hasOwnProperty(id);
    }
}

module.exports = Ballot;