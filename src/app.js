import express from "express"
import cors from "cors"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// middlewares 
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true}));

// import routs
import products from "./routes/products.route.js"

// route declaration
app.use("/api/v1/products", products)


export {app}