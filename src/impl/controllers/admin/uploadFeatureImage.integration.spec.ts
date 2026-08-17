import fs from "fs";
import expect from "expect";
import supertest from "supertest";

import createServer from "@/server";
import { getUploadPath } from "@/infrastructure/multer/upload";

const app = createServer();

const clearUploadsDirectory = () => {
  const uploadsPath = getUploadPath();
  console.log(`Uploaded files to: ${uploadsPath}`);

  if (fs.existsSync(uploadsPath)) {
    fs.readdirSync(uploadsPath).forEach((file) => {
      fs.unlinkSync(`${uploadsPath}/${file}`);
    });
    console.log("All files in the uploads directory have been deleted.");
  } else {
    console.log("No files found in the uploads directory to delete.");
  }
};
describe("Feature file upload", () => {
  after(clearUploadsDirectory);
  context("Success for valid image files", async () => {
    it("should handle single valid file upload", async () => {
      const file = process.cwd() + "/src/test/draft/img00.jpeg";

      const response = await supertest(app)
        .post("/api/admin/feature/upload-image")
        .attach("my_file", file);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Feature image uploaded successfully",
        path: expect.any(String),
      });
    });
  });
  context("fail cases", () => {
    it("should fail for large image files", async () => {
      const file = process.cwd() + "/src/test/draft/large.jpeg";
      const response = await supertest(app)
        .post("/api/admin/feature/upload-image")
        .attach("my_file", file);
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: {
          message: "File too large",
        },
      });
    });
    it("should fail for non image files", async () => {
      const file = process.cwd() + "/src/test/draft/text.txt";
      const response = await supertest(app)
        .post("/api/admin/feature/upload-image")
        .attach("my_file", file);
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Expecting a jpeg, jpg, png, webp or gif image",
      });
    });
  });
});
