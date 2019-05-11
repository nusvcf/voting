class Ballot {
    constructor(id, position, names, maxVotes) {
        this.id = id;
        this.position = position;
        this.names = names;
        this.namesInBallot = this.generateNamesInBallot(names);
        this.maxVotes = maxVotes;
        this.isValid = true;
        this.isOpen = true;
        this.submittedUsers = {};
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
    isNameInVote(name) {
        return this.namesInBallot.hasOwnProperty(name);
    }

    //Checks if a user has submitted once already
    userHasSubmitted(id) {
        return this.submittedUsers.hasOwnProperty(id);
    }
}

module.exports = Ballot;