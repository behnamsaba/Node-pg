process.env.NODE_ENV = "test";
const db = require('../db');
const app = require("../app");
const request = require('supertest');

let invoiceTest;
let testCompany;

beforeEach(async function() {
    let resultCompany = db.query(`INSERT INTO companies (code, name, description) VALUES ('apple', 'apple','smth')
    RETURNING *`);
    let resultInvoice = db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('apple', '100')
    RETURNING *`)
    let result = await Promise.all([resultCompany,resultInvoice])
    testCompany = result[0].rows[0]
    invoiceTest= result[1].rows[0];
});


//get all
describe("GET /invoices", function() {
    test("Get all invoices", async function() {
      const response = await request(app).get(`/invoices`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        invoices: [       {
            id: invoiceTest.id,
            comp_code: invoiceTest.comp_code,
            amt: invoiceTest.amt,
            paid: false,
            add_date: expect.any(String),
            paid_date: null
          }]
      });
    });
});

/** GET /invoices/[code] - return data about one invoice*/

describe("GET /invoices/:id", function() {
    test("Gets a single invoice", async function() {
      const response = await request(app).get(`/invoices/${invoiceTest.id}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ invoice : {
        id: expect.any(Number),
        comp_code: invoiceTest.comp_code,
        amt: invoiceTest.amt,
        paid: false,
        add_date: expect.any(String),
        paid_date: null
      } });
    });
});
// end


describe("POST /invoices", function() {
  test("add new invoice", async function() {
    const response = await request(app)
      .post(`/invoices`)
      .send({"comp_code":"apple", "amt":200});
    expect(response.statusCode).toEqual(201);
    expect(response.body).toEqual({"invoice" : {
		"id": expect.any(Number),
		"comp_code": "apple",
		"amt": 200,
		"paid": false,
		"add_date": expect.any(String),
		"paid_date": null
	}});
  });
});
// end













afterEach(async function() {
  // delete any data created by test
  await Promise.all([db.query("DELETE FROM companies"),db.query("DELETE FROM invoices")]);
});

afterAll(async () => {
  //close db connection
  await db.end();
})