//Function to check if id is valid & return index, if valid. if not return -1
module.exports = function checkId(idToSomethingIndex, id) {
    if(!idToSomethingIndex.hasOwnProperty(id)) { //not a valid id
        return -1;
    }
    return idToSomethingIndex[id];
}