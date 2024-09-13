import mongoose, { Schema } from "mongoose"

const productSchema = new Schema({
    image: {
        type: String,     //cloudinary url
        required: true
    },
    name: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, {timestamps: true})

export const Product = mongoose.model("Product", productSchema)