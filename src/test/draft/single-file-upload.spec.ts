import fs from "fs";
import expect from "expect";
import supertest from "supertest";

import createServer from "@/server";
import path from "path";
import { getUploadPath } from "@/infrastructure/multer/upload";

const app = createServer();

const clearUploadsDirectory = () => {
  const uploadsPath = getUploadPath();
  console.log(`Deleting files uploaded to: ${uploadsPath}`);

  if (fs.existsSync(uploadsPath)) {
    fs.readdirSync(uploadsPath).forEach((file) => {
      fs.unlinkSync(`${uploadsPath}/${file}`);
    });
    console.log("All files in the uploads directory have been deleted.");
  } else {
    console.log("No files found in the uploads directory to delete.");
  }
};
describe("Single file upload", () => {
  after(clearUploadsDirectory);
  context("Success for valid image files", async () => {
    it("should handle single valid file upload", async () => {
      const file = path.resolve(__dirname, "./img00.jpeg");
      const response = await supertest(app)
        .post("/upload-single")
        .attach("avatar", file);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: expect.any(String),
        path: expect.any(String),
      });
    });
  });
  context("fail cases", () => {
    it("should fail for large image files", async () => {
      const file = path.resolve(__dirname, "./large.jpeg");
      const response = await supertest(app)
        .post("/upload-single")
        .attach("avatar", file);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: {
          // code: "LIMIT_FILE_SIZE",
          // field: "avatar",
          message: "File too large",
          // name: "MulterError",
          // storageErrors: expect.any(Array),
        },
      });
    });
    it("should fail for non image files", async () => {
      const file = path.resolve(__dirname, "./text.txt");
      const response = await supertest(app)
        .post("/upload-single")
        .attach("avatar", file);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Expecting a jpeg, jpg, png or gif image",
      });
    });
  });
});
