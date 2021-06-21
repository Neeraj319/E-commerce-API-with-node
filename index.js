require("dotenv").config();

const productApp = require("./products/product.js");
const express = require("express");
const { userApp } = require("./users/users.js");
const customerApp = require("./customers/customers.js");
const app = express();
const bodyParser = require("body-parser"),
  swaggerJsdoc = require("swagger-jsdoc"),
  swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API with express",
      version: "0.1.0",
      description: "This is an e-commerce site with express",
    },
  },
  apis: ["./routes/books.js"],
};
const specs = swaggerJsdoc(options);
app.use(express.json());
app.use("/products", productApp);
app.use("/customer", customerApp);
app.use("/auth", userApp);
app.get("/", (req, res) => {
  res.send("home page  visit /docs for the docs of the api");
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
app.listen(5000, () => console.log("server started"));
