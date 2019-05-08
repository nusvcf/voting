"use strict";
const fs = require("fs");

//Generates a string of length 10 randomly
function generateStr() {
    let output = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_?/\!@#$";
    let charLength = characters.length;
    let length = Math.floor(Math.random() * 3) + 8; //Get a value between 8 and 11 
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

function main() {
    //Error checking
    let PROGRAM_USAGE = "Usage of program: node generateUsers.js [number of users to generate]";
    if(process.argv.length != 3) {
        console.log(PROGRAM_USAGE);
        return;
    }
    let numPeople = parseInt(process.argv[2]);
    if(isNaN(numPeople)) {
        console.log(PROGRAM_USAGE);
        return; 
    }

    //Generate users and passwords
    let result = {};
    let usedStrings = {};
    for(let i = 0;i < numPeople; i++) {
        let randStringUser, randStringPass;
        randStringUser = getUniqueString(usedStrings);
        randStringPass = getUniqueString(usedStrings);
        result[randStringUser] = randStringPass;
    }
    
    //output as json file
    fs.writeFileSync("users.json", JSON.stringify(result), (err) => {
        if(err) console.log(err);
    });
    console.log(`Generated ${numPeople} unique usernames and passwords.`);
}

main();

