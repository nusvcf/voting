//Function to check if id is valid & return index, if valid. if not return -1
module.exports = function checkId(idToBallotIndex, id) {
    if(!idToBallotIndex.hasOwnProperty(id)) { //not a valid id
        return -1;
    }
    return idToBallotIndex[id];
}