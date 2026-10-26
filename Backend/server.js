const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const roleRouter = require("./routes/roleRoutes");
const reportRouter = require("./routes/reportRoutes");
const { check } = require("./check");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/reports", reportRouter);
app.use("/api/roles", roleRouter);

app.get("/api/me", check, (req, res) => {
  res.json({ user: req.user,
  });
});

app.get("/", (req, res) => {
  res.send("Help-Desk API is Healthy");
});

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running at localhost ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("connection failed", error);
    process.exit(1);
  });
