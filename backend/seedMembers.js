const mongoose = require("mongoose");
const Member = require("./models/Member");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student-team-members-app";

// These sample members use local SVG files from the uploads folder.
const sampleMembers = [
  {
    name: "Aisha Khan",
    role: "Team Leader",
    email: "aisha.khan@example.com",
    image: "member-aisha.svg",
  },
  {
    name: "Rohan Patel",
    role: "Frontend Developer",
    email: "rohan.patel@example.com",
    image: "member-rohan.svg",
  },
  {
    name: "Priya Sharma",
    role: "Backend Developer",
    email: "priya.sharma@example.com",
    image: "member-priya.svg",
  },
  {
    name: "Daniel Lee",
    role: "UI Designer",
    email: "daniel.lee@example.com",
    image: "member-daniel.svg",
  },
  {
    name: "Sara Ali",
    role: "Database Manager",
    email: "sara.ali@example.com",
    image: "member-sara.svg",
  },
  {
    name: "Karan Mehta",
    role: "QA Tester",
    email: "karan.mehta@example.com",
    image: "member-karan.svg",
  },
  {
    name: "Neha Verma",
    role: "Content Writer",
    email: "neha.verma@example.com",
    image: "member-neha.svg",
  },
  {
    name: "Omar Hassan",
    role: "Project Presenter",
    email: "omar.hassan@example.com",
    image: "member-omar.svg",
  },
];

async function seedMembers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected for seeding");

    let addedCount = 0;

    for (const member of sampleMembers) {
      const existingMember = await Member.findOne({ email: member.email });

      if (existingMember) {
        console.log(`Skipped existing member: ${member.name}`);
        continue;
      }

      await Member.create(member);
      addedCount += 1;
      console.log(`Added member: ${member.name}`);
    }

    console.log(`Seeding complete. Added ${addedCount} new members.`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

seedMembers();
