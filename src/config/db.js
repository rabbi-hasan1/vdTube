import mongoose from "mongoose";
export const connectDB = async () => {
    try{
        const uri = process.env.MONGO_URI;
        if(!uri){
            throw new Error("MONGO_URI is not defined in the environment variables");
        }
        const conn =  await mongoose.connect(uri);
        console.log("Connected to MongoDB", conn.connection.host);
    }catch(err){
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1);
    }
}