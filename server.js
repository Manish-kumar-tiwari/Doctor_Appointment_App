const express = require("express");
const color = require("colors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const connectDB = require("./config/db");

//dotenv config
dotenv.config();

//database connect

connectDB();

//rest object
const app = express();

//middleware
app.use(express.json());
app.use(morgan("dev"));


//routes
app.use("/api/v1/user/",require("./routes/userRoutes"))


//port
const port = process.env.PORT || 8080;

// listen port

app.listen(port, () => {
  console.log(
    `Server is running at the port ${port} in ${process.env.DEV_MODE} mode`
      .bgCyan.white
  );
});
