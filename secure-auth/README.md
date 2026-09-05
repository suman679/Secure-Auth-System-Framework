# 🔐 SecureAuth — Secure Authentication System

> A full-stack authentication system with **Registration**, **Login**, **OTP/MFA**, and a **protected Dashboard**.  
> Built with Node.js, Express, MongoDB, bcrypt, JWT, and Nodemailer.

---

## 📁 Project Structure

```
secure-auth/
├── frontend/
│   ├── index.html          ← Login & Register page
│   ├── dashboard.html      ← Protected dashboard
│   ├── css/
│   │   └── style.css       ← Dark theme styles
│   └── js/
│       ├── auth.js         ← Login/Register/OTP logic
│       └── dashboard.js    ← Dashboard + logout logic
│
└── backend/
    ├── server.js           ← Main Express server
    ├── package.json        ← Dependencies
    ├── .env.example        ← Environment variable template
    ├── models/
    │   └── User.js         ← MongoDB user schema
    ├── routes/
    │   └── auth.js         ← All API routes
    └── middleware/
        └── auth.js         ← JWT verification middleware
```

---

## ⚙️ Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | HTML, CSS, JavaScript   |
| Backend    | Node.js + Express       |
| Database   | MongoDB + Mongoose      |
| Security   | bcrypt + JWT            |
| Email/OTP  | Nodemailer + Gmail      |

---

## 🚀 Installation & Setup

### Step 1: Prerequisites

Make sure you have installed:
- **Node.js** → https://nodejs.org (v18 or higher)
- **MongoDB** → Either:
  - Local: https://www.mongodb.com/try/download/community
  - Cloud (free): https://www.mongodb.com/atlas

---

### Step 2: Clone / Download the project

```bash
# If using git
git clone <your-repo-url>
cd secure-auth

# Or just extract the ZIP and open the folder
```

---

### Step 3: Install backend dependencies

```bash
cd backend
npm install
```

This installs: `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `nodemailer`, `dotenv`, `cors`

---

### Step 4: Configure environment variables

```bash
# In the backend/ folder, create a .env file
cp .env.example .env
```

Now open `.env` and fill in your values:

```env
MONGO_URI=mongodb://localhost:27017/secureauth
JWT_SECRET=any_long_random_string_here_abc123xyz
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
PORT=5000
```

#### 📧 How to get Gmail App Password (for OTP emails):
1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** (if not already)
3. Go to **Security** → **App passwords**
4. Create a new App Password for "Mail"
5. Copy the 16-character password → paste as `EMAIL_PASS`

> ⚠️ Use the App Password, NOT your regular Gmail password!

---

### Step 5: Start MongoDB (if using local)

```bash
# On Windows (if MongoDB is installed)
mongod

# On Mac (using Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

If using **MongoDB Atlas** (cloud), just paste the connection string in `MONGO_URI`.

---

### Step 6: Run the server

```bash
# Inside the backend/ folder
npm start

# Or for auto-restart during development:
npm run dev
```

You should see:
```
✅ Connected to MongoDB successfully!
🚀 Server running at http://localhost:5000
📁 Frontend: http://localhost:5000
🔗 API Base: http://localhost:5000/api/auth
```

---

### Step 7: Open the app

Open your browser and go to:
```
http://localhost:5000
```

---

## 🔑 How It Works (Flow)

```
1. REGISTER
   User fills email + password → bcrypt hashes password → saved to MongoDB

2. LOGIN (Step 1)
   User enters email + password → compared with DB hash → if correct, 6-digit OTP generated

3. OTP via EMAIL (Step 2)
   OTP emailed via Nodemailer → expires in 5 minutes → user enters OTP

4. VERIFY OTP (Step 3)
   OTP matched + not expired → JWT token created → stored in browser localStorage

5. DASHBOARD
   JWT sent in request header → middleware verifies it → user data shown

6. LOGOUT
   Token removed from localStorage → redirected to login
```

---

## 🛡️ Security Features

- ✅ Passwords hashed with **bcrypt** (salt rounds: 10)
- ✅ **JWT** tokens for stateless authentication (expires in 1 hour)
- ✅ **OTP expires in 5 minutes** (stored in DB, cleared after use)
- ✅ Sensitive config stored in **`.env`** (never commit this!)
- ✅ Dashboard **protected by middleware**
- ✅ Specific error messages: "User not registered" / "Wrong password"

---

## 📡 API Endpoints

| Method | Endpoint                   | Description              |
|--------|----------------------------|--------------------------|
| POST   | `/api/auth/register`       | Register new user        |
| POST   | `/api/auth/login`          | Validate credentials + send OTP |
| POST   | `/api/auth/verify-otp`     | Verify OTP → get JWT     |
| GET    | `/api/auth/dashboard`      | Protected user info      |

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| `MongoDB connection failed` | Make sure MongoDB is running or Atlas URI is correct |
| `Email not sent` | Check Gmail App Password in `.env` |
| `Cannot connect to server` | Make sure you ran `npm start` inside `/backend` |
| OTP not received | Check spam folder; verify EMAIL_USER and EMAIL_PASS |

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.3",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "nodemailer": "^6.9.7",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5"
}
```

---

## 🎓 Perfect for College Presentation

This project demonstrates:
- **Full Stack Development** (Frontend + Backend + Database)
- **Security Best Practices** (bcrypt, JWT, MFA)
- **REST API Design**
- **Middleware Pattern** in Express
- **Email Integration**
- **Environment Variables** usage

---

*Made with ❤️ for college project submission*
