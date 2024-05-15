import express from "express";
import { create as createHbs } from "express-handlebars";
import { connectMongoDB } from "./db/conn.js";
import { ProductModel } from "./db/model/product.model.js";
import { CategoryModel } from "./db/model/category.model.js";

// Tao app
const app = express();

// Cau hinh Handlebars
const hbs = createHbs({
  defaultLayout: "main",
  extname: "hbs",
  layoutsDir: "views/layout",
  partialsDir: "views/partials",
  helpers: {
    eq: (left, right) => {
      return left === right;
    },
  },
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views/pages");

// Cau hinh static files
app.use(express.static("public"));
// Cau hinh parse Req body
app.use(express.urlencoded());

connectMongoDB();

// Route render trang products
app.get("/products", async (req, res) => {
  const products = await ProductModel.find().lean();
  const categories = await CategoryModel.find().lean();

  res.render("products", {
    pageCode: "product",
    products,
    categories,
  });
});

// Route render trang Tao danh muc
app.get("/products/create-category", (req, res) => {
  res.render("create-category", {
    pageCode: "product",
  });
});

app.post("/products/create-category", async (req, res) => {
  const data = req.body;
  console.log("Data: ", data);

  // Cach 1: Tao Category document & dung method Document.save()
  // const category = new CategoryModel({
  //   name: data.name,
  //   desc: data.desc,
  // });
  // await category.save();

  // Cach 2: Dung method CategoryModel.create()
  await CategoryModel.create({
    name: data.name,
    desc: data.desc,
  });

  res.redirect("/products");
});

app.get("/products/category/:id", async (req, res) => {
  const id = req.params.id;
  const category = await CategoryModel.findById(id).lean();
  console.log("Category: ", category);

  res.render("create-category", {
    pageCode: "product",
    category,
    isEditing: true,
  });
});

app.post("/products/category/:id", async (req, res) => {
  const id = req.params.id;
  const data = req.body;
  console.log("Data: ", data);

  // Cap nhat du lieu moi cho danh muc trong MongoDB
  await CategoryModel.updateOne(
    // Filter object
    {
      _id: id,
    },
    // Update object
    {
      $set: {
        name: data.name,
        desc: data.desc,
      },
    }
  );

  res.redirect("/products");
});

// Run app
app.listen(3000, () => {
  console.log("App is running on port 3000");
});
