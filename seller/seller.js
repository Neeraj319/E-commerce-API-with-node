const express = require("express");
const sellerApp = express.Router();
const client = require("../models");
const { checkOwner } = require("../users/users.js");

sellerApp.use((req, res, next) => {
  console.log("seller app called");
  next();
});

sellerApp.get("/ordered_products", checkOwner, (req, res) => {
  client.query(
    "select p.id as product_id , p.name , o.id as order_id , o.delivery_date from order_product o left join product p on p.id = o.product_id  order by o.delivery_date",
    (err, data) => {
      console.log("here");
      res.setStatus = 200;
      res.send(data.rows);
    }
  );
});

sellerApp.delete("/delete_order/:id", checkOwner, (req, res) => {
  const { id } = req.params;
  client.query("DELETE FROM order_product where id = $1", [id], (err, data) => {
    if (err) {
      console.log(err.details);
      res.sendStatus(404);
    } else {
      if (data.rowCount === 0) {
        res.sendStatus(404);
      } else {
        res.sendStatus(201);
      }
    }
  });
});

module.exports = sellerApp;
