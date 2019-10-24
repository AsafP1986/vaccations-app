const connect = require("../services/mysql");
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "../vacation-client/public/vacspic");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage }).any();

class vacController {
  static async getAllVac(req, res) {
    let isloggedIn = req.session.user ? true : false;
    let userName = req.session.user ? req.session.user.user_name : "no user";
    let userId = req.session.user ? req.session.user.user_id : "no user";
    let userRole = req.session.user ? req.session.user.user_role : "no user";
    var vacs = [];
    console.log("isloggedIn :", isloggedIn);
    console.log("userName :", userName);
    console.log("userId :", userId);
    console.log("userId :", userId);
    console.log("userRole :", userRole);
    if (userRole === 1) {
      await connect.query(
        `SELECT * FROM vacationsApp.vacations ORDER BY followers DESC`,
        function(err, rows, fields) {
          if (err) throw err;
          res.send(rows);
        }
      );
    } else {
      await connect.query(
        `SELECT * FROM vacationsApp.vacations`,
        async function(err, rows, fields) {
          if (err) throw err;
          vacs = rows;
          await connect.query(
            `SELECT * FROM vacationsApp.followers WHERE user_id = ${userId}`,
            function(err, rows, fields) {
              console.log("followers from user: 1", rows);
              if (err) throw err;
              if (rows.length === 0) {
                for (let i = 0; i < vacs.length; i++) {
                  vacs[i].isUserFollow = false;
                }
              } else {
                for (let i = 0; i < vacs.length; i++) {
                  for (let index = 0; index < rows.length; index++) {
                    if (rows[index].vacation_id === vacs[i].vacation_id) {
                      vacs[i].isUserFollow = true;
                      break;
                    } else {
                      vacs[i].isUserFollow = false;
                    }
                  }
                }
              }

              console.log("vacs from user:", vacs);
              var descending = vacs.sort(
                (a, b) => b.isUserFollow - a.isUserFollow
              );
              console.log("descending from user:", descending);
              res.send(descending);
            }
          );
        }
      );
    }
  }

  static async deleteVac(req, res) {
    console.log("req.params.id :", req.params.id);
    try {
      await connect.query(
        `DELETE FROM vacations WHERE vacation_id=${req.params.id}`,
        function(err, rows, fields) {
          if (err) throw err;
          console.log("vac deleted");
        }
      );
      await connect.query(
        `DELETE FROM followers WHERE vacation_id=${req.params.id}`,
        function(err, rows, fields) {
          if (err) throw err;

          console.log(" all followers deleted");
        }
      );
      await vacController.getAllVac(req, res);
    } catch (error) {
      console.log("error:", error);
    }
  }

  static async AddVac(req, res) {
    try {
      await upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
          return res.status(500).json(err);
          console.log("upload error");
        } else if (err) {
          return res.status(500).json(err);
          console.log("upload error");
        }

        let { description, destination, from_date, to_date, price } = req.body;
        let img = `/vacspic/${req.files[0].filename}`;

        connect.query(
          `INSERT INTO vacations (description , destination ,image , from_date , to_date, price) VALUES ("${description}" ,"${destination}","${img}","${from_date}","${to_date}","${price}")`,
          function(err, rows, fields) {
            if (err) throw err;
            console.log("rows :", rows);
          }
        );
        vacController.getAllVac(req, res);
      });
    } catch (error) {
      console.log("error:", error);
    }
  }

  static async updateVac(req, res) {
    try {
      await upload(req, res, function(err) {
        if (err instanceof multer.MulterError) {
          return res.status(500).json(err);
          console.log("upload error");
        } else if (err) {
          return res.status(500).json(err);
          console.log("upload error");
        }
        console.log(req.body.description);
        console.log(req.files);
        let {
          description,
          destination,
          from_date,
          to_date,
          price,
          vacation_id
        } = req.body;
        let img =
          req.files.length === 0
            ? req.body.img
            : `/vacspic/${req.files[0].filename}`;
        console.log("description :", description);
        console.log("destination :", destination);
        console.log("from_date :", from_date);
        console.log("to_date :", to_date);
        console.log("price :", price);
        console.log("img :", img);
        connect.query(
          `UPDATE vacations SET description="${description}" , destination="${destination}" ,image="${img}" , from_date="${from_date}" , to_date="${to_date}", price="${price}" WHERE vacation_id=${vacation_id}`,
          function(err, rows, fields) {
            if (err) throw err;
            console.log("rows :", rows);
          }
        );
        vacController.getAllVac(req, res);
      });
    } catch (error) {
      console.log("error:", error);
    }
  }
  static async follow(req, res) {
    const vacation_id = req.body.vacation_id;
    const user_id = req.body.user_id;

    await connect.query(
      `UPDATE vacations SET followers=followers+1  WHERE vacation_id=${vacation_id}`,
      function(err, rows, fields) {
        if (err) throw err;
        console.log("rows :", rows);
      }
    );
    await connect.query(
      `INSERT INTO followers (vacation_id , user_id) VALUES ("${vacation_id}" ,"${user_id}")`,
      function(err, rows, fields) {
        if (err) throw err;
        console.log("rows :", rows);
      }
    );
    res.send("following");
  }
  static async unfollow(req, res) {
    const vacation_id = req.body.vacation_id;
    const user_id = req.body.user_id;

    await connect.query(
      `UPDATE vacations SET followers=followers-1  WHERE vacation_id=${vacation_id}`,
      function(err, rows, fields) {
        if (err) throw err;
        console.log("rows :", rows);
      }
    );
    await connect.query(
      `DELETE FROM followers WHERE (vacation_id=${vacation_id} AND user_id=${user_id})`,
      function(err, rows, fields) {
        if (err) throw err;
        console.log("rows :", rows);
      }
    );

    res.send("unfollowing");
  }
}

module.exports = vacController;
