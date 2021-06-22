const express = require("express");
const userApp = express.Router();
const bcrypt = require("bcrypt");
const client = require("../models");
const jwt = require("jsonwebtoken");

userApp.post("/signup", async (req, res) => {
  /*
    {
      "username" : "username of user",
      "first_name" : "first_name of user",
      "last_name" : "last_name pof user",
      "email" : "email of user",
      "password" : "password of user"
    }
  */
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);
  const { username, password, address, first_name, last_name, email } =
    req.body;
  client.query(
    `INSERT INTO person (username , password , first_name ,last_name , email , joined_on) VALUES ($1 , $2 , $3 , $4 , $5 , now()::timestamp) RETURNING p_id`,
    [username, password, first_name, last_name, email],
    (err, data) => {
      if (err) {
        console.log(err.detail);
        res.statusCode = 409;
        res.send({ message: err.detail });
      } else {
        const { p_id } = data.rows[0];
        console.log(p_id);
        client.query(
          "INSERT INTO customer (address , person_id) VALUES ($1 , $2)",
          [address, p_id],
          (err, data) => {
            if (err) {
              res.sta = 406;
              res.send({ message: err.detail });
            } else {
              res.sta = 201;
              res.send({
                message: "customer user created successfully",
              });
            }
          }
        );
      }
    }
  );
});

async function verifyPassword(hashPassword, plainPassword) {
  const validPassword = await bcrypt.compare(plainPassword, hashPassword);
  if (validPassword) {
    return validPassword;
  } else {
    return null;
  }
}

function getUser(username, password) {
  return new Promise((resolve, reject) => {
    client.query(
      `SELECT username , password from person where username = $1`,
      [username],
      (err, data) => {
        if (err) {
          reject(null);
        } else {
          const { password: hashPassword } = data.rows[0];
          const verify = verifyPassword(hashPassword, password);
          if (verify) {
            resolve(verify);
          } else {
            reject("password did not matched");
          }
        }
      }
    );
  });
}

function createAccessToken(username, password) {
  return new Promise((resolve, reject) => {
    getUser(username, password).then((data) => {
      client.query(
        `select c.c_id , p.p_id , p.username , p.email, s.s_id from person p left join customer c on p.p_id = c.person_id left join seller s on s.person_id = p.p_id where p.username = $1 ;`,
        [username],
        (err, res) => {
          if (err) {
            reject("something went wrong");
          } else {
            const token = jwt.sign(
              {
                details: res.rows[0],
              },
              process.env.SECRET_KEY
            );
            resolve({ token: token });
          }
        }
      );
    });
  });
}
userApp.post("/login", (req, res) => {
  const { username, password } = req.body;
  createAccessToken(username, password)
    .then((data) => {
      res.statusCode = 201;
      res.send(data);
    })
    .catch((err) => {
      res.status = 406;
      res.send({
        message: "username or password invalid",
      });
    });
});

function get_current_user(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET_KEY, (err, userData) => {
      if (err) {
        reject(null);
      } else {
        resolve(userData);
      }
    });
  });
}

function checkOwner(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) {
    console.log("token is null");
    res.sendStatus(401);
  } else {
    get_current_user(token)
      .then((data) => {
        if (data.details.c_id !== null) {
          res.sendStatus(401);
        } else {
          next();
        }
      })
      .catch((err) => {
        res.sendStatus(401);
      });
  }
}

function checkLoggedIn(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) {
    console.log("token is null");
    res.sendStatus(401);
  } else {
    // res.sendStatus(200);
    get_current_user(token)
      .then((data) => {
        res.user_id = data.details.c_id;
        res.user_email = data.details.email;
        next();
      })
      .catch((err) => {
        res.sendStatus(401);
      });
  }
}

userApp.post("/signup/seller", async (req, res) => {
  const salt = await bcrypt.genSalt(10);
  req.body.password = await bcrypt.hash(req.body.password, salt);
  const { username, password, first_name, last_name, email } = req.body;
  client.query(
    `INSERT INTO person (username , password , first_name ,last_name , email , joined_on) VALUES ($1 , $2 , $3 , $4 , $5 , now()::timestamp) RETURNING p_id`,
    [username, password, first_name, last_name, email],
    (err, data) => {
      if (err) {
        console.log(err.detail);
        res.statusCode = 409;
        res.send({ message: err.detail });
      } else {
        const { p_id } = data.rows[0];
        console.log(p_id);
        client.query(
          "INSERT INTO seller (person_id) VALUES ($1)",
          [p_id],
          (err, data) => {
            if (err) {
              res.sta = 406;
              res.send({ message: err.detail });
            } else {
              res.sta = 201;
              res.send({
                message: "seller user created successfully",
              });
            }
          }
        );
      }
    }
  );
});

module.exports = {
  userApp: userApp,
  checkOwner: checkOwner,
  checkLoggedIn: checkLoggedIn,
};
