const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log(`Mongo DB Connection Success: ${conn.connection.host}`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

module.exports = connectDB;
