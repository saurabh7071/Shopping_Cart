import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// middlewares 
app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

// import routs
import products from "./routes/products.route.js"
import users from "./routes/registerUsers.route.js"
import cart from "./routes/cart.route.js"

// route declaration
app.use("/api/v1/products", products)
app.use("/api/v1/users", users)
app.use("/api/v1/cart", cart)

export {app}