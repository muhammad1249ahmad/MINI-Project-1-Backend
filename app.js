const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const userModel = require("./models/user");
const postModel = require("./models/post");
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
  res.cookie("token", "");
  res.redirect("/login");
});

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    return res.status(500).send("User Not Found");
  }
  bcrypt.compare(password, user.password, function (err, result) {
    if (!result) {
      return res.status(500).send("Password is wrong");
    } else {
      jwt.sign(
        { name: user.name, email: user.email, _id: user._id },
        "shhhh",
        function (err, token) {
          res.cookie("token", token);
          res.redirect("/profile");
        }
      );
    }
  });
});

app.post("/create", async (req, res) => {
  let { name, userName, email, password, _id } = req.body;
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

  jwt.sign({ name, email, _id }, "shhhh", function (err, token) {
    res.cookie("token", token);
  });
});

function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") {
    res.redirect("/login");
  }
  let user = jwt.verify(req.cookies.token, "shhhh");
  req.user = user;
  next();
}
app.get("/profile", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  await user.populate("posts");

  res.render("profile", { user });
});

app.post("/createPost", isLoggedIn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email });
  let { content } = req.body;
  let post = await postModel.create({
    user: user._id,
    content,
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

app.get("/like/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id });
  let indexOfPost=post.likes.indexOf(req.user._id)
  if (indexOfPost === -1) {
    post.likes.push(req.user._id);
  }
  else
  {
    post.likes.splice(indexOfPost)
  }
  await post.save();
  res.redirect("/profile");
});


app.get("/edit/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id });
  res.render('edit',{post})
  
});

app.post("/update/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findOneAndUpdate({ _id: req.params.id },{content:req.body.content});
   res.redirect("/profile")
});



app.listen(3000);
