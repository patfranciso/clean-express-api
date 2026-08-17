import express, { Request, Response, NextFunction } from "express";
import { v4 } from "uuid";
import cors from "cors";
import cookieParser from "cookie-parser";

import routes from "./routes";
import bodyParser from "body-parser";
import { logger } from "./utils/logger";

function createServer() {
  const app = express();
  app.use(
    cors({
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "DELETE", "PUT"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Cache-Control",
        "Expires",
        "Pragma",
      ],
      credentials: true,
    })
  );
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));
  // parse application/json
  app.use(bodyParser.json());

  app.use(cookieParser());
  app.use(routes);

  app.use(
    (err: Error, req: Request, res: Response, next: NextFunction): void => {
      const uid = v4();
      const message = err.message;
      console.error({ id: uid, message, stack: err.stack });
      logger.error(
        JSON.stringify({ type: "Error log", id: uid, message, error: err })
      );
      res.status(500).json({ message: "Unexpected error", code: uid });
    }
  );

  // app capture all other routes and return 404
  app.all("*", (req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  return app;
}

export default createServer;
