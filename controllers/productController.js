import productModels from "../models/productModels.js";
import categoryModel from "../models/categoryModel.js";
import orderModel from "../models/orderModel.js";
import fs from "fs";
import slugify from "slugify";
import braintree from "braintree";
import dotenv from "dotenv";

dotenv.config();

//payment gateway
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

//Product Creation

export const createProductController = async (req, res) => {
  console.log("Creating Product");
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;

    switch (true) {
      case !name:
        return res
          .status(500)
          .send({ success: false, error: "Name is required" });
      case !description:
        return res
          .status(500)
          .send({ success: false, error: "Description is required" });
      case !price:
        return res
          .status(500)
          .sen({ success: false, error: "Price is required" });
      case !category:
        return res
          .status(500)
          .send({ success: false, error: "Category is required" });
      case !quantity:
        return res
          .status(500)
          .send({ success: false, error: "Quantity is required" });
      case photo && photo.size > 1000000:
        return res.status(500).send({
          success: false,
          error: "Photo is required and size must be less then 1mb",
        });
    }

    const products = new productModels({
      ...req.fields,
      slug: slugify(name),
    });

    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);

      products.photo.contentType = photo.type;
    }

    await products.save();

    res.status(201).send({
      success: true,
      message: "Product created successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in creating product",
      error,
    });
  }
};

// All Products Retrieval

export const getProductsController = async (req, res) => {
  try {
    const products = await productModels
      .find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      totalCount: products.length,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in retrieving products",
      error,
    });
  }
};

//single product retrieval

export const getSingleProductController = async (req, res) => {
  try {
    const product = await productModels
      .findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    res.status(200).send({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in retrieving product",
      error,
    });
  }
};

//get photo

export const productPhotoController = async (req, res) => {
  try {
    const product = await productModels
      .findById(req.params.pid)
      .select("photo");

    if (product.photo.data) {
      res.set("Content-Type", product.photo.contentType);
      res.status(200).send(product.photo.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in retrieving photo",
      error,
    });
  }
};

//delete product

export const deleteProductController = async (req, res) => {
  try {
    await productModels.findByIdAndDelete(req.params.pid).select("-photo");
    res.status(200).send({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting product",
      error,
    });
  }
};

//update product
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } =
      req.fields;

    const { photo } = req.files;

    switch (true) {
      case !name:
        return res
          .status(500)
          .send({ success: false, error: "Name is required" });
      case !description:
        return res
          .status(500)
          .send({ success: false, error: "Description is required" });
      case !price:
        return res
          .status(500)
          .sen({ success: false, error: "Price is required" });
      case !category:
        return res
          .status(500)
          .send({ success: false, error: "Category is required" });
      case !quantity:
        return res
          .status(500)
          .send({ success: false, error: "Quantity is required" });
      case photo && photo.size > 1000000:
        return res.status(500).send({
          success: false,
          error: "Photo is required and size must be less then 1mb",
        });
    }

    const products = await productModels.findByIdAndUpdate(
      req.params.pid,
      { ...req.fields, slug: slugify(name) },
      { new: true }
    );

    if (photo) {
      products.photo.data = fs.readFileSync(photo.path);

      products.photo.contentType = photo.type;
    }

    await products.save();

    res.status(201).send({
      success: true,
      message: "Product updated successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in updating product",
      error,
    });
  }
};

//filter product controller

export const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};

    if (checked.length > 0) args.category = checked;

    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

    const products = await productModels.find(args);

    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while filtering the product",
      error,
    });
  }
};

//product count

export const productCountController = async (req, res) => {
  try {
    const total = await productModels.find({}).estimatedDocumentCount();
    res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in product count",
      error,
    });
  }
};

//product list base on page

export const productListController = async (req, res) => {
  try {
    const perPage = 6;
    const page = req.params.page ? req.params.page : 1;

    const products = await productModels
      .find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in products per page",
      error,
    });
  }
};

//search product

export const serachProductController = async (req, res) => {
  try {
    const { keyword } = req.params;

    const results = await productModels
      .find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } },
        ],
      })
      .select("-photo");

    res.json(results);
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: falss,
      message: "Errror in search Product Api",
      error,
    });
  }
};

//similar products

export const relatedProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;

    const products = await productModels
      .find({
        category: cid,
        _id: { $ne: pid },
      })
      .select("-photo")
      .limit(3).populate("category")
    
      res.status(200).send({
        success: true,
        products
      })

   } catch (error) {
    console.log(error);
    res.status(404).send({
      success: false,
      message: "Error while getting related product",
      error,
    });
  }
};

// get products by category
export const productCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const products = await productModels.find({ category }).populate("category");
    res.status(200).send({
      success: true,
      category,
      products,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting products",
    });
  }
};


//payment gateway api
//token
export const braintreeTokenController = async (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

//payment
export const brainTreePaymentController = async (req, res) => {
  try {
    const { nonce, cart } = req.body;
    let total = 0;
    cart.map((i) => {
      total += i.price;
    });
    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const keepServerAwake = async (req, res) => {
  console.log("keepServerAwake")
  res.status(200).send({
    success: true,
  })
}