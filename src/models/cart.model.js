import mongoose, { Schema } from "mongoose"

const cartSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RegisterUser"
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
}, {timestamps: true})

export const Cart = mongoose.model("Cart", cartSchema)