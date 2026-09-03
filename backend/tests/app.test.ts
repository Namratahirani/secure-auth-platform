import request from "supertest";
import app from "../src/app.js";

describe("API Health Check", () => {
  it("should return API running message", async () => {
    const response = await request(app)
      .get("/");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      message: "Secure Auth Platform API is running",
    });
  });
});