import { Router } from "express"
import { products } from "../controller/products.controller.js"

const router = Router()

router.route("/products-details").post(products)


export default router