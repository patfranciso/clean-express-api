import path from "path";
import expect from "expect";
import supertest from "supertest";

import createServer from "@/server";

const app = createServer();

describe("Multiple file upload", () => {
  it("should handle multiple file uploads", async () => {
    const files = [
      path.resolve(__dirname, "./img01.jpeg"),
      path.resolve(__dirname, "./img02.jpeg"),
    ];

    const response = await supertest(app)
      .post("/upload-multiple")
      .attach("avatars", files[0])
      .attach("avatars", files[1]);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Files uploaded successfully",
      paths: expect.any(String),
    });
  });
});
