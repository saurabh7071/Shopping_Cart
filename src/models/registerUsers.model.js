import mongoose, { Schema } from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto" // for generating OTP

const registerUserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,   // OTP will be stored temporarily for email verification
    },
    otpExpiry: {
        type: Date, // set expiry time for the OTP
    },
    otpRequestCount: {
        type: Number,
        default: 0
    },
    otpLastRequest: {
        type: Date
    },
    refreshToken: {
        type: String,
    },
    cartItems: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart"
        }
    ]
},{timestamps: true})

// password encryption
registerUserSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

registerUserSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

//Access tokesn
registerUserSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

//Refresh token
registerUserSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

// Email OTP generation
const MAX_LIMIT = 3;                        // maximum number of OTP request allow in 24 hours 
const OTP_REQUEST_TIMEOUT = 30 * 1000;      // 30 sec (time between OTP request)
registerUserSchema.methods.generateOTP = async function(){
    const currentTime = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Reset OTP request count after 24 hours 
    if(this.otpLastRequest && currentTime - this.otpLastRequest.getTime() >= oneDay){
        this.otpRequestCount = 0;
    }

    // Check if the user has reached the max OTP request limit for the day
    if(this.otpRequestCount > MAX_LIMIT){
        throw new Error(429, "Maximum OTP request limit reached. Please try again later.");
    }

    // Check if the user is requesting OTP too soon after the last request
    if(this.otpLastRequest && currentTime - this.otpLastRequest.getTime() < OTP_REQUEST_TIMEOUT){
        throw new Error(429, "Please wait before requesting OTP again.");
    }

    // Generate the OTP and update request tracking 
    const otp = crypto.randomBytes(3).toString("hex");  // generate 6 character hex OTP
    const hashOTP = await bcrypt.hash(otp, 10); // hash OTP before save into database 
    this.otp = hashOTP;
    this.otpExpiry = Date.now() + 60 * 1000;    // OTP expity time 
    this.otpRequestCount += 1;
    this.otpLastRequest = new Date();

    await this.save()
    return otp;
}

export const User = mongoose.model("User", registerUserSchema)