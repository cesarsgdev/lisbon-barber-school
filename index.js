const express = require("express");
const app = express();
const certificates = require("./routes/certificates");

require("dotenv").config();

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/certificates", certificates);

app.get("/", (req, res) => {
  res.send("Entry endpoint...");
});

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});
