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

productApp.get("/search", (req, res) => {
  const { query: search_query } = req.query;
  client.query(
    `select * from product where name ilike ('%${search_query}%') or category ilike ('%${search_query}%')`,
    (err, data) => {
      if (err) {
        res.sendStatus(500);
      } else {
        res.send(data.rows);
      }
    }
  );
});

productApp.post("/upload_image/:id", checkOwner, async (req, res) => {
  const { id } = req.params;
  if (!req.files) {
    req.sendStatus(406);
  } else {
    let image = req.files.image;
    let new_name = "";
    const name = image.name.split(" ");
    for (let i of name) {
      if (i === " ") {
      } else {
        new_name += i;
      }
    }
    let uploadPath = process.cwd() + "/media/product_images/" + new_name;
    client.query(
      "select id from product where id = $1",
      [id],
      (err, data_one) => {
        if (err) {
          console.log(err);
          res.sendStatus(500);
        } else {
          if (data_one.rowCount === 0) {
            res.sendStatus(404);
          } else {
            client.query(
              "UPDATE product set product_img = $1",
              ["media/product_images/" + new_name],
              (req, data) => {
                if (err) {
                  console.log(err);
                  res.sendStatus(500);
                } else {
                  image.mv(uploadPath);
                  res.sendStatus(201);
                }
              }
            );
          }
        }
      }
    );
  }
});

module.exports = productApp;
