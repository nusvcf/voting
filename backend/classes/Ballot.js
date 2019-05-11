class Ballot {
    constructor(id, position, names, maxVotes) {
        this.id = id;
        this.position = position;
        this.names = names;
        this.namesInBallot = this.generateNamesInBallot(names);
        this.maxVotes = maxVotes;
        this.isValid = true;
        this.isClosed = false;
    }

    //Generates an object that stores the count, and the ids of who voted
    generateNamesInBallot(names) {
        let output = {};
        const voter = {count: 0, voters: []};
        for(let i = 0;i < names.length;i++) {
            output[names[i]] = voter;
        }
        return output;
    }

    //Checks if the name specified is indeed in this vote
    isNameInVote(name) {
        return this.namesInBallot.hasOwnProperty(name);
    }

}

module.exports = Ballot;