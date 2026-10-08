import express from "express";
import cors from "cors";
import router from "./routes/user.route.js";
import cookieParser from "cookie-parser";
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin: "*", credentials: true}));
app.use("/api/auth", router)
app.get("/", (req, res) => {
  res.send("server is running");
});
export default app;