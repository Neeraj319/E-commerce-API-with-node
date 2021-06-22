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
    "select p.id as product_id , p.name , o.id as order_id , o.delivery_date from order_product o left join product p on p.id = o.product_id where o.product_delivered = false  order by o.delivery_date",
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

sellerApp.patch("/update_order_status/:id", checkOwner, (req, res) => {
  /*
  send values which you want to change once at a time
  {
    product_packed : bool,
    product_shipped : bool,
    product_delivered : bool
  }
  */
  const { id } = req.params;
  for (let i in req.body) {
    client.query(
      `UPDATE order_product set ${i} = $1 where id = $2`,
      [req.body[i], id],
      (err, data) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          if (data.rowCount === 0) {
            res.sendStatus(404);
          } else {
            console.log(i);
            res.send({
              data: req.body,
            });
          }
        }
      }
    );
  }
});

sellerApp.get("/order_info/:id", checkOwner, (req, res) => {
  const { id } = req.params;
  client.query(
    "select o.id as order_id , p.id as product_id ,o.customer_id ,p.name , p.des , o.delivery_date , o.product_packed , o.product_shipped , o.product_delivered from order_product o left join product p on p.id = o.product_id where o.id = $1",
    [id],
    (err, data) => {
      if (err) {
        console.log(err);
        res.setStatus(500);
      } else {
        if (data.rowCount === 0) {
          res.sendStatus(404);
        } else {
          res.send(data.rows[0]);
        }
      }
    }
  );
});

module.exports = sellerApp;
