const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const memberRoutes = require("./routes/memberRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student-team-members-app";

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// This makes uploaded images accessible in the browser.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Team member API routes.
app.use("/api/members", memberRoutes);

app.get("/", (req, res) => {
  res.send("Student Team Members API is running.");
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
