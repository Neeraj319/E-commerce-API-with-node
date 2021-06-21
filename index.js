require("dotenv").config();

const productApp = require("./products/product.js");
const express = require("express");
const { userApp } = require("./users/users.js");
const customerApp = require("./customers/customers.js");
const app = express();

app.use(express.json());
app.use("/products", productApp);
app.use("/customer", customerApp);
app.use("/auth", userApp);
app.get("/", (req, res) => {
  res.send("home page docs available soon");
});
app.listen(5000, () => console.log("server started"));
