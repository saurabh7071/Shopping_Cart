import { Router } from "express"
import {
    addItemToCart,
    removeItemFromCart,
    updateCartItemQuantity,
    getCartDetails,
    clearCart
} from "../controller/cart.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()
router.use(verifyJWT)

router.route("/add-item/:productId").post(addItemToCart)
router.route("/remove-item").delete(removeItemFromCart)
router.route("/update-quantity").post(updateCartItemQuantity)
router.route("/getAddToCartProducts").get(getCartDetails)
router.route("/clear-cart").delete(clearCart)

export default router