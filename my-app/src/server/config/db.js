const mysql = require('mysql2')
const db = mysql.createConnection({
host: "localhost",
user: "root",
password: "mireini",
database:"creative"
})

module.exports = db;
