import chai from "chai";
import request from "supertest";

const expect = chai.expect;

let token;
let api;

const sampleActor = {
    id: 31,
    name: "Tom Hanks"
};

describe("People endpoints", () => {
    beforeEach(function (done) {
        this.timeout(6000)
        try {
            api = require("../../../../index");
        } catch (err) {
            console.error(`failed to Load user Data: ${err}`);
        }
        setTimeout(() => {
            request(api)
                .post("/api/users")
                .send({
                    "username": "user1",
                    "password": "test1"
                })
                .end((err, res) => {
                    token = res.body.token;
                    done();
                });
        }, 4000)
    });

    afterEach(() => {
        api.close(); // Release PORT 8080
        delete require.cache[require.resolve("../../../../index")];
    });

    describe("GET/people", () => {
        it("should return 20 people and a status 200", (done) => {
            request(api)
                .get("/api/people")
                .set("Accept", "application/json")
                .set("Authorization", token)
                .expect("Content-Type", /json/)
                .expect(200)
                .end((err, res) => {
                    expect(res.body).to.be.a("array");
                    expect(res.body.length).to.equal(20);
                    done();
                });
        });
    });

    describe("GET/people/:id", () => {
        describe("when the id is valid", () => {
            it("should return the matching person", () => {
                return request(api)
                    .get(`/api/people/${sampleActor.id}`)
                    .set("Accept", "application/json")
                    .set("Authorization", token)
                    .expect("Content-Type", /json/)
                    .expect(200)
                    .then((res) => {
                        expect(res.body).to.have.property("name", sampleActor.name);
                    });
            });
        });
        describe("when the id is invalid", () => {
            it("should return the NOT found message", () => {
                return request(api)
                    .get("/api/people/100")
                    .set("Accept", "application/json")
                    .set("Authorization", token)
                    .expect('')
            });
        });
    });

//     describe("GET/people/:id/credits", () => {
//         it("should return the combined credits list", (done) =>{
//             request(api)
//             .get(`/api/people/${sampleActor.id}/credits`)
//             .set("Accept", "application/json")
//             .set("Authorization", token)
//             .expect("Content-Type", /json/)
//             .expect(200)
//             .end((err,res) => {
//                 expect(res.body.cast).to.be.a("array");
//                 expect(res.body.cast.length).to.equal(180);
//                 done();
//             })
//         });

//         it("should return the 34 status with error message", (done) =>{
//             request(api)
//             .get(`/api/people/xxx/credits`)
//             .set("Accept", "application/json")
//             .set("Authorization", token)
//             .expect("Content-Type", /json/)
//             .expect(34)
//             .end((err,res) => {
//                 expect(res.body.success).to.equal(false);
//                 expect(res.body.status_message).to.equal("The resource you requested could not be found.");
//                 done();
//             })
//         });
//     });
});
