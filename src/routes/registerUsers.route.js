import { Router } from "express"
import { 
    registerUser,
    verifyOTP,
    resendOTP,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    getCartDetails
} from "../controller/registerUsers.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js"

const router = Router()

router.route("/registerUser").post(registerUser)
router.route("/verify-otp").post(verifyOTP)
router.route("/resend-otp").post(resendOTP)
router.route("/loginUser").post(loginUser)
router.route("/logoutUser").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/current_user").get(verifyJWT, getCurrentUser)
router.route("/update-details").patch(verifyJWT, updateAccountDetails)
router.route("/cart-details").get(verifyJWT, getCartDetails)

export default router