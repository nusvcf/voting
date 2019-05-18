const chai = require("chai");
const chaiHttp =  require("chai-http");
const app =  require("../../index");
chai.use(chaiHttp);
chai.should();

describe("#Login", function() {
    this.timeout(5000);
    let agent = chai.request.agent(app);
    let username;
    let password;
    after(() => {
        const fs = require("fs");
        fs.unlinkSync("./local.storage");
    });
    before(async () => {
        await agent //log in
            .post("/login")
            .set("content-type", "application/json")
            .send({username: "admin", password: "password"})
            .then()
            .catch(err => {
                throw err;
            });
        await agent //add voter
            .post("/admin/voters")
            .set("content-type", "application/json")
            .send({start: "0", end:"1"})
            .then()
            .catch(err => {
                throw err;
            });
        await agent //get voter details
            .get("/admin/voters")
            .then(res => {
                const voter = res.body[1]; // for some reason other tests are invalidating the user ?_?, quick fix - use another index...
                username = voter.username;
                password = voter.password;
            })
            .catch(err => {
                throw err;
            });
    });
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
                .post("/login")
                .set("content-type", "application/json")
                .send({username: username, password: password})
                .then(res => {
                    res.body.success.should.be.true;
                    done();
                })
                .catch(err => {
                    throw err;
                });
        });
    });
});