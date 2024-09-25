import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

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
    },
}, {timestamps: true})

productSchema.plugin(mongooseAggregatePaginate)
export const Product = mongoose.model("Product", productSchema)