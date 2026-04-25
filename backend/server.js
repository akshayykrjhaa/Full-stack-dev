const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const memberRoutes = require("./routes/memberRoutes");
const Member = require("./models/Member");

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

app.get("/", async (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;

  try {
    const sampleMember = await Member.findOne().sort({ createdAt: -1 });
    const sampleId = sampleMember ? sampleMember._id : "replace-with-member-id";

    res.send(`
      <html>
        <head>
          <title>Student Team Members API</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 0 20px;
              line-height: 1.6;
            }
            h1, h2 {
              color: #17324d;
            }
            a {
              color: #1f6fb2;
            }
            code {
              background: #f4f7fb;
              padding: 2px 6px;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <h1>Student Team Members API</h1>
          <p>These API endpoints facilitate data exchange between the frontend and backend.</p>
          <p>You can test the GET endpoints directly in the browser.</p>

          <h2>API Calls in Browser</h2>
          <ul>
            <li>
              <a href="${baseUrl}/api/members">${baseUrl}/api/members</a>
              <br />
              Retrieves all team members
            </li>
            <li>
              <a href="${baseUrl}/api/members/${sampleId}">${baseUrl}/api/members/${sampleId}</a>
              <br />
              Fetch details of a single member using their ID
              <br />
              Replace the ID with the actual member ID if needed
            </li>
          </ul>
        </body>
      </html>
    `);
  } catch (error) {
    res.send(`
      <html>
        <head>
          <title>Student Team Members API</title>
        </head>
        <body>
          <h1>Student Team Members API is running.</h1>
          <p>Open <a href="${baseUrl}/api/members">${baseUrl}/api/members</a> to test the members API.</p>
        </body>
      </html>
    `);
  }
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
