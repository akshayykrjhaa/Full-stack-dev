# Student Team Members Management Application

## Project Description

This is a simple MERN stack application for managing student team members.

The app allows users to:
- add a new team member
- upload a member photo
- view all team members
- view full details of one member
- edit member information and update member photos

Frontend is built with React, React Router, and Axios.

Backend is built with Node.js, Express, MongoDB, and Mongoose.

## Installation Steps

### 1. Clone or open the project

Open the project folder in your code editor or terminal.

### 2. Install backend dependencies

Go to the backend folder:

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

Go to the frontend folder:

```bash
cd frontend
npm install
```

### 4. Make sure MongoDB is running

Start MongoDB on your system before running the backend.

Default MongoDB connection used in this project:

```text
mongodb://127.0.0.1:27017/student-team-members-app
```

## API Endpoints

### 1. Add a new member

```text
POST /api/members
```

Fields:
- `name`
- `role`
- `email`
- `image`

### 2. Get all members

```text
GET /api/members
```

Returns all team members.

### 3. Get member by ID

```text
GET /api/members/:id
```

Returns details of one member.

Replace `:id` with the actual MongoDB member ID.

### 4. Update member by ID

```text
PUT /api/members/:id
```

Updates member information.

Fields:
- `name`
- `role`
- `email`
- `image` (optional while editing)

## How To Run The App

### Run backend

Open a terminal in the `backend` folder and run:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### Run frontend

Open another terminal in the `frontend` folder and run:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Browser Test URLs

You can test these GET APIs in the browser:

```text
http://localhost:5000/api/members
http://localhost:5000/api/members/:id
```

## Optional Sample Data

To add sample members with placeholder photos, run this in the `backend` folder:

```bash
npm run seed
```
