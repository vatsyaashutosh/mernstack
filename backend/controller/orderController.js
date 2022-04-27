const Order = require("../models/orderModel");
const Product = require("../models/productModel");

//Create new Order

exports.newOrder = async (req, res, next) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;
    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(401).json(error);
  }
};

//get Single Order
exports.getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      return res
        .status(400)
        .json({ message: "Order not found with this id", status: false });
    }
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(401).json(error);
  }
};

//get logged in user orders
exports.myOrders = async (req, res, next) => {
  try {
    const order = await Order.find({ user: req.user._id });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(401).json(error);
  }
};

//get all orders --admin

exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();
    let totalAmount = 0;
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    res.status(200).json({
      success: true,
      totalAmount,
      orders,
    });
  } catch (error) {
    res.status(401).json(error);
  }
};

//update Order Status --Admin
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res
        .status(400)
        .json({ message: "Order not found with this id", status: false });
    }
    if (order.orderStatus === "Delivered") {
      return res.status(400).json({
        message: "You have already delivered this order",
        status: false,
      });
    }

    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });

    order.orderStatus = req.body.status;
    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }
    await order.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(401).json(error);
  }
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  console.log(product);

  product.Stock -= quantity;
  await product.save({
    validateBeforeSave: false,
  });
}

//delete order --admin

exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(400)
        .json({ message: "Order not found with this id", status: false });
    }
    await order.remove();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(400).json(error);
  }
};
