import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from "./models/User.js"
import Contact from "./models/Contacts.js";
import bcrypt from "bcryptjs"
import { createError } from "./utils/errors.js";
import cors from "cors"
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";

const app=express()

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(cors())
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB);
    console.log("Connected to mongoDB.");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected:-(");
});




// app.use("/api/auth", authRoute);
// app.use("/api/contact", contactRoute);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/main.html");
  });

app.get("/signup", (req, res) => {
    res.sendFile(__dirname + "/public/signup.html");
    // res.send(__dirname);
  });

app.post("/signup", async (req, res, next) =>{
  try {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);
  
      const newUser = new User({
        ...req.body,
        password: hash,
      });
  
      await newUser.save();
      // res.status(200).send("User Registration Successful");
      res
      .status(200)
      .send({ message: "User Registration Successful", data: newUser });
    } catch (err) {
      next(err);
    }
})

app.get("/signin", (req, res) => {
  res.sendFile(__dirname + "/public/signin.html");
  // res.send(__dirname);
});

app.post("/signin", async (req, res, next) => {
  try {
    console.log(req.body.email)
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(createError(404, "User not found!"));

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect)
      return next(createError(400, "Wrong password or username!"));
  
    // res.status(200).send("User logged in successfully");
    res.status(200).send({ message: "Success", user: req.user });
  } catch (err) {
    next(err);
  }
})

app.get("/contact", (req, res) => {
  res.sendFile(__dirname + "/public/contact.html");
  // res.send(__dirname);
});

app.post("/contact", async (req, res, next) => {
  const contactdetail = new Contact(req.body);

  try {
    const newform = await contactdetail.save();
    res.status(200).send({message:"contacted",data:newform});
  } catch (err) {
    next(err);
  }
})

app.listen(3300,()=>{
    connect()
    console.log("connected successfullys");
})