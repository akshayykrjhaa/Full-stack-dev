# Student Team Members Management Application

A simple and beginner-friendly MERN stack project for managing student team members.

This project lets you:
- add a new team member
- upload a member photo
- view all members
- open full member details
- seed MongoDB with sample members and placeholder photos

## Tech Stack

- Frontend: React, React Router, Axios, Vite
- Backend: Node.js, Express
- Database: MongoDB, Mongoose
- File Upload: Multer

## Project Structure

```text
backend/
  models/
    Member.js
  routes/
    memberRoutes.js
  uploads/
  seedMembers.js
  server.js

frontend/
  src/
    components/
      MemberCard.jsx
    pages/
      HomePage.jsx
      AddMemberPage.jsx
      ViewMembersPage.jsx
      MemberDetailsPage.jsx
    App.js
    AppView.jsx
    config.js
    index.css
    main.jsx
```

## Features

### Frontend

- Home page with navigation buttons
- Add Member page with form validation
- View Members page with image, name, and role
- Member Details page with full member information
- Simple CSS styling with centered layout

### Backend

- `POST /api/members` to add a member with image upload
- `GET /api/members` to fetch all members
- `GET /api/members/:id` to fetch one member
- Static image serving from the `uploads` folder

## Database Model

Each member has:

- `name`
- `role`
- `email`
- `image`

## How To Run

### 1. Start MongoDB

Make sure MongoDB is running locally.

Default database used:

```text
mongodb://127.0.0.1:27017/student-team-members-app
```

### 2. Run the backend

Open a terminal in `backend/` and run:

```bash
npm install
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### 3. Run the frontend

Open another terminal in `frontend/` and run:

```bash
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Sample Data

This project includes a seed script to add random sample members with local placeholder SVG profile photos.

Run this inside `backend/`:

```bash
npm run seed
```

The seed script:

- adds multiple sample members
- skips duplicates using email
- uses placeholder images stored in `backend/uploads`

## API Routes

### Get all members

```text
GET /api/members
```

### Get one member by ID

```text
GET /api/members/:id
```

Replace `:id` with the actual MongoDB member ID.

### Add a new member

```text
POST /api/members
```

Form fields:

- `name`
- `role`
- `email`
- `image`

## Notes

- Uploaded images are saved in `backend/uploads`
- Placeholder sample photos are also stored in `backend/uploads`
- The frontend API base URL is set in `frontend/src/config.js`

## Example Pages

- `/` for Home
- `/add-member` for Add Member
- `/members` for View Members
- `/members/:id` for Member Details
