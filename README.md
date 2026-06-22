# 💬 iMessage - WebChat

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

## 📋Overview

iMessage WebChat is a real-time one-to-one chat application inspired by the iMessage experience. It combines Clerk authentication, MongoDB persistence, Socket.IO realtime events, ImageKit media uploads, and Web Push notifications into a responsive chat app for desktop and mobile.

The app supports live messaging, replies, editing and deleting sent messages, typing indicators, online presence, read receipts, delivery ticks, mobile push notifications, media sharing, theme presets, light/dark mode, wallpapers, and mobile keyboard-friendly layouts.

## 🚀Key Features

### ⚡Real-Time Chat

- 👥One-to-one private conversations
- ⏱️Instant Socket.IO message delivery
- 💾Message history stored in MongoDB
- ↪️Inline replies with jump-to-replied-message support
- ✏️Edit your own sent messages
- 🗑️Delete your own sent messages
- ⚡Cached message loading for faster repeat opens
- 📱Mobile-friendly composer that keeps the keyboard stable while sending

### 📌Message Status

- ✖️Single tick for messages sent to the server
- ✔️Double tick for messages delivered while the receiver is online
- 🔵Colored double tick for messages read by the receiver
- 💬Message status shown inside chat bubbles
- ⏱️Last sent message status shown in the conversation sidebar
- 🔢Unread message counts in the sidebar

### 👥Typing and Presence

- 🟢Online/offline indicators
- ⏳Last seen text for offline users
- ✍️Realtime typing indicator in the active conversation
- 📊Realtime typing indicator in the sidebar
- 🔍Active user tracking through Socket.IO

### 🔔Notifications

- 📱Browser and PWA push notifications for new messages
- 🔑Web Push support with VAPID keys
- 🖼️Notification title, sender profile image, message preview, badge, and app icon
- ⚙️Service worker notification click handling
- 🗄️Push subscription storage per user

### 📸Media Sharing

- 🖼️Image upload support
- 🎥Video upload support
- ☁️ImageKit storage and optimized delivery
- 📝Media captions
- 👁️Image/video previews before sending

### 🎨Personalization

- ☀️Light and dark mode
- 🎨Theme preset picker
- ⚙️Accent color customization
- 🖼️Wallpaper picker
- 💾Persistent appearance settings
- 💻Mobile and desktop responsive layouts

### 🔐Authentication and Security

- 🔐Clerk authentication
- 🔄Clerk webhook user sync
- 🛡️Protected backend routes
- 🔑Secure session-based API access
- 👤Per-user authorization for editing and deleting messages

## 🛠️Tech Stack

### 💻 Frontend

- **Library:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4 & HeroUI
- **Authentication:** Clerk React
- **State Management:** Zustand
- **Routing:** React Router 7
- **Realtime:** Socket.IO Client
- **HTTP Client:** Axios
- **Feedback:** React Hot Toast
- **Icons:** Lucide React

### ⚙️ Backend

- **Framework:** Express.js
- **Database:** MongoDB & Mongoose ORM
- **Authentication:** Clerk Express
- **Realtime:** Socket.IO
- **Notifications:** Web Push
- **File Uploads:** ImageKit & Multer
- **Utilities:** Cron, CORS, Dotenv

## 📂Project Structure

```text
imessage/
|-- backend/
|   |-- src/
|   |   |-- controllers/
|   |   |-- lib/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- seeds/
|   |   |-- webhooks/
|   |   `-- index.js
|   `-- package.json
|-- frontend/
|   |-- public/
|   |   |-- manifest.webmanifest
|   |   |-- sw.js
|   |   `-- notification-badge.png
|   |-- src/
|   |   |-- components/
|   |   |-- context/
|   |   |-- data/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- pages/
|   |   `-- store/
|   `-- package.json
|-- Dockerfile
`-- README.md
```

## 🏁Quick Start

### 📋Prerequisites

- Node.js 18+
- MongoDB Atlas or local MongoDB
- Clerk account
- ImageKit account for media uploads
- VAPID keys for push notifications

### 1. Clone Repository

```bash
git clone https://github.com/asifcuber08/iMessage-WebChat.git
cd iMessage-WebChat
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173

CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SIGNING_SECRET=your_clerk_webhook_signing_secret

IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key

VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:you@example.com
```

Run backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

Run frontend:

```bash
npm run dev
```

### 4. Seed Demo Users

```bash
cd backend
npm run db:seed
```

This adds demo users for testing conversations and UI states.

## 📡VAPID Push Notification Setup

The app uses the Web Push API for mobile/browser notifications. Generate a VAPID key pair and place the public key in both frontend and backend env files.

You can generate keys with:

```bash
npx web-push generate-vapid-keys
```

Use the values like this:

```env
# backend/.env
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:you@example.com

# frontend/.env
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

💡Notes:

- `VAPID_SUBJECT` should be a valid `mailto:` address or URL.
- `FRONTEND_URL` should match your deployed frontend origin in production.
- Push notifications require HTTPS in production.
- Users must grant notification permission before subscriptions are saved.
- Installed PWAs may need a refresh or reinstall after icon, manifest, or service worker changes.

## 🔗Clerk Webhook Setup

Clerk webhooks keep MongoDB users synchronized with Clerk users.

Create a webhook in:

```text
Clerk Dashboard -> Webhooks -> Add Endpoint
```

🌐Production endpoint:

```text
https://your-domain.com/api/webhooks/clerk
```

💻Local endpoint:

```text
http://localhost:3000/api/webhooks/clerk
```

✅Enable these events:

```text
user.created
user.updated
user.deleted
```

Copy the webhook signing secret into:

```env
CLERK_WEBHOOK_SIGNING_SECRET=your_clerk_webhook_signing_secret
```

## 📸ImageKit Setup

ImageKit is used for chat media uploads. Add your private key to the backend:

```env
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

The app uploads media through the backend and stores the returned ImageKit URLs on each message.

## 💻Available Commands

### ⚙️Backend

```bash
npm run dev
npm run start
npm run build
npm run db:seed
```

### 💻Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## 🔐Authentication Flow

1. 👤User signs in or signs up through Clerk.
2. 🔄Clerk webhook syncs the user into MongoDB.
3. 🌐The frontend checks auth state through Clerk.
4. 🛡️The backend protects API routes with Clerk middleware.
5. 📡Socket.IO connects using the MongoDB user id.
6. 💬Realtime chat, presence, typing, receipts, and notifications become available.

## 📡Realtime Event Flow

- 📥`newMessage`: sends new messages instantly to online receivers.
- ✏️`messageEdited`: updates edited messages for both chat participants.
- 🗑️`messageDeleted`: removes deleted messages for both chat participants.
- 🔵`messagesRead`: updates read receipts and colored double ticks.
- ✍️`userTyping`: updates typing state in the chat header and sidebar.
- 🟢`getOnlineUsers`: keeps online indicators current.

## 🚀Deployment Notes

- ⚙️Set `NODE_ENV=production` for production backend deployments.
- 🌐Set `FRONTEND_URL` to the exact deployed frontend origin.
- 🔑Keep backend and frontend VAPID public keys identical.
- 🔒Configure Clerk production keys and webhook endpoint.
- 🛡️Use HTTPS for push notifications.
- 🔄Restart the backend after schema, socket, or environment changes.

## 🤝Contributing

Pull requests are welcome. If you find a bug or want to add a feature, open an issue or submit a PR.

## 👤Author

Made by [Asif Shamim](https://github.com/asifcuber08).
