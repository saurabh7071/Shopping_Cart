import mongoose, { Schema } from "mongoose"

const registerUserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true,
        unique: true,
        lowercase: true,
        message: `${VALUE} is not a valid email address!!`
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart"
    }
},{timestamps: true})

export const RegisterUser = mongoose.model("RegisterUser", registerUserSchema)