require("dotenv").config();
const { Client } = require("pg");
const fs = require("fs");
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.DB_NAME,
});
client.connect();

if (process.argv[2] === "create_tables") {
    console.log('creating tables');
    fs.readFile("./db.sql", "utf8", (err, data) => {
        data = data.split(";");
        data.forEach((query) => {

            client.query(query, (err, res) => {
                if (err) {
                    console.log(err);
                }
            }
            );
        }
        );
        client.end();
    })
}



module.exports = client;
