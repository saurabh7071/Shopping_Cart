import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from '../models/registerUsers.model.js'
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import { Cart } from "../models/cart.model.js"
import { mailSender } from "../utils/mailSender.js"
import bcrypt from "bcrypt"

const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //Storing refresh token into database
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: true })

        return { accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res)=>{
    const { username, email, password } = req.body

    if([username, email, password].some((field)=>{!field || field?.trim() === ""})){
        throw new ApiError(400, "All fileds are required!!")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        if(!existedUser.emailVerified){
            throw new ApiError(400,  "Email already exists but not verified. Please verify your email or resend OTP.")
        }
        throw new ApiError(400, "User with username or email already exists!!")
    }

    const user = await User.create({
        username, 
        email, 
        password,
    })

    const otp = await user.generateOTP();  // Generate OTP

    console.log("user are : ",user);

    // remove password and refresh token from the response 
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser) {
        throw new ApiError(404, "Something went wrong while registering the user")
    }

    // Send OTP to user's email
    await mailSender( 
        user.email ,
        "OTP Verification" ,
        `Dear ${user.username},\n\nWe received a request to verify your email address. Please use the following One-Time Password (OTP) to complete the verification process:\n\nOTP: ${otp}\n\nThis OTP will expire in 1 minutes. If you did not request this, please ignore this email.\n\nThank you,\nFucking Team!!`
    )
    .catch(error =>{
        throw new ApiError(500, `Failed to send email: ${error.message}`);
    })

    return res
    .status(200)
    .json(new ApiResponse("OTP sent to your email. Please verify.", 201, createdUser))
})

const verifyOTP = asyncHandler(async (req, res)=>{
    const { email, otp } = req.body;

    if(!email || !otp){
        throw new ApiError(400, "Email and OTP are required!!")
    }

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404, "User not found!!")
    }

    console.log("Received OTP :", otp);
    console.log("Hashed OTP from DB", user.otp);
    
    if(user.emailVerified){
        throw new ApiError(400, "Email already verified!!. No need to use the OTP again.")
    }

    //Check if the OTP matches and is not expired
    if(user.otpExpiry && user.otpExpiry < Date.now()){
        throw new ApiError(400, "OTP has expired, Please request a new OTP!!")
    }

    // Compare provided OTP with the hashed OTP stored in the database
    const isOtpValid = await bcrypt.compare(otp, user.otp);

    if(!isOtpValid){
        throw new ApiError(400, "Invalid OTP!!")
    }

    // mark the email as verified and clear OTP fields
    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;


    await user.save();

    return res
    .status(200)
    .json(new ApiResponse(201, user.emailVerified, "Email verfied Succssfully!!"));
})

const resendOTP = asyncHandler(async (req, res)=>{
    const { email } = req.body;

    if(!email){
        throw new ApiError(400, "Email is required!!")
    }

    //Find the user by email
    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404, "User not found!!")
    }
    
     // Check if the user has already verified their email
    if (user.emailVerified) {
        throw new ApiError(400, "Your email is already verified. No need to resend the OTP.");
    }
    
    // check if the OTP request limit has been reached (optional, can be removed)
    const currentTime = Date.now();
    
    // Check if the OTP is still valid (not expired)
    if(user.otp && user.otpExpiry && user.otpExpiry > currentTime){
        const remainingTime = Math.ceil((user.otpExpiry - currentTime) / 1000);  // calculate remaining time in second 
        throw new ApiError(400, `OTP is still valid. Please wait ${remainingTime} seconds before requesting a new OTP.`);
    }

    //Generate new OTP
    const otp = await user.generateOTP();
    user.otpRequestCount += 1;
    await user.save();

    // Send new OTP to the user via Email
    await mailSender(
        user.email,
        "OTP Verification",
        `Your new OTP for verification is: ${otp}. Please use this OTP within the next minute to complete your verification process.`
    )

    return res
    .status(200)
    .json(new ApiResponse("New OTP sent successfully!", 200, null))
})

const loginUser = asyncHandler(async (req, res)=>{
    // Steps 

    // get data from req.body
    // validation - username or email 
    // check if user exists
    // check password
    // generate access token
    // generate refresh token
    // send access token and refresh token - cookie 
    // return response

    const { email, password} = req.body

    if([email].some((field)=>{!field || field?.trim() === ""})){
        throw new ApiError(400, "Email are required!!")
    }

    // const user = await User.findOne({
    //     $or: [{username}, {email}]
    // })

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404, "User not found!!")
    }

    // check if the email is verified
    if(!user.emailVerified){
        throw new ApiError(400, "Email not verified. Please verify your email first !!")
    }
    // check password
    const isPasswordValid = await user.comparePassword(password)

    if(!isPasswordValid){
        throw new ApiError(400, "Invalid User Credentials !!")
    }

    // generate access and refresh token
    const { accessToken, refreshToken  } = await generateAccessAndRefreshToken(user._id)

    // Fetch user's cart items
    const cart = await Cart.findOne({ user: user._id }).populate({
        path: "items.productId",
        select: "name description price image"
    })

    // send accessToken and refreshToken - cookie
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            201, 
            {
                user: {
                    ...loggedInUser._doc,               // use _doc to spread the user object 
                    cartItems: cart? cart.items : []    // Include cart items or empty array 
                },
                accessToken, refreshToken
            },
            "User logged in Successfully !!"
        )
    )

})

const logoutUser = asyncHandler(async (req, res)=>{
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $unset: {
                refreshToken: 1,
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out Successfully!!"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    //Take incoming token from user
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    console.log(incomingRefreshToken);
    
    // validate incoming token
    if(!incomingRefreshToken) {
        throw new ApiError(400, "Unauthorized request")
    }

    try {
        // verify incoming token
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        // fetch UserId from decoded token 
        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }

        // check both token match or not 
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }

        // if both token are match - generate new token 
        const options = {
            httpOnly: true,
            secure: true
        }

        const {accessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id)
        
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(new ApiResponse(
            201,
            {
                accessToken, refreshToken: newrefreshToken,
            },
            "Tokens are Refreshed Successfully"
        ))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) =>{
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id).select("+password")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    // compare the provided old password with the stored hash 
    const isPasswordCorrect = await user.comparePassword(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Old password is incorrect")
    }

    // check if the old password same as the new password
    const isSameAsOld = await user.comparePassword(newPassword)

    if(isSameAsOld){
        throw new ApiError(400, "New password cannot be same as old password")
    }

    // update password
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed Successfully!!"))

})

const getCurrentUser = asyncHandler(async (req, res) =>{
    return res
    .status(200)
    .json(
        new ApiResponse(201, req.user, "Current User Fetched Succssfully!!")
    )
})

const updateAccountDetails = asyncHandler(async (req, res) =>{
    const { username, email } = req.body

    if(!username || !email){
        throw new ApiError(400, "Please Provide username and email")
    }

    const user = await User.findById(req.user?._id).select("username email")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    if(user.username === username && user.email === email){
        throw new ApiError(400, "No chnages Detected, Please update at least one field")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            username,
            email
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(201, updatedUser, "Account Details Updated Successfully!!")
    )
})

const getCartDetails = asyncHandler(async (req, res) =>{
console.log(req.user);


    // Fetch the cart for the logged-in user 
    const cart = await Cart.findOne({ user: req.user._id }).populate({
        path: "items.productId",
        select: "name description price image"
    })

    console.log(cart);
    
    if(!cart){
        throw new ApiError(404, "Cart not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(201, cart, "Cart Details Fetched Successfully!!"))
})


export {
    registerUser,
    loginUser,
    verifyOTP,
    resendOTP,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    getCartDetails
}