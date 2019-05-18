const chai = require("chai");
const chaiHttp =  require("chai-http");
const app =  require("../../../index");
chai.use(chaiHttp);
chai.should();

describe("#User Voters (assumes admin pw is \"password\")", function() {
    this.timeout(5000);
    let agent = chai.request.agent(app);
    let userAgent = chai.request.agent(app);
    let userId;
    after(async () => {
        const fs = require("fs");
        fs.unlinkSync("./local.storage");
        //fs.unlinkSync("./Votes.xlsx");
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
            .send({start: "0", end:"1"})
            .then()
            .catch(err => {
                throw err;
            });
        await agent
            .get("/admin/voters")
            .then(res => {
                const voter = res.body[1];
                username = voter.username;
                password = voter.password;
                userId = voter.id;
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
        describe("GET", () => {
            let ballotId;
            it("Should return proper details if there is a ballot ongoing", async () => {
                // add a ballot
                const toSend = {
                    position: "Secretary",
                    names: ["Tan Ah Ming", "Ang Xiao Ming", "Terry Sim"],
                    maxVotes: 1
                };
                await agent
                    .post("/admin/ballots")
                    .send(toSend)
                    .then(res => {ballotId = res.body.id})
                    .catch(err => {
                        throw err;
                    });
                userAgent
                    .get("/user/ballot")
                    .then(res => {
                        res.body.id.should.equals(ballotId);
                        res.body.position.should.equals(toSend.position);
                        res.body.maxVotes.should.equals(toSend.maxVotes);
                    });
            });
            it("Should return nulls if there is no ballot ongoing", async () => {
                // close ballot
                await agent
                    .post(`/admin/ballots/${ballotId}`)
                    .then()
                    .catch(err => {
                        throw err;
                    });
                userAgent
                    .get("/user/ballot")
                    .then(res => {
                        res.body.id.should.equals("");
                        res.body.position.should.equals("");
                        res.body.names.length.should.equals(0);
                        res.body.maxVotes.should.equals(-1);
                    });
            }); 
        });
        describe("POST/:id", () => {
            let ballotId;
            before(async () => {
                // add a ballot
                const toSend = {
                    position: "Vice Chairman",
                    names: ["Tan Ah Ming", "Ang Xiao Ming", "Terry Sim"],
                    maxVotes: 1
                };
                await agent
                    .post("/admin/ballots")
                    .send(toSend)
                    .then(res => {ballotId = res.body.id})
                    .catch(err => {
                        throw err;
                    });                
            });
            it("Should not accept a vote to an invalid id ballot", done => {
                userAgent
                    .post("/user/ballot/thisIdWillNeverExist")
                    .send({names: ["Tan Ah Ming"]})
                    .then(res => {
                        res.body.success.should.be.false;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("Should not accept a vote if the data sent is invalid (names not in an array)", done => {
                userAgent
                    .post(`/user/ballot/${ballotId}`)
                    .send({names: "Tan Ah Ming"})
                    .then(res => {
                        res.body.success.should.be.false;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("Should not accept a vote if the data sent is invalid (more names than allowed)", done => {
                userAgent
                    .post(`/user/ballot/${ballotId}`)
                    .send({names: ["Tan Ah Ming", "Ang Xiao Ming"]})
                    .then(res => {
                        res.body.success.should.be.false;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("Should not accept a vote if the data sent is invalid (wrong names given)", done => {
                userAgent
                    .post(`/user/ballot/${ballotId}`)
                    .send({names: ["ThisNameDefinitelyDoesNotExist"]})
                    .then(res => {
                        res.body.success.should.be.false;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("Should accept a valid vote", done => {
                userAgent
                    .post(`/user/ballot/${ballotId}`)
                    .send({names: ["Tan Ah Ming"]})
                    .then(res => {
                        res.body.success.should.be.true;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("Should not accept a 2nd vote", done => {
                userAgent
                    .post(`/user/ballot/${ballotId}`)
                    .send({names: ["Tan Ah Ming"]})
                    .then(res => {
                        res.body.success.should.be.false;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("Should not be able to submit if ballot is closed", async () => {
                // close ballot
                await agent
                    .post(`/admin/ballots/${ballotId}`)
                    .then()
                    .catch(err => {
                        throw err;
                    });
                userAgent
                    .post(`/user/ballot/${ballotId}`)
                    .send({names: ["Tan Ah Ming"]})
                    .then(res => {
                        res.body.success.should.be.false;
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("Should not be able to submit if ballot is invalidated", async () => {
                // open new ballot
                const toSend = {
                    position: "Chairman",
                    names: ["Tan Ah Ming", "Ang Xiao Ming", "Terry Sim"],
                    maxVotes: 1
                };
                await agent
                    .post("/admin/ballots")
                    .send(toSend)
                    .then(res => {ballotId = res.body.id})
                    .catch(err => {
                        throw err;
                    });

                // invalidate ballot
                await agent
                    .put(`/admin/ballots/${ballotId}`)
                    .then()
                    .catch(err => {
                        throw err;
                    });
                userAgent
                    .post(`/user/ballot/${ballotId}`)
                    .send({names: ["Tan Ah Ming"]})
                    .then(res => {
                        res.body.success.should.be.false;
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("Should not be able to submit if user is invalidated", async () => {
                // open new ballot
                const toSend = {
                    position: "Treasurer",
                    names: ["Tan Ah Ming", "Ang Xiao Ming", "Terry Sim"],
                    maxVotes: 1
                };
                await agent
                    .post("/admin/ballots")
                    .send(toSend)
                    .then(res => {ballotId = res.body.id})
                    .catch(err => {
                        throw err;
                    });
                
                // invalidate user
                await agent
                    .put(`/admin/voters/${userId}`)
                    .then()
                    .catch(err => {
                        throw err;
                    });
                userAgent
                    .post(`/user/ballot/${ballotId}`)
                    .send({names: ["Tan Ah Ming"]})
                    .then(res => {
                        res.body.success.should.be.false;
                    })
                    .catch(err => {
                        throw err;
                    });
            });
        })
    });