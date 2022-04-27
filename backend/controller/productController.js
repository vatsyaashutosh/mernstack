const Product = require("../models/productModel");
const ApiFeatures = require("../utils/apifeatures");

// Create Product --Admin
exports.createProduct = async (req, res, next) => {
  try {
    req.body.user = req.user.id;
    console.log(req.user.id);
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(404).json(error);
  }
};
//Get all product
exports.getAllProducts = async (req, res) => {
  try {
    const resultPerPage = 5;
    const productCount = await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);
    const products = await apiFeature.query;

    res.status(200).json({ success: true, products, productCount });
  } catch (error) {
    res.status(404).json(error);
  }
};

//Get product by id

exports.getProductDetails = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(500).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(404).json(error);
  }
};

// Update Product --Admin

exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(500).json({
        success: false,
        message: "Product not found",
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(404).json(error);
  }
};

// Delete --admin(

exports.deleteProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(500).json({
        success: false,
        message: "Product not found",
      });
    }
    product = await Product.findByIdAndDelete(req.params.id, { new: true });
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    res.status(404).json(error);
  }
};

//Create product review
exports.createProductReview = async (req, res, next) => {
  try {
    const { rating, comment, productId } = req.body;
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };
    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.user._id.toString()
    );
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.user._id.toString())
          (rev.rating = rating), (rev.comment = comment);
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(404).json(error);
  }
};

//Get all reviews of a product
exports.getProductReviews = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
  } catch (error) {
    res.status(404).json(error);
  }
};

//delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    const reviews = product.reviews.filter(
      (rev) => rev._id.toString() !== req.query.id.toString()
    );
    let avg = 0;
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
    const ratings = avg / reviews.length;
    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
      req.query.productId,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(404).json(error);
  }
};
