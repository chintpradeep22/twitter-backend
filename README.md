# 🐦 Twitter Clone Backend

Twitter Clone Backend is a Node.js & Express-based backend for a simplified Twitter-like social media platform. It allows users to register, login, post tweets, fetch following and follwers, like and reply to tweets, and fetch feeds. The backend is fully secured using **JWT authentication** and supports **SQLite database** for storing users, tweets, followers, likes, and replies.

---

## 🌐 Live Demo

🔗 **Website / Static Frontend**: [Twitter Clone Frontend](https://twitterbackend.ccbp.tech/)  
🔗 **Backend API Base URL**: [https://pradeeptdm9gnjscadijbi.drops.nxtwave.tech/](https://twitter-backend-38ej.onrender.com)

---

## 🔑 Demo Login Credentials  

To test the backend APIs or frontend integration, you can use the following demo credentials:

- **Username**: `JoeBiden`  
- **Password**: `biden@123`

---

## ⚙️ Features

### 👥 User Features
- 🔐 JWT Authentication  
- 📝 User Registration & Login  
- 🐦 Create, View, and Delete Tweets  
- ❤️ Like Tweets  
- 💬 Reply to Tweets  
- 👥 Follow and Unfollow Users  
- 📰 View Feed from Users You Follow  
- 📄 View Followers and Following  

### 🔐 Authentication & Security
- 🔑 Password hashing using **bcrypt**  
- 🔒 JWT-based authentication for protected routes  
- 🧪 Secure API endpoints  

---

## 🧰 Tech Stack

| Technology       | Purpose                        |
|------------------|--------------------------------|
| **Node.js**      | Backend Runtime Environment    |
| **Express.js**   | API Framework                  |
| **SQLite**       | Database for Users, Tweets, Likes, Replies, Followers |
| **JWT**          | Authentication & Authorization |
| **bcrypt**       | Password Hashing               |
| **Node Fetch / Fetch API** | API Requests & Frontend Integration |

---

## 🛠️ API Endpoints

### Authentication
- **POST `/register/`** – Register a new user  
- **POST `/login`** – Login and get JWT token  

### Tweets & Feed
- **GET `/user/tweets/feed/`** – Fetch latest 4 tweets from users you follow  
- **GET `/user/tweets/`** – Fetch all your tweets  
- **POST `/user/tweets/`** – Create a new tweet  
- **DELETE `/tweets/:tweetId/`** – Delete a tweet  

### Followers / Following
- **GET `/user/following/`** – Get list of users you follow  
- **GET `/user/followers/`** – Get list of your followers  

### Tweet Details
- **GET `/tweets/:tweetId/`** – Get tweet details, including likes and replies count  
- **GET `/tweets/:tweetId/likes/`** – Get usernames of users who liked the tweet  
- **GET `/tweets/:tweetId/replies/`** – Get replies for a tweet  

> All protected endpoints require **Authorization Header**:  
> `Authorization: Bearer <jwtToken>`

---

## 🚀 Getting Started

### 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/chintpradeep22/twitter-backend.git
cd twitter-backend
```
2. **Install dependencies**
```bash
npm install
```
1. **Run the application**
```bash
node app.js
```

## 📁 Database

**SQLite** is used for storing:

- `user` – User details  
- `tweet` – Tweets posted by users  
- `follower` – Follower / Following relationships  
- `like` – Likes on tweets  
- `reply` – Replies to tweets  

---
