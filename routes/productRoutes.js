import express from "express";
import formidable from "express-formidable";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

import {
  createProductController,
  getProductsController,
  getSingleProductController,
  productPhotoController,
  deleteProductController,
  updateProductController,
  productFilterController,
  productCountController,
  productListController,
  serachProductController,
  relatedProductController,
  productCategoryController,
  brainTreePaymentController,
  braintreeTokenController,
} from "../controllers/productController.js";

const Router = express.Router();

//routes

//create product route
Router.post(
  "/create-product",
  requireSignIn,
  isAdmin,
  formidable(),
  createProductController
);

//get product route
Router.get("/get-product", getProductsController);

//get single product
Router.get("/single-product/:slug", getSingleProductController);

//get photo
Router.get("/product-photo/:pid", productPhotoController);


//delete Product
Router.delete("/delete-product/:pid", deleteProductController);

//update product
Router.put(
  "/update-product/:pid",
  requireSignIn,
  isAdmin,
  formidable(),
  updateProductController
);

//filter Product

Router.post('/product-filter',productFilterController);

//product count 
Router.get('/product-count',productCountController);

//products per page
 Router.get('/product-list/:page',productListController);

//search product
Router.get('/search/:keyword',serachProductController);

//similar products

Router.get('/related-product/:pid/:cid',relatedProductController);

//category wise product
Router.get("/product-category/:slug", productCategoryController);

//payments routes
//token
Router.get("/braintree/token", braintreeTokenController);

//payments
Router.post("/braintree/payment", requireSignIn, brainTreePaymentController);


export default Router;