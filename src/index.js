import dotenv from "dotenv"
import connectDB from "./DB/connection.js"
import { app } from "./app.js"

dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.on("error", (error)=>{
    console.log("Error : ", error);
    throw error
    })

    // Server creation
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MONGODB CONNECTION FAILED : ", err);
})