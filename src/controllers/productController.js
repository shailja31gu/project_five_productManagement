const productModel = require("../models/productModel")
const { isValid, isValidRequestBody, isValidObjectId } = require('../util/validator');
const currencySymbol = require("currency-symbol-map")
const aws = require("aws-sdk");

//---------AWS S3..............................................................
aws.config.update(
    {
        accessKeyId: "AKIAY3L35MCRVFM24Q7U",
        secretAccessKey: "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",
        region: "ap-south-1"
    }
)
let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        let s3 = new aws.S3({ apiVersion: "2006-03-01" })
        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "Minakshi/" + file.originalname,
            Body: file.buffer
        }
        console.log(uploadFile)
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            return resolve(data.Location)
        }
        )
    }
    )
}

///..............Create product.................................................................
const createProduct = async function (req, res) {
    try {
        const requestBody = req.body;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'please provide valid inputs in request body' })
        }

        let { title, description, price, currencyId, isFreeShipping, style, availableSizes, installments } = requestBody;

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: 'Title is required' })
        }

        const duplicatetitle = await productModel.findOne({ title });

        if (duplicatetitle) {
            return res.status(400).send({ status: false, message: 'Title is already used.' })
        }

        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: 'Description is required' })
        }

        if (!isValid(price)) {
            return res.status(400).send({ status: false, message: 'Price is required' })
        }
        if (isNaN(price)) {
            return res.status(400).send({ status: false, message: 'Price should be a numeric value' })
        }

        if (price <= 0) {
            return res.status(400).send({ status: false, message: `Price should be a valid number` })
        }

        if (!isValid(currencyId)) {
            return res.status(400).send({ status: false, message: 'CurrencyId is required' })
        }

        if (!(currencyId == "INR")) {
            return res.status(400).send({ status: false, message: 'currencyId should be INR' })
        }

        if (isValid(isFreeShipping)) {

            if (!((isFreeShipping === "true") || (isFreeShipping === "false"))) {
                return res.status(400).send({ status: false, message: 'isFreeShipping must be a boolean value' })
            }
        }
        if (!isValid(style)) {
            return res.status(400).send({ status: false, message: 'Style is required' })
        }
        if (installments) {
            if (!isValid(installments)) {
                return res.status(400).send({ status: false, message: "please enter installments" })
            }
            if (isNaN(installments)) {
                return res.status(400).send({ status: false, message: 'Installment should be a numeric value' })
            }
        }
        let productImage = req.files;
        if (!(productImage && productImage.length > 0)) {
            return res.status(400).send({ status: false, msg: "productImage is required" });
        }

        let productImageUrl = await uploadFile(productImage[0]);
        const newProductData = {
            title,
            description,
            price,
            currencyId,
            currencyFormat: currencySymbol(currencyId),
            isFreeShipping,
            style,
            installments,
            productImage: productImageUrl
        }

        if (!isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: 'available Sizes is required' })
        }
        availableSizes = availableSizes.toUpperCase()
        if (availableSizes) {
            let sizeArray = availableSizes.split(",").map(x => x.trim())

            for (let i = 0; i < sizeArray.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizeArray[i]))) {
                    return res.status(400).send({ status: false, message: `Available Sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })
                }
            }

            if (Array.isArray(sizeArray)) {
                newProductData['availableSizes'] = sizeArray  //
            }
        }
        const saveProductDetails = await productModel.create(newProductData)
        res.status(201).send({ status: true, message: "Success", data: saveProductDetails })

    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, data: error });
    }
}
///////////.................. get product by query params...............................
const getAllProducts = async (req, res) => {
    try {
        const filterQuery = { isDeleted: false, deletedAt: null };
        const queryParams = req.query;
        if (isValidRequestBody(queryParams)) {
            const { size, title } = queryParams;
            if (isValid(size)) {
                if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(size) === -1) {
                    return res.status(400).send({ status: false, message: "Please select a available size" })
                }
                filterQuery['availableSizes'] = size
            }
            if (isValid(title)) {
                const titleExist = await productModel.find(filterQuery).lean();
                const titleFilter = titleExist.map(x => x.title)

                const titleFound = titleFilter.filter(element => element.includes(title))
                filterQuery['title'] = titleFound

            }
            if (queryParams.priceGreaterThan) {
                if (isValid(queryParams.priceGreaterThan)) {
                    if (isNaN(queryParams.priceGreaterThan)) {
                        return res.status(400).send({ status: false, message: "price greater than should be a numeric value" })
                    }
                    filterQuery.price = { $gt: queryParams.priceGreaterThan }
                }
            }
            if (queryParams.priceLessThan) {
                if (isValid(queryParams.priceLessThan)) {
                    if (isNaN(queryParams.priceLessThan)) {
                        return res.status(400).send({ status: false, message: "price less than should be a numeric value" })
                    }
                    filterQuery.price = { $lt: queryParams.priceLessThan }
                }
            }

            if (queryParams.priceGreaterThan && queryParams.priceLessThan) {
                filterQuery.price = {
                    $gt: queryParams.priceGreaterThan,
                    $lt: queryParams.priceLessThan
                }
            }
        }
        if (queryParams.priceSort) {
            if (isValid(queryParams.priceSort)) {
                if (isNaN(queryParams.priceSort)) {
                    return res.status(400).send({ status: false, message: "priceSort should be 1 or -1" })
                }
                if (!((queryParams.priceSort == 1) || (queryParams.priceSort == -1))) {
                    return res.status(400).send({ status: false, message: "priceSort should be 1 or -1" })
                }
                const products = await productModel.find(filterQuery).sort({ price: queryParams.priceSort })
                if (products.length === 0) {
                    return res.status(404).send({ status: false, message: "No products found" })
                }
                return res.status(200).send({ status: true, message: "Success", data: products })
            }
        }
        const products = await productModel.find(filterQuery)
            .select({ isDeleted: 0, deletedAt: 0, createdAt: 0, updatedAt: 0, __v: 0 });
        if (products.length === 0) {
            return res.status(404).send({ status: false, message: "No products found" })
        }
        return res.status(200).send({ status: true, message: "Success", data: products })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

const getProduct = async (req, res) => {

    try {
        const id = req.params.productId

        if (!isValidObjectId(id)) {
<<<<<<< HEAD
            res.status(400).send({ status: false, message: `${id} is not a valid product id` })
=======
            res.status(400).send({ status: false, message: `${id} is not a valid productId` })
>>>>>>> 8b601782c94fb81055f2dd187beadd28f4297b62
            return
        }
        const productDetail = await productModel.findOne({ _id: id, isDeleted: false })
            .select({ isDeleted: 0, deletedAt: 0, createdAt: 0, updatedAt: 0, __v: 0 })

        if (!productDetail) return res.status(404).send({ status: false, message: "product not found" })

        return res.status(200).send({ status: true, message: 'sucess', data: productDetail })
    }
    catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}
const updateProductData = async (req, res) => {
    try {
        const productId = req.params.productId;
        const productData = req.body;
        const files = req.files;

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "please provide valid productId" });
        }
<<<<<<< HEAD
        if (!Object.keys(productData).length > 0) return res.status(400).send({status: false, message:"Please enter data for updation"})
=======
        if (!isValidRequestBody(productData)) {
            return res.status(400).send({ status: false, message: "Please provide product details to update" });
        }
>>>>>>> 8b601782c94fb81055f2dd187beadd28f4297b62

        const isproductIdPresent = await productModel.findOne({ _id: productId, isDeleted: false });
        if (!isproductIdPresent) {
            return res.status(404).send({ status: false, message: `User data not found with this Id ${productId}` });
        }

        let { title, description, price, currencyId, currencyFormat,
            isFreeShipping, productImage, style, availableSizes, installments } = productData;

        const updateProductData = {};
        if ("title" in productData) {
            if (!isValid(title)) {
                return res.status(400).send({ status: false, message: "title is required" })
            }
            let duplicateTitle = await productModel.findOne({ title })
            if (duplicateTitle) {
                return res.status(400).send({ status: false, message: `title Already Present. Take another title` });
            }
            if (!('$set' in updateProductData)) {
                updateProductData["$set"] = {};
            }
            updateProductData['$set']['title'] = title
        }
        if ("description" in productData) {
            if (!isValid(description)) {
                return res.status(400).send({ status: false, message: "description is required" })
            }
            if (!('$set' in updateProductData)) {
                updateProductData["$set"] = {};
            }
            updateProductData['$set']['description'] = description
        }
        if ("price" in productData) {
            if (!isValid(price)) {
                return res.status(400).send({ status: false, message: "price is required" })
            }
            if (isNaN(price)) {
                return res.status(400).send({ status: false, message: 'Price should be a numeric value' })
            }
            if (price <= 0) {
                return res.status(400).send({ status: false, message: `Price should be a valid number` })
            }
            if (!('$set' in updateProductData)) {
                updateProductData["$set"] = {};
            }
            updateProductData['$set']['price'] = price
        }
        if ("currencyId" in productData) {
            if (!isValid(currencyId)) {
                return res.status(400).send({ status: false, message: "currencyId is required" })
            }
            if ((currencyId !== "INR")) {
                return res.status(400).send({ status: false, message: 'currencyId should be INR' })
            }
            if (!('$set' in updateProductData)) {
                updateProductData["$set"] = {};
            }
            updateProductData['$set']['currencyId'] = currencyId
        }
        if ("currencyFormat" in productData) {
            if (!isValid(currencyFormat)) {
                return res.status(400).send({ status: false, message: "currencyFormat is required" })
            }
            if (!('$set' in updateProductData)) {
                updateProductData["$set"] = {};
            }
            updateProductData['$set']['currencyFormat'] = currencyFormat
        }
        if ("isFreeShipping" in productData) {
            if (!((isFreeShipping === "true") || (isFreeShipping === "false"))) {
                return res.status(400).send({ status: false, message: 'isFreeShipping must be a boolean value' })
            }
            if (!('$set' in updateProductData)) {
                updateProductData["$set"] = {};
            }
            updateProductData['$set']['isFreeShipping'] = isFreeShipping
        }
        if ("style" in productData) {
            if (!('$set' in updateProductData)) {
                updateProductData["$set"] = {};
            }
            updateProductData['$set']['style'] = style
        }
        if ("availableSizes" in productData) {
            if (!isValid(availableSizes)) {
                return res.status(400).send({ status: false, message: "availableSizes is required" })
            }
            if (["S", "XS", "M", "X", "L", "XXL", "XL"].indexOf(availableSizes) === -1) {
                return res.status(400).send({ status: false, message: "Size should be valid size" })
            }
            if (!('$set' in updateProductData)) {
                updateProductData["$set"] = {};
            }
            updateProductData['$set']['availableSizes'] = availableSizes  
        }
        if ("installments" in productData) {
            if (!isValid(installments)) {
                return res.status(400).send({ status: false, message: "Please enter installment amount in INR" })
            }
            if (isNaN(installments)) {
                return res.status(400).send({ status: false, message: 'installments should be a numeric value' })
            }
            if (!('$set' in updateProductData)) {
                updateProductData["$set"] = {};
            }
            updateProductData['$set']['installments'] = installments
        }
        if (productImage && productImage.length > 0) {
            const imageUrl = await uploadFile(productImage[0])
            if (!('$set' in updateProductData)) {
                updateProductData["$set"] = {};
            }
            updateProductData['$set']['productImage'] = imageUrl
        }
        const updatedData = await productModel.findOneAndUpdate({ _id: productId }, updateProductData, { new: true })
            .select({ deletedAt: 0, isDeleted: 0, createdAt: 0, updatedAt: 0, __v: 0 })
        res.status(200).send({ status: true, message: "Product updated", data: updatedData })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });

    }

}

const deleteProduct = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: `${productId} is not a valid product id` })
        }
        const productFound = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productFound) {
            return res.status(404).send({ status: false, message: "product not found" })
        }
        const productDeleted = await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: new Date() } })
        return res.status(200).send({ status: true, message: "Product deleted successfully" })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createProduct, getAllProducts, getProduct, deleteProduct, updateProductData }
