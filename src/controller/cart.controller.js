import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Product } from "../models/products.model.js"
import { Cart } from "../models/cart.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const addItemToCart = asyncHandler(async (req, res) =>{
    const productId = req.params.productId;
    const quantity = Number(req.body.quantity);

    if(!productId){
        throw new ApiError(400, "All fields are required!!")
    }

    //check if the product exists in the product collection 
    const product = await Product.findById(productId).select("name description price image")

    if(!product){
        throw new ApiError(404, "Product not found")
    }

    // Find the user's cart
    let cart = await Cart.findOne({user: req.user._id})

    if(!cart){
        // if the cart does not exists, create a new one
        cart = new Cart({
            user: req.user._id,
            items: [{ productId, quantity }]
        });
    }else{
        // check if the product is already in the cart
        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId));

        if(itemIndex > -1){
            // if the product already in the cart, update the quantity 
            cart.items[itemIndex].quantity += quantity;
        }else{
            // if the product is not in the cart, add it
            cart.items.push({productId, quantity});
        }
    }

    await cart.save();

    // Response with the cart details including the product information 
    const updatedCart = await Cart.findOne({user: req.user._id}).populate({
        path: "items.productId",                    // populate product details for each cart item 
        select: "name description price image"      // only include required field 
    })

    return res
    .status(200)
    .json(new ApiResponse(201, updatedCart, "Item added to Cart"))
})

const removeItemFromCart = asyncHandler(async (req, res) =>{
    const { productId } = req.body

    // find the user's cart
    const cart = await Cart.findOne({ user: req.user._id})

    if(!cart){
        throw new ApiError(404, "Cart not found")
    }

    // check if the product exist in the cart
    const productInCart = cart.items.find(item => item.productId.toString() === productId)
    
    if(!productInCart){
        throw new ApiError(404, "Product not found in cart")
    }

    // remove the product from the cart using $pull operator 
    await Cart.updateOne(
        {
            user: req.user._id
        },
        {
            $pull: {
                items: {
                    productId: productId
                }
            }
        }
    )

    // fetch the updated cart and populate product details 
    const updatedCart = await Cart.findOne({user: req.user._id}).populate({
        path: "items.productId",
        select: "name description price image"
    })

    return res
    .status(200)
    .json(new ApiResponse(201, updatedCart, "Item removed from the cart Successfully!!"))
})

const updateCartItemQuantity = asyncHandler(async (req, res) =>{
    const productId = req.body.productId;
    const quantity = Number(req.body.quantity);
    

    const cart = await Cart.findOne({ user: req.user._id })

    if(cart){
        const itemIndex = cart.items.findIndex(item => item.productId.equals(productId))

        if(itemIndex > -1){
            // update the quantity
            cart.items[itemIndex].quantity += quantity
            await cart.save();

            return res
            .status(200)
            .json(new ApiResponse(201, cart, "Cart Updated"))
        }else{
            throw new ApiError(404, "Product not found in Cart")
        }
    }else{
        throw new ApiError(404, "Cart not found")
    }
})

const getCartDetails = asyncHandler(async (req, res) =>{
    const cart = await Cart.findOne({ user: req.user._id }).populate({
        path: "items.productId",
        select: "name description price image"
    })

    if(!cart){
        throw new ApiError(404, "Cart not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(201, cart, "Cart Details are fetched Successfully!!"))
})

const clearCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id })

    if(cart){
        cart.items = []
        await cart.save();

        return res
        .status(200)
        .json(new ApiResponse(201, cart, "Cart Cleared!!"));

    }else{
        throw new ApiError(404, "Cart not found");
    }
})
export {
    addItemToCart,
    removeItemFromCart,
    updateCartItemQuantity,
    getCartDetails,
    clearCart
}