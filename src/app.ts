import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";
import { errorMiddleware } from "./middlewares";
import { setupSwagger } from "./swagger";
import { connectRedis } from "@/db/redis";

const app = express();

app.use(express.json());
app.use(cookieParser());
setupSwagger(app);

connectRedis();

app.use(
  cors({
    origin: ["http://localhost:8000", "http://localhost:51212"],
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Server is running!",
  });
});

app.use("/api", router);

app.use(errorMiddleware);

export default app;
