const mongoose = require("mongoose");
const colors = require("colors");
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`DataBase connect SuccessFully`.bgGreen.white);
  } catch (error) {
    console.log(`Mongodb server issiue ${error}`);
  }
};

module.exports = connectDB;
