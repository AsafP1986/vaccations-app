const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const adminAuth = require("../middleware/adminAuth");
const vacController = require("../controllers/vacationsController");
const usersController = require("../controllers/usersController");

// Vacation actions routes

// get vacations
router.get("/vacations", auth, vacController.getAllVac);
// create vacation - private
router.post("/vacations", adminAuth, vacController.AddVac);
// delete vacation - private
router.delete("/vacations/:id", adminAuth, vacController.deleteVac);
// update vacation - private
router.put("/vacations/:id", adminAuth, vacController.updateVac);
// follow vacation
router.post("/vacations/follow", auth, vacController.follow);
// unfollow vacation
router.post("/vacations/unfollow", auth, vacController.unfollow);

// User actions routes
router.get("/", (req, res) => {
  res.send("please login");
});
router.post("/login", usersController.checkUser);

router.post("/register", usersController.regUser);

router.get("/logout", usersController.logOut);

module.exports = router;
