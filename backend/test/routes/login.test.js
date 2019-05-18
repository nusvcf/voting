const chai = require("chai");
const chaiHttp =  require("chai-http");
const app =  require("../../index");
chai.use(chaiHttp);
chai.should();

describe("#Login", () => {
    let agent = chai.request.agent(app);
    describe("POST", () => {
        it("Should reject an invalid username and password", done => {
            chai.request(app)
                .post("/login")
                .set("content-type", "application/json")
                .send({username: "qkqwdjkqw", password: "dwkkqwdjkl"})
                .end((err, res) => {
                    res.body.success.should.be.false;
                    res.body.hasOwnProperty("userType").should.be.false;
                    done();
                });
        });
        it("Should accept a valid log in (assumes admin's pw to be \"password\")", done => {
            agent
                .post("/login")
                .set("content-type", "application/json")
                .send({username: "admin", password: "password"})
                .then(res => {
                    res.body.success.should.be.true;
                    res.body.userType.should.be.equals("admin");
                    done();
                })
                .catch(err => {
                    throw err;
                });
        }).timeout(5000);
        it("Should log in a valid user", done => {
            agent
                .post("/admin/voters")
                .set("content-type", "application/json")
                .send({start: "0", end:"0"})
                .then(res => {
                        agent
                            .get("/admin/voters")
                            .then(res => {
                                const voter = res.body[0];
                                const { username, password } = voter;
                                agent
                                    .post("/login")
                                    .set("content-type", "application/json")
                                    .send({username: username, password: password})
                                    .then(res => {
                                        res.body.success.should.be.true;
                                        agent.close();
                                        done();
                                    })
                                    .catch(err => {
                                        throw err;
                                    });
                            })
                            .catch(err => {
                                throw err;
                            });
                    })
                    .catch(err => {
                        throw err;
                    });
        });
    });
});