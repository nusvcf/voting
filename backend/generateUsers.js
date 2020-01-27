"use strict";
const fs = require("fs");

//Generates a string of length 8-10 randomly
function generateStr() {
    let output = "";
    let characters = "ABDEFGHJMNPQRTXYabdefghjmnpqrtxy23456789_?/\!@#$";
    let charLength = characters.length;
    let length = Math.floor(Math.random() * 3) + 8; //Get a value between 8 and 10 
    for(let i = 0;i < length; i++) {
        output += characters.charAt(Math.floor(Math.random() * charLength));
    }
    return output;
}

//Makes sure the string generated has not been generated before
function getUniqueString(usedStrings) {
    let randString = "";
    do {
        randString = generateStr();
        usedStrings[randString] = true;
    } while (usedStrings[randString] != true);
    return randString;
}

//Returns a padded string of zeros from an input value
//https://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
function getPaddedString(val, width) {
    val = val + "";
    return val.length >= width ? val : new Array(width - val.length + 1).join('0') + val;
}

//Checks if argv is of length 3, and extracts numPeople
function checkArgv(argv) {
    if(argv.length != 3) {
        return -1;
    }
    let numPeople = parseInt(argv[2]);
    if(isNaN(numPeople) || numPeople < 1) {
        return -1; 
    }
    return numPeople;
}

//Generate output object
function generateOutput(numPeople) {
    let result = {};
    let usedStrings = {};
    for(let i = 0;i < numPeople; i++) {
        let stringUser, randStringPass, randUserId;
        stringUser = getPaddedString(i, 4); //4 here because we do not need > 9999 users.
        randUserId = getUniqueString(usedStrings);
        randStringPass = getUniqueString(usedStrings);
        result[stringUser] = {id: randUserId, password: randStringPass};
    }
    result["admin"] = {id: getUniqueString(usedStrings), password: getUniqueString(usedStrings)}
    return result;
}

function main() {
    //Check argv
    const PROGRAM_USAGE = "Usage of program: node generateUsers.js [number of users to generate]";
    const numPeople = checkArgv(process.argv);
    if(numPeople == -1) {
        console.log(PROGRAM_USAGE);
        return;
    }
    //Generate users and passwords
    const result = generateOutput(numPeople);

    //output as json file
    fs.writeFileSync("users.json", JSON.stringify(result), (err) => {
        if(err) console.log(err);
    });
    console.log(`Generated ${numPeople} unique usernames and passwords.`);
}

main();

exports.checkArgv = checkArgv;
exports.generateOutput = generateOutput;
exports.getUniqueString = getUniqueString;
exports.generateStr = generateStr;
exports.getPaddedString = getPaddedString;
