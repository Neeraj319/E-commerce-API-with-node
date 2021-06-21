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

customerApp.get("/user_cart", checkLoggedIn, (req, res) => {
  const customer_id = res.user_id;
  client.query(
    "select p.name , p.des , p.id , p.price, p.category from product p left join cart c on p.id = c.product_id left join customer cr on c.customer_id =  cr.c_id where cr.c_id = $1",
    [customer_id],
    (err, data) => {
      if (err) {
        res.sendStatus(401);
      } else {
        res.send(data.rows);
      }
    }
  );
});

module.exports = customerApp;
