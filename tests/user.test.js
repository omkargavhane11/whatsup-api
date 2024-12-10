const request = require('supertest'); // Import Supertest
const axios = require("axios");
// const {app} = require("../index");

let SERVER_API = "http://localhost:8080";

describe("GET /server health check",  () => {
    test("should return a 200 status code and the correct message", async () => {
        const response = await axios.get(`${SERVER_API}`);
        console.log("response :: ", response)
        expect(response.status).toBe(200);

        expect(response.data.message).toBe("Whatsup server API");
    })
})