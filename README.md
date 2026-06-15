# 💬 iMessage - Real-Time WebChat

<div align="center">
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-purple?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Express-black?style=flat-square&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-green?style=flat-square&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.IO-white?style=flat-square&logo=socketdotio" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk" alt="Clerk" />
  <img src="https://img.shields.io/badge/ImageKit-orange?style=flat-square" alt="ImageKit" />
  <img src="https://img.shields.io/badge/Zustand-brown?style=flat-square" alt="Zustand" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-black?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
</div>

## 📋 Overview

iMessage is a modern real-time messaging application inspired by Apple's iMessage experience. It features instant messaging, online presence indicators, media sharing, customizable themes, wallpaper collections, and real-time communication powered by Socket.IO.

Built with React, Express, MongoDB, Clerk Authentication, and Socket.IO, the platform delivers a smooth and responsive chat experience across devices.

---

## 🚀 Key Features

### 💬 Real-Time Messaging

* ⚡ **Instant Messaging:** Real-time communication powered by Socket.IO.
* 📩 **One-to-One Chat:** Private, direct conversations.
* 🔄 **Message Replying:** Inline reply functionality to easily reference specific messages in a thread.
* ⌨️ **Typing Indicators:** Real-time visual feedback when a user is actively typing.
* 🔗 **Instant Context Sharing:** Automatic connection messages dispatched simultaneously when selecting media files to share.
* 🔄 **Live Updates:** Seamless layout and status updates without manual page refreshes.
* 📱 **Responsive UI:** Tailored interface for an optimal mobile and desktop layout.

### 🟢 User Presence

* 🟢 Online user indicators
* ⚫ Offline user status
* 👥 Real-time active user tracking
* 🔄 Automatic presence updates

### 🖼 Media Sharing

* 📸 Image and Video sharing support
* ☁️ ImageKit cloud storage integration
* 🗂 Secure media uploads
* ⚡ Fast image delivery

### 🎨 Personalization

* 🌙 Dark Mode
* ☀️ Light Mode
* 🎨 Multiple UI theme colors
* 🖼 Chat wallpaper collection
* ⚙️ Customizable chat experience

### 🔐 Authentication & Security

* 🔑 Clerk Authentication
* 👤 User management
* 🛡 Protected routes
* 🍪 Secure session handling

### 📱 Modern User Experience

* ⚡ Fast React + Vite frontend
* 🔥 Toast notifications
* 🎯 Clean and intuitive interface
* 📲 Mobile-friendly design

---

## 🛠 Tech Stack

### Frontend

* ⚛️ React 19
* ⚡ Vite
* 🎨 Tailwind CSS 4
* 🧩 HeroUI
* 🔐 Clerk React
* 🔄 Zustand
* 🌐 React Router 7
* 📡 Socket.IO Client
* 📦 Axios
* 🔔 React Hot Toast
* 🎯 Lucide React

### Backend

* 🚀 Express.js
* 🍃 MongoDB
* 🗄 Mongoose
* 🔐 Clerk Express
* 📡 Socket.IO
* ☁️ ImageKit
* 📁 Multer
* ⏰ Cron Jobs
* 🌍 CORS
* 🔒 Dotenv

---

## ✨ Features Breakdown

### 👥 User Management

* User registration & login via Clerk
* User profile synchronization
* Avatar support
* Presence management

### 💬 Chat System

* Real-time messaging
* **Inline message replies** for clear chat contexts
* **Live typing feedback** via web sockets
* Conversation sidebar
* Message history
* **Optimized image sharing** with automated placeholder/connection messages on selection
* Readable chat interface

### 🎨 Appearance Settings

* Multiple color themes
* Light mode support
* Dark mode support
* Wallpaper customization
* Personalized chat experience

### 📡 Real-Time Features

* Online status tracking
* Instant message delivery
* **Typing and reply event synchronization**
* Live conversation updates
* Socket-based communication

---

## 📁 Project Structure

```bash
imessage/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── lib/
│   │   ├── webhooks/
│   │   ├── seeds/
│   │   └── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── lib/
│   │   └── assets/
│   └── package.json
│
└── Dockerfile
```

---

## 🚀 Quick Start

### Prerequisites

* Node.js 18+
* MongoDB Atlas
* Clerk Account
* ImageKit Account
* Render Account

---

### 1️⃣ Clone Repository

```bash
git clone https://github.com/asifcuber08/iMessage-WebChat.git

cd iMessage-WebChat
```

---

### 2️⃣ Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file:

```env
PORT=3000

MONGODB_URI=your_mongodb_uri

FRONTEND_URL=http://localhost:5173
# time of deployment use your production URL

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

CLERK_SECRET_KEY=your_clerk_secret_key

CLERK_WEBHOOK_SIGNING_SECRET=your_webhook_secret

IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key

NODE_ENV=development
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend

npm install
```

Create a `.env` file:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Run frontend:

```bash
npm run dev
```

---

### 4️⃣ Seed Demo Users (Optional)

```bash
cd backend

npm run db:seed
```

This will populate MongoDB with demo users for testing conversations and UI.

---

## 🔗 Clerk Webhook Setup

To synchronize Clerk users with MongoDB:

### Create a Webhook

Navigate to:

```text
Clerk Dashboard → Webhooks → Add Endpoint
```

### Endpoint URL

Production:

```text
https://your-domain.com/api/webhooks/clerk
```

Local Development:

```text
http://localhost:3000/api/webhooks/clerk
```

### Events

Enable:

```text
user.created
user.updated
user.deleted
```

Copy the signing secret and add it to:

```env
CLERK_WEBHOOK_SIGNING_SECRET=
```

---

## 🖼 Media Uploads

Images are uploaded through ImageKit for:

* User shared images and videos
* Chat attachments
* Optimized delivery
* Secure storage

---

## 🌙 Themes & Customization

Users can personalize their chat experience with:

* Dark Theme
* Light Theme
* Multiple Accent Colors
* Wallpaper Collection
* Custom Appearance Preferences

---

## 📦 Available Commands

### Backend

```bash
npm run dev
npm run start
npm run build
npm run db:seed
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

---

## 🔐 Authentication Flow

1. User signs up through Clerk
2. Clerk webhook triggers
3. User data syncs to MongoDB
4. User gains access to protected routes
5. Real-time messaging becomes available

---

<!-- ## 🌟 Future Improvements

* Group Chats
* Message Reactions
* Voice Messages
* Video Calling
* Typing Indicators
* Push Notifications
* Message Read Receipts
* File Sharing Support

--- -->

## 📥 Contributing
Pull requests are welcome!
If you find a bug or want to add a feature, feel free to open an issue.


## 👤 Author
Made with ❤️ by [Asif Shamim](https://github.com/asifcuber08)
