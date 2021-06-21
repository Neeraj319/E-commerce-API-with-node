const express = require("express");
const productApp = express.Router();
const client = require("../models");
const { checkOwner } = require("../users/users.js");
productApp.use((req, res, next) => {
  console.log("products app called");
  next();
});
productApp.get("/", (req, res) => {
  client.query("SELECT * FROM PRODUCT", (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result.rows);
    }
  });
});

productApp.post("/add_product", checkOwner, (req, res) => {
  /*
    {
      "name" : "product name",
      "price" : "product price int or float",
      "des" : "product description",
      "category" : "product category"
    }
  */
  const { name, price, des, category } = req.body;
  console.log(name, price, des);
  client.query(
    `INSERT INTO PRODUCT (name , des , price , category) VALUES ($1 , $2 , $3 , $4)`,
    [name, des, price, category],
    (err, response) => {
      if (err) {
        res.statusCode = 500;
        res.send({ message: err.detail });
      } else {
        console.log(response.rows);
        res.statusCode = 201;
        res.send(req.body);
      }
    }
  );
});

productApp.get("/product/:id", (req, res) => {
  const { id } = req.params;
  client.query(`SELECT * FROM PRODUCT WHERE id = $1`, [id], (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.send("product not found");
    } else {
      res.statusCode = 200;
      res.send(data.rows);
    }
  });
});

productApp.delete("/delete_product/:id", checkOwner, (req, res) => {
  const { id } = req.params;
  client.query("DELETE FROM product where id = $1", [id], (err, data) => {
    if (err) {
      res.setStatus = 404;
      res.send({
        message: err.detail,
      });
    } else {
      res.sendStatus = 200;
      res.send("product deleted successfully");
    }
  });
});

productApp.patch("/update_product/:id", checkOwner, (req, res) => {
  const { id } = req.params;
  const columns = ["name", "des", "price"];
  for (let i in req.body) {
    client.query(
      `UPDATE product set ${i} = $1 where id = $2`,
      [req.body[i], id],
      (err, data) => {
        if (err) {
          res.setStatus = 404;
        } else {
          res.send({
            message: "changes made successfully",
          });
        }
      }
    );
  }
});

module.exports = productApp;
