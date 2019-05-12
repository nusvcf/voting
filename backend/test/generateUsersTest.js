var expect = require("chai").expect;
var test = require("../generateUsers");

describe("#generateUsers", function() {
    it("checkArgv() should reject lengths not equals 3", function() {
        let input = [0, 0];
        let output = test.checkArgv(input);
        expect(output).to.be.equals(-1);
    });
    it("checkArgv() should reject strings", function() {
        let input = [0, 0, 'teahaha'];
        let output = test.checkArgv(input);
        expect(output).to.be.equals(-1);
    });
    it("checkArgv() should accept positive integers", function() {
        let input = [0, 0, '95'];
        let output = test.checkArgv(input);
        expect(output).to.be.equals(95);
    });
    it("checkArgv() should reject negative integers", function() {
        let input = [0, 0, '-95'];
        let output = test.checkArgv(input);
        expect(output).to.be.equals(-1);
    });
    it("checkArgv() should reject 0", function() {
        let input = [0, 0, '0'];
        let output = test.checkArgv(input);
        expect(output).to.be.equals(-1);
    });
    it("generateOutput() with an input of 5 should create an object with 6 keys (inclusive of admin)", function() {
        let output = test.generateOutput(5);
        expect(Object.keys(output).length).to.be.equals(6);
    });
    it("generateOutput() with an input of 5 should have keys generated in incremental order", function() {
        let output = test.generateOutput(5);
        for(let i=0;i<5;i++) {
            let key = test.getPaddedString(i, 4);
            expect(output.hasOwnProperty(key)).to.be.true;
        }
    });
    it("generateOutput() should generate passwords of length 8 to 10 chars", function() {
        let output = test.generateOutput(1);
        let key = "0000";
        expect(output[key].password.length).to.be.below(11).and.above(7);
        expect(output[key].id.length).to.be.below(11).and.above(7);
    });
    it("generateStr() should generate a random string between 8 to 10 chars", function() {
        let str = test.generateStr();
        expect(str).to.have.lengthOf.below(11).and.above(7);
    });
    it("getUniqueStr() should generate a string", function() {
        let usedStrings = {}
        let str = test.getUniqueString(usedStrings);
        expect(typeof(str)).to.be.equals("string");
    });
    it("getUniqueStr() should add the string to usedStrings object", function() {
        let usedStrings = {}
        let beforeCount = Object.keys(usedStrings).length;
        let str = test.getUniqueString(usedStrings);
        let afterCount = Object.keys(usedStrings).length;
        expect(beforeCount+1).to.be.equals(afterCount);
    });
    it("getUniqueStr() should pair the string with \"true\" in usedStrings object", function() {
        let usedStrings = {}
        let str = test.getUniqueString(usedStrings);
        expect(usedStrings[str]).to.be.true;
    });
    it("getPaddedString() should return 0000 with value 0 and width 4", function() {
        let str = test.getPaddedString(0, 4);
        expect(str).to.be.equals("0000");
    });
    it("getPaddedString() should return 150 with value 150 and width 1 ", function() {
        let str = test.getPaddedString(150, 1);
        expect(str).to.be.equals("150");
    });
    it("getPaddedString() should return 099 with value 99 and width 3", function() {
        let str = test.getPaddedString(0, 4);
        expect(str).to.be.equals("0000");
    });
});