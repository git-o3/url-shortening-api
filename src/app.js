import express from "express";
import urlRoutes from "./routes/urlRoutes.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { globalErrorHandler } from "./middleware/errorHandler.js";
import morganMiddleware from "./middleware/morganMiddleware.js";



const app = express();

app.use(express.json());

app.use(morganMiddleware)

app.get("/api/v1/health", (req, res) => res.status(200).send("OK"));
app.use("/api/v1/shorten", rateLimiter, urlRoutes);



app.use(globalErrorHandler);

export default app;