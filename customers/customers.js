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
    "select p.name , p.des , p.id as product_id , p.price, p.category , c.id as product_cart_id from product p left join cart c on p.id = c.product_id left join customer cr on c.customer_id =  cr.c_id where cr.c_id = $1",
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

customerApp.delete("/delete_cart/:id", checkLoggedIn, (req, res) => {
  const customer_id = res.user_id;
  const { id } = req.params;
  client.query(
    "SELECT customer_id from cart where customer_id = $1",
    [customer_id],
    (err, data) => {
      if (err) {
        res.setStatus(401);
      } else {
        if (data.rowCount == 0) {
          res.sendStatus(404);
        } else {
          if (data.rows[0].customer_id === customer_id) {
            client.query(
              "DELETE FROM cart where id = $1",
              [id],
              (err, data) => {
                if (err) {
                  res.sendStatus(401);
                } else {
                  res.sendStatus(202);
                }
              }
            );
          }
        }
      }
    }
  );
});

customerApp.post("/order_product/:id", checkLoggedIn, (req, res) => {
  const { id } = req.params;
  const customer_id = res.user_id;
  client.query(
    `insert into order_product (customer_id , product_id , delivery_date) values ($1 , $2 , now()::DATE + INTERVAL '4 days')`,
    [customer_id, id],
    (err, data) => {
      if (err) {
        res.setStatus = 404;
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
