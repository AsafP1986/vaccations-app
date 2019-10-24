var createError = require("http-errors");
var express = require("express");
var http = require("http");
var socketIo = require("socket.io");
var cors = require("cors");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var bcrypt = require("bcrypt");
var appRouter = require("./routes/appRoutes");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
// app.set("trust proxy", 1); // trust first proxy

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: "keyboard dogy",
    resave: true,
    saveUninitialized: true
  })
);

app.use(express.static(path.join(__dirname, "public")));
app.use(cors({ credentials: true, origin: true }));

// Routes
app.use("/", appRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const server = http.createServer(app);
const io = socketIo(server);

module.exports = app;
