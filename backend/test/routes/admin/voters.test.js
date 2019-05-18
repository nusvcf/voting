const chai = require("chai");
const expect = require("chai").expect;
const chaiHttp =  require("chai-http");
const app =  require("../../../index");
const Voter = require("../../../classes/Voter");
let { getPaddedString, generateStr, getUniqueString } = require("../../../routes/admin/voters");
chai.use(chaiHttp);
chai.should();

describe("#Admin Voters (assumes admin pw is \"password\")", function() {
    this.timeout(5000);
    let id;
    let agent = chai.request.agent(app);
    let userAgent = chai.request.agent(app);
    let usedStrings = {};
    after(() => {
        const fs = require("fs");
        fs.unlinkSync("./local.storage");
    });
    before(async () => {
        await agent
            .post("/login")
            .set("content-type", "application/json")
            .send({username: "admin", password: "password"})
            .then()
            .catch(err => {
                throw err;
            });

        // log in to a normal voter
        let username, password;
        await agent
            .post("/admin/voters")
            .set("content-type", "application/json")
            .send({start: "0", end:"0"})
            .then()
            .catch(err => {
                throw err;
            });
        await agent
            .get("/admin/voters")
            .then(res => {
                const voter = res.body[0];
                username = voter.username;
                password = voter.password;
                id = voter.id;
            })
            .catch(err => {
                throw err;
            });
        await userAgent
            .post("/login")
            .send({username: username, password: password})
            .then()
            .catch(err => {
                throw err;
            });
    });
    
    describe("Functions test", () => {
        beforeEach(() => {
            usedStrings = {};
        });
        it("generateStr() should generate a random string between 8 to 10 chars", () => {
            let str = generateStr();
            expect(str).to.have.lengthOf.below(11).and.above(7);
        });
        it("getUniqueStr() should generate a string", () => {
            let str = getUniqueString(usedStrings);
            expect(typeof(str)).to.be.equals("string");
        });
        it("getUniqueStr() should add the string to usedStrings object", () => {
            let beforeCount = Object.keys(usedStrings).length;
            let str = getUniqueString(usedStrings);
            let afterCount = Object.keys(usedStrings).length;
            expect(beforeCount+1).to.be.equals(afterCount);
        });
        it("getUniqueStr() should pair the string with \"true\" in usedStrings object", () => {
            let str = getUniqueString(usedStrings);
            expect(usedStrings[str]).to.be.true;
        });
        it("getPaddedString() should return 0000 with value 0 and width 4", () => {
            let str = getPaddedString(0, 4);
            expect(str).to.be.equals("0000");
        });
        it("getPaddedString() should return 150 with value 150 and width 1 ", () => {
            let str = getPaddedString(150, 1);
            expect(str).to.be.equals("150");
        });
        it("getPaddedString() should return 099 with value 99 and width 3", () => {
            let str = getPaddedString(0, 4);
            expect(str).to.be.equals("0000");
        });
    });
    describe("GET (view all voters)", () => {
        it("Should return an array of voters", done => {
            agent
                .get("/admin/voters")
                .then(res => {
                    Array.isArray(res.body).should.be.true;
                    done();
                })
                .catch(err => {
                    throw err;
                });
        });
    });
    describe("POST (generate voters)", () => {
        it("Submit negative start idx", done => {
            agent
                .post("/admin/voters")
                .send({start: -1, end: 1})
                .then(res => {
                    res.body.success.should.be.false;
                    done();
                })
                .catch(err => {
                    throw err;
                });
        });
        it("Submit negative end idx", done => {
            agent
                .post("/admin/voters")
                .send({start: 1, end: -1})
                .then(res => {
                    res.body.success.should.be.false;
                    done();
                })
                .catch(err => {
                    throw err;
                });
        });
        it("Submit end idx larger than start idx", done => {
            agent
                .post("/admin/voters")
                .send({start: 1, end: 0})
                .then(res => {
                    res.body.success.should.be.false;
                    done();
                })
                .catch(err => {
                    throw err;
                });
        });
        it("Submit a valid request", done => {
            agent
                .post("/admin/voters")
                .send({start: 0, end: 0})
                .then(res => {
                    res.body.success.should.be.true;
                    //the voter should already have been created from prior tests.
                    res.body.errorCreating[0].should.be.equals("0000");
                    done();
                })
                .catch(err => {
                    throw err;
                });
        });
    });
    describe("PUT/:id (Invalidates voter)", () => {
        it("Should not invalidate voter with wrong id", done => {
            agent
                .put("/admin/voters/thisIdShouldNotExist")
                .then(res => {
                    res.body.success.should.be.false;
                    done();
                });
        });
        it("Should invalidate voter with correct id", done => {
            agent
                .put(`/admin/voters/${id}`)
                .then(res => {
                    res.body.success.should.be.true;
                    done();
                });
        });
    });
    describe("DELETE/:id (Deletes voter)", () => {
        it("Should not delete voter with wrong id", done => {
            agent
                .delete("/admin/voters/thisIdShouldNotExist")
                .then(res => {
                    res.body.success.should.be.false;
                    done();
                });                
        });
        it("Should delete voter with correct id", done => {
            agent
                .delete(`/admin/voters/${id}`)
                .then(res => {
                    res.body.success.should.be.true;
                    done();
                });
        });
    });
    describe("#Makes sure that users cannot access", () => {
        it("GET", () => {
            userAgent
                .get("/admin/voters")
                .then(res => {
                    res.status.should.be.equals(401);
                })
                .catch(err => {
                    throw err;
                });
        });
        it("POST", () => {
            userAgent
                .post("/admin/voters")
                .send({start: 0, end: 0})
                .then(res => {
                    res.status.should.be.equals(401);
                })
                .catch(err => {
                    throw err;
                });
        });
        it("PUT/:id", () => {
            userAgent
                .put(`/admin/voters/${id}`)
                .then(res => {
                    res.status.should.be.equals(401);
                })
                .catch(err => {
                    throw err;
                });
        });
        it("DELETE/:id", () => {
            userAgent
                .delete(`/admin/voters/${id}`)
                .then(res => {
                    res.status.should.be.equals(401);
                })
                .catch(err => {
                    throw err;
                });
        });
    });
    describe("#Makes sure that non-logged in users cannot access", () => {
        it("GET", () => {
            chai.request(app)
                .get("/admin/voters")
                .then(res => {
                    res.status.should.be.equals(401);
                })
                .catch(err => {
                    throw err;
                });
        });
        it("POST", () => {
            chai.request(app)
                .post("/admin/voters")
                .send({start: 0, end: 0})
                .then(res => {
                    res.status.should.be.equals(401);
                })
                .catch(err => {
                    throw err;
                });
        });
        it("PUT/:id", () => {
            chai.request(app)
                .put(`/admin/voters/${id}`)
                .then(res => {
                    res.status.should.be.equals(401);
                })
                .catch(err => {
                    throw err;
                });
        });
        it("DELETE/:id", () => {
            chai.request(app)
                .delete(`/admin/voters/${id}`)
                .then(res => {
                    res.status.should.be.equals(401);
                })
                .catch(err => {
                    throw err;
                });
        });
    });        
});