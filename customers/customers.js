const express = require("express");
const customerApp = express.Router();
const { checkLoggedIn } = require("../users/users.js");
const client = require("../models");

customerApp.use((req, res, next) => {
  console.log("customer app called");
  next();
});

customerApp.post("/add_cart/:id", checkLoggedIn, (req, res) => {
  const { id } = req.params;
  client.query(
    "INSERT INTO cart (product_id , customer_id) values($1 , $2)",
    [id, res.user_id],
    (err, data) => {
      if (err) {
        res.setStatus = 406;
        res.send({
          message: err.detail,
        });
      } else {
        res.sendStatus(201);
      }
    }
  );
});

module.exports = customerApp;
