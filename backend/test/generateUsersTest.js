var expect = require("chai").expect;
var test = require("../generateUsers");

describe("#generateUsers", function() {
    it("generateStr() should generate a random string between 8 to 10 chars", function() {
        let str = test.generateStr();
        expect(str).to.have.lengthOf.below(11).and.above(7);
    });
    it("getUniqueStr() should generate a string", function() {
        let usedStrings = {}
        let beforeCount = Object.keys(usedStrings).length;
        let str = test.getUniqueString(usedStrings);
        let afterCount = Object.keys(usedStrings).length;
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
        let beforeCount = Object.keys(usedStrings).length;
        let str = test.getUniqueString(usedStrings);
        let afterCount = Object.keys(usedStrings).length;
        expect(usedStrings[str]).to.be.true;
    });
});