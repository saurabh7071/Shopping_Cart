import mongoose from "mongoose"
import { DB_Name } from "../constants.js";

const connectDB = async () =>{
    try {
        const DBref = await  mongoose.connect(`${process.env.MONGODB_URI}/${DB_Name}`)
        console.log(`MONGODB CONNECTED !! DB HOST: ${DBref.connection.host}`);
        
    } catch (error) {
        console.log("MONGO_DB CONNECTION FAILED : ", error);
        process.exit(1);
    }
}

export default connectDB;
