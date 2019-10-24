var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Root1234",
  database: "vacationsApp"
});

module.exports = connection;
