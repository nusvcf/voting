module.exports = class Vote {
    constructor(position, names, maxVotes) {
        this.position = position;
        this.names = names;
        this.maxVotes = maxVotes;
        this.isValid = true;
    }
};