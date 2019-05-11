module.exports = class Vote {
    constructor(id, position, names, maxVotes) {
        this.id = id;
        this.position = position;
        this.names = names;
        this.maxVotes = maxVotes;
        this.voters = [];
        this.isValid = true;
        this.isClosed = false;
    }
};