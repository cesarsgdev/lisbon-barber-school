const express = require("express");
const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.send("Entry endpoint...");
});

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});
