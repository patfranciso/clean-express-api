import expect from "expect";
import supertest from "supertest";

import createServer from "@/server";
const app = createServer();

describe("System", () => {
  it("should be fine", () => {
    expect(2 + 2).toEqual(4);
  });
  it("health check should pass", async () => {
    const result = await supertest(app).get("/health?greeting=Hello/");
    expect(result.status).toBe(200);
  });
});
