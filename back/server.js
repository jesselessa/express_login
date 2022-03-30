const express = require("express");
const cors = require("cors");
const port = 8000;
const mongoose = require("mongoose"); //MongoDB
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const dotenv = require("dotenv");
const User = require("./models/userModel"); // Models
dotenv.config({
  path: "./config.env",
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
// app.use(cors(corsOptions));

// CONNECTING TO MONGODB
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.5sekn.mongodb.net/konexio?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"));

// ----------ROUTES --------------//

//------------------- SignUp ------------//
app.post("/signup", async (req, res) => {
  //Check password's length:
  if (req.body.password.length < 8) {
    return res
      .status(400)
      .json({ error: "Invalid password format : too short." });
  }
  //Check if the email already exists :
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "This email already exists." });
    }
  } catch (error) {
    return res.status(400).json({ message: "An error happened." });
  }

  //Pasword hash :
  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  console.log("hashed password: ", hashedPassword);

  //Create new user :

  try {
    await User.create({
      email: req.body.email,
      password: hashedPassword,
      firstname: req.body.firstname,
      surname: req.body.surname,
      birthdate: req.body.birthdate,
    });
  } catch (error) {
    return res.status(401).json({
      message: "Invalid data.",
    });
  }

  // console.log("user : ",user);
  return res.status(201).json({
    message: `Account successfully created, welcome ${req.body.surname} ! `,
  });
});

//------------ Login ---------------//
app.post("/login", async (req, res) => {
  let user;
  const { email, password } = req.body;

  try {
    //Check email
    user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ error: "Invalid email or password" });
    }

    //Comparing the login's password with the one registered in the user's document:
    const isPasswordValid = await bcrypt.compare(password, user.password);

    //If the password is incorrect, an error message is displayed
    if (!isPasswordValid) {
      return res.status(400).json({
        error: "Invalid email or password",
      });
    }

    //Generating a token :
    const token = jwt.sign({ id: user._id }, process.env.DB_SECRET);

    //Adding the token to a cookie :
    res.cookie("jwt", token, { httpOnly: true, secure: false });

    //Sending the cookie to the user:
    res.json({ success: "Cookie sent !" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "A problem happened.",
    });
  }
});

//ADMIN ROUTE --------------------------
app.get("/admin", async (req, res) => {
  let users, data;

  //Checking the token that is in the cookie :
  try {
    data = jwt.verify(req.cookies.jwt, process.env.DB_SECRET);
  } catch (error) {
    return res.status(401).json({
      error: "Invalid token.",
    });
  }

  try {
    users = await User.find();
  } catch (error) {
    return res.status(400).json({
      message: "A problem happened.",
    });
  }

  return res.json({ users });
});

//---------- 404 NOT FOUND ROUTES ------------------

app.get("*", (req, res) => {
  res.status(404).json({ error: "404 NOT FOUND." });
});

app.post("*", (req, res) => {
  res.status(404).json({ error: "404 NOT FOUND." });
});

// Start server
app.listen(port, () => {
  console.log("Listening");
});
