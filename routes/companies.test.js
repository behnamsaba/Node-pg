// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function() {
    let result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('codeTest', 'nameTest','descriptionTest')
      RETURNING *`);
    testCompany = result.rows[0];
});



/** GET /companies - returns `{companies: [{code, name}, ...]}` */

describe("GET /companies", function() {
    test("Get all companies", async function() {
      const response = await request(app).get(`/companies`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        companies: [testCompany]
      });
    });
});

// end

/** GET /companies/[code] - return data about one company*/

describe("GET /companies/:code", function() {
  test("Gets a single company", async function() {
    const response = await request(app).get(`/companies/${testCompany.code}`);
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({ company : testCompany });
  });
});
// end

// post request test

describe("POST /companies", function() {
  test("add new company", async function() {
    const response = await request(app)
      .post(`/companies`)
      .send({code:"amazon", name:"amazon", description:"online sell"});
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual([{"code": "amazon", "description": "online sell", "name": "amazon"}]);
  });
});
// end


//patch test
describe("PATCH /companies/:code", function() {
  test("Updates a company data", async function() {
    const response = await request(app)
      .patch(`/companies/${testCompany.code}`)
      .send({
        name: "ibm"
      });
    expect(response.statusCode).toEqual(200);
    expect(response.body).toEqual({"code": "codeTest", "description": null, "name": "ibm"});
  });

  test("Responds with 404 if can't find company", async function() {
    const response = await request(app).patch(`/companies/0`);
    expect(response.statusCode).toEqual(404);
  });
});
// end





// //delete test

describe("DELETE /companies/:code", function() {
  test("Delete a single a company", async function() {
    const res = await request(app).delete(`/companies/${testCompany.code}`)
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: "company deleted" });
  });
});
// end


afterEach(async function() {
  // delete any data created by test
  await db.query("DELETE FROM companies");
});

afterAll(async () => {
  //close db connection
  await db.end();
})