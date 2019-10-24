var connect = require("../services/mysql");

class usersController {
  static async checkUser(req, res) {
    const { userName, password } = req.body;
    console.log("username :", userName);
    console.log("password", password);
    await connect.query(
      `SELECT * FROM users WHERE user_name="${userName}" AND user_password="${password}"`,
      async function(err, rows, fields) {
        if (err) throw err;
        console.log("rows.length: ", rows.length);
        console.log("rows:", rows);
        if (rows.length == 0) {
          console.log("bad credentials ");
          res.send(rows);
        } else {
          let session = req.session;
          session.user = rows[0];
          console.log("session :", session);
          res.json(rows[0]);
          console.log("session username:", session.user.user_name);
        }
      }
    );
  }

  static async regUser(req, res) {
    const { userName, password, fname, lname } = req.body;
    console.log(userName, password, fname, lname);
    await connect.query(
      `SELECT * FROM users WHERE user_name="${userName}"`,
      async function(err, rows, fields) {
        if (err) throw err;
        console.log("!rows.length: ", rows.length);
        console.log("rows :", rows);
        if (rows.length == 0) {
          await connect.query(
            `INSERT INTO users (user_name, user_password, first_name, last_name )
                 VALUES ("${userName}","${password}","${fname}","${lname}")`,
            function(err, rows, fields) {
              if (err) throw err;
              console.log("rows :", rows);
              console.log("user registered");
              res.send(rows);
            }
          );
        } else {
          res.send([]);
        }
      }
    );
  }

  static logOut(req, res) {
    console.log("req.session", req.session);

    req.session.destroy();
    console.log("session destroyed");

    console.log("req.session", req.session);
    res.send("user logged out");
  }
}
module.exports = usersController;
