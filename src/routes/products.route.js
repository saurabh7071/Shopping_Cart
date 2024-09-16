import { Router } from "express"
import { 
        addProducts,
        getAllProducts,
        getProductById,
        updateProduct,
        updateImage,
        deleteProduct
    } from "../controller/products.controller.js"
import { upload } from "../middleware/multer.middleware.js"

const router = Router()

router.route("/addProduct").post(
    upload.fields([
        {
            name: "image",
            maxCount: 1
        }
    ]), addProducts)

router.route("/getAllProducts").get(getAllProducts)

router.route("/:productId").get(getProductById).delete(deleteProduct)

router.route("/updateProduct/:productId").patch(updateProduct)

router.route("/updateImage/:productId").patch(upload.single("image"), updateImage)

export default router