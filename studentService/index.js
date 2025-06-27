const express = require ("express");
const dotEnv = require("dotenv");
const connectDB = require("./config/db");
const studentRoutes = require("./routes/studentRoute");

const {correlationIdMiddleware } = require("../correlationId");
const rateLimit = require("express-rate-limit")
//to read env files 
dotEnv. config();
//Initiliaze express app
const app = express();
// connect to db
connectDB();
// middleware

const limiter = rateLimit({
  windowMs : 60*1000,
  max: 5,
  message: "Too many requests",
  headers: true,
});

app.use (express. json ());

app.use(correlationIdMiddleware);

//routes
app.use('/api/students' ,limiter, studentRoutes)

const PORT = process.env.PORT || 5003;

app. listen (PORT,() => {
    console. log (`Student Service is running on port ${PORT}`);
});
