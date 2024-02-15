import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import {
  createCategoryController,
  updateCategoryController,
  categoryController,
  singleCategoryController,
  deleteCategoryController
} from "../controllers/categoryController.js";
const Router = express.Router();

//Routes
//create category
Router.post(
  "/create-category",
  requireSignIn,
  isAdmin,
  createCategoryController
);

//update category

Router.put(
  "/update-category/:id",
  requireSignIn,
  isAdmin,
  updateCategoryController
);

//getAll Categories

Router.get("/get-category", categoryController);

//get single category

Router.get("/single-category/:slug", singleCategoryController);

//delete categgories

Router.delete("/delete-category/:id", requireSignIn, isAdmin, deleteCategoryController);

export default Router;
