import app from "./src/app.js";
import dotenv from "dotenv";
import {connectDB} from "./src/config/db.js";
dotenv.config();
const PORT = process.env.PORT ;
connectDB().then(() => {
    app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})
}).catch((err) => {
    console.error("Error connecting to the database:", err.message);
    process.exit(1);
});
