import { asyncHandler } from "../utils/asyncHandler.js"
import { Product } from "../models/products.model.js"
import { ApiError } from "../utils/ApiError.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import {  ApiResponse } from "../utils/ApiResponse.js"
import mongoose from "mongoose"


const addProducts = asyncHandler(async (req, res) =>{

    const { name, description, price } = req.body

    if(!name || !description || !price){
        throw new ApiError(400, "All fields are required!!")
    }

    // check for image
    const imageLocalPath = req.files?.image[0]?.path
    console.log(imageLocalPath);

    if(!imageLocalPath){
        throw new ApiError(400, "Please upload image !!")
    }

    const image = await uploadOnCloudinary(imageLocalPath)
    console.log(image);

    if(!image){
        throw new ApiError(400, "Please upload image !!")
    }
    
    // create product object
    const product = await Product.create({
        name,
        description,
        price,
        image: image.url
    })

    // check for product creation
    const createdProduct = await Product.findById(product._id)

    if(!createdProduct){
        throw new ApiError(400, "Something went wrong while product storing!!")

    }

    return res
    .status(200)
    .json(
        new ApiResponse(201, createdProduct, "Product added successfully !!")
    )
})

const getAllProducts = asyncHandler(async (req, res) =>{
    const {
            // page = 1,
            // limit = 10,
            query = '',
            sortBy = 'createdAt',
            sortType = 'desc',
            productId
        } = req.query;

    // pagination logic
    const pageNum = Number(req.query.page) || 1
    const limitNum = Number(req.query.limit) || 10
    const skip = (pageNum - 1) * limitNum

    // building filter object for the query
    const filter = {}

    if(query){
        filter.name = { $regex: query, $options: 'i'}
    }
    if(productId){
        filter._id = productId
    }

    // Sorting logic(based on field and type)
    const sortOption = { [sortBy]: sortType === 'asc' ? 1 : -1}

    // Fetching products from database 
    const products = await Product
    .find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum)

    // getting total count for pagination 
    const totalProducts = await Product.countDocuments(filter)
    const totalPages = Math.ceil(totalProducts / limitNum)

    return res
    .status(200)
    .json({
        page: pageNum,
        totalPages,
        totalProducts,
        products
    })
})

const getProductById = asyncHandler(async (req, res) =>{
    const { productId } = req.params

    if(!mongoose.Types.ObjectId.isValid(productId)){
        throw new ApiError(400, "Invalid product id")
    }

    try {
        const product = await Product.findById(productId)

        if(!product){
            throw new ApiError(404, "Product not found")
        }

        return res
        .status(200)
        .json(new ApiResponse(201, product, "Product fetch by id"))

    } catch (error) {
        throw new ApiError(500, error?.message || "Product not found")
    }
})

const updateProduct = asyncHandler(async (req, res) =>{
    const { productId } = req.params

    if(!mongoose.Types.ObjectId.isValid(productId)){
        throw new ApiError(400, "Invalid product id")
    }

    const { name, description, price } = req.body

    if(!name || !description || !price){
        throw new ApiError(400, "All fields are required!!")
    }

    const product = await Product.findById(productId).select("name description price")
    console.log(product);
    
    if(!product){
        throw new ApiError(404, "Product not found")
    }

    if(product.name === name && product.description === description && product.price === price){
        throw new ApiError(400, "No changes detected, please update at least one field")
    }

    const updateDetails = await Product.findByIdAndUpdate(
        productId,
        {
            $set: {
                name,
                description,
                price
            }
        },
        {
            new: true, runValidators: true
        }
    )

    if(!updateDetails){
        throw new ApiError(400, "Something went wrong while updating product")
    }

    return res
    .status(200)
    .json(new ApiResponse(201, updateDetails, "Product details updated successfully !!"))

})

const updateImage = asyncHandler(async (req, res)=>{

    const { productId } = req.params

    if(!mongoose.Types.ObjectId.isValid(productId)){
        throw new ApiError(400, "Invalid product id")
    }

    const imageLocalPath = req.file?.path;

    if(!imageLocalPath){
        throw new ApiError(400, "Image file is missing !!")
    }

    const image = await Product.findById(productId).select("image")

    if(!image){
        throw new ApiError(404, "Product not found")
    }

    const newImage = await uploadOnCloudinary(imageLocalPath)

    if(!newImage){
        throw new ApiError(400, "Something went wrong while uploading image")
    }

    if(image.image){
        const publicId = getPublicIdFromUrl(image.image)
        await deleteFromCloudinary(publicId, "image")
    }

    const updateImage = await Product.findByIdAndUpdate(
        productId,
        {
            $set: {
                image: newImage.url
            }
        },
        {
            new: true, runValidators: true
        }
    )

    if(!updateImage){
        throw new ApiError(400, "Something went wrong while updating image")
    }

    return res
    .status(200)
    .json(new ApiResponse(201, updateImage, "Image Updated Successfully !!"))
})

const deleteProduct = asyncHandler(async (req, res) =>{
    const { productId } = req.params

    if(!mongoose.Types.ObjectId.isValid(productId)){
        throw new ApiError(400, "Invalid product id")
    }

    const product = await Product.findById(productId)

    if(!product){
        throw new ApiError(404, "Product not found")
    }

    const imageFileUrl = product.image

    if(imageFileUrl){
        const imagePublicId = getPublicIdFromUrl(imageFileUrl)
        await deleteFromCloudinary(imagePublicId, "image")
    }

    await Product.deleteOne({ _id: productId})

    return res
    .status(200)
    .json(new ApiResponse(201, null, "Product delete Successfully !!"))
})

function getPublicIdFromUrl(url){
    const parts = url.split('/')
    const publicIdWithExtension = parts[parts.length - 1]
    const publicId = publicIdWithExtension.split('.')[0]
    return publicId;
}

export { 
    addProducts, 
    getAllProducts,
    getProductById,
    updateProduct,
    updateImage,
    deleteProduct
}