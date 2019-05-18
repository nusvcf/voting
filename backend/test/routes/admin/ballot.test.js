const chai = require("chai");
const chaiHttp =  require("chai-http");
const app =  require("../../../index");
chai.use(chaiHttp);
chai.should();

const tests = async () => {
    let agent = chai.request.agent(app);
    let id;
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
        .get("/admin/voters")
        .then(res => {
            const voter = res.body[0];
            username = voter.username;
            password = voter.password;
        })
        .catch(err => {
            throw err;
        });
    let userAgent = chai.request.agent(app);
    await userAgent
        .post("/login")
        .send({username: username, password: password})
        .then()
        .catch(err => {
            throw err;
        });
    await describe("#Admin Ballots (assumes admin pw is \"password\")", () => {
        describe("POST (Creating a new ballot)", () => {
            it("Submit an invalid ballot (names not an array)", done => {
                const toSend = {
                    position: "Chairman",
                    names: "Tan Ah Ming",
                    maxVotes: 1
                };
                agent
                    .post("/admin/ballots")
                    .send(toSend)
                    .then(res => {
                        res.body.success.should.be.false;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("Submit an invalid ballot (negative maxVotes)", done => {
                const toSend = {
                    position: "Chairman",
                    names: ["Tan Ah Ming", "Ang Xiao Ming", "Terry Sim"],
                    maxVotes: -1
                };
                agent
                    .post("/admin/ballots")
                    .send(toSend)
                    .then(res => {
                        res.body.success.should.be.false;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("Submit an invalid ballot (maxVotes is a string)", done => {
                const toSend = {
                    position: "Chairman",
                    names: ["Tan Ah Ming", "Ang Xiao Ming", "Terry Sim"],
                    maxVotes: "hello"
                };
                agent
                    .post("/admin/ballots")
                    .send(toSend)
                    .then(res => {
                        res.body.success.should.be.false;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("Submit a valid ballot", done => {
                const toSend = {
                    position: "Chairman",
                    names: ["Tan Ah Ming", "Ang Xiao Ming", "Terry Sim"],
                    maxVotes: 1
                };
                agent
                    .post("/admin/ballots")
                    .send(toSend)
                    .then(res => {
                        res.body.success.should.be.true;
                        res.body.hasOwnProperty("id").should.be.true;
                        id = res.body.id;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
        });
        describe("GET (view all ballots)", () => {
            it("Should receive an array of ballots", done => {
                agent
                    .get("/admin/ballots")
                    .then(res => {
                        Array.isArray(res.body).should.be.true;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
        });
        describe("PUT :id (Invalidates a ballot)", () => {
            it("Should not invalidate a ballot with a wrong id", done => {
                agent
                    .put("/admin/ballots/thisIsDefinitelyNotAValidId")
                    .then(res => {
                        res.body.success.should.be.false;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("Should invalidate a ballot with a correct id", done => {
                agent
                    .put(`/admin/ballots/${id}`)
                    .then(res => {
                        res.body.success.should.be.true;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
        });
        describe("POST :id (closes a ballot)", () => {
            it("Should not close a ballot with a wrong id", done => {
                agent
                    .post("/admin/ballots/thisIsDefinitelyNotAValidId")
                    .then(res => {
                        res.body.success.should.be.false;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("Should close the ballot with a correct id", done => {
                agent
                    .post(`/admin/ballots/${id}`)
                    .then(res => {
                        res.body.success.should.be.true;
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            })        
        });
        describe("#Makes sure that users cannot access", () => {
            it("POST", done => {
                const toSend = {
                    position: "Chairman",
                    names: ["Tan Ah Ming", "Ang Xiao Ming", "Terry Sim"],
                    maxVotes: 1
                };
                userAgent
                    .post("/admin/ballots")
                    .send({toSend})
                    .then(res => {
                        res.status.should.be.equals(401);
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("GET", done => {
                userAgent
                    .get("/admin/ballots")
                    .then(res => {
                        res.status.should.be.equals(401);
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("PUT/:id", done => {
                userAgent
                    .put(`/admin/ballots/${id}`)
                    .then(res => {
                        res.status.should.be.equals(401);
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });                
            });
            it("POST/:id", done => {
                userAgent
                    .post(`/admin/ballots/${id}`)
                    .then(res => {
                        res.status.should.be.equals(401);
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });                
            });     
        });
        describe("#Make sure non-logged in users cannot access", () => {
            it("POST", done => {
                const toSend = {
                    position: "Chairman",
                    names: ["Tan Ah Ming", "Ang Xiao Ming", "Terry Sim"],
                    maxVotes: 1
                };
                chai.request(app)
                    .post("/admin/ballots")
                    .send({toSend})
                    .then(res => {
                        res.status.should.be.equals(401);
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("GET", done => {
                chai.request(app)
                    .get("/admin/ballots")
                    .then(res => {
                        res.status.should.be.equals(401);
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });
            });
            it("PUT/:id", done => {
                chai.request(app)
                    .put(`/admin/ballots/${id}`)
                    .then(res => {
                        res.status.should.be.equals(401);
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });                
            });
            it("POST/:id", done => {
                chai.request(app)
                    .post(`/admin/ballots/${id}`)
                    .then(res => {
                        res.status.should.be.equals(401);
                        done();
                    })
                    .catch(err => {
                        throw err;
                    });                
            });
        });
    });
};

tests();

