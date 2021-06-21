const { Client } = require("pg");

const client = new Client({
  host: "localhost",
  port: 5432,
  user: process.env.user_name,
  password: process.env.password,
  database: "test",
});
client.connect();

module.exports = client;
