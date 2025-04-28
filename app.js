const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const userModel = require("./models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/logout", (req, res) => {
  res.cookie("token","")
  res.redirect("/")
});

app.post("/login", async (req, res) => {
  let { email,password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    return res.status(500).send("User Not Found");
  }
  bcrypt.compare(password, user.password, function (err, result) {
    if (!result) {
      return res.status(500).send("Password is wrong");
      
    } else {
      jwt.sign({ user:user.userName, email }, "shhhh", function (err, token) {
        res.cookie("token", token);
        res.send("YOU CAN LOGIN")
      });
     
    }
  });
});

app.post("/create", async (req, res) => {
  let { name, userName, email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (user) {
    return res.status(500).send("Email Already Registered");
  }
  bcrypt.genSalt(10, function (err, salt) {
    bcrypt.hash(password, salt, async function (err, hash) {
      await userModel.create({
        name,
        userName,
        email,
        password: hash,
      });
    });
    res.redirect("/");
  });

  jwt.sign({ userName, email }, "shhhh", function (err, token) {
    res.cookie("token", token);
  });
});

app.listen(3000);
