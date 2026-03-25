# Oasis | Premium Gold Chat Application

Oasis is a production-ready, feature-rich chat web application built with a premium gold-themed aesthetic. It supports real-time messaging, secure authentication, and high-fidelity WebRTC voice/video calling.

## 🌟 Key Features

- **🏆 Premium Design**: Custom gold-themed UI using Tailwind CSS v4 and Framer Motion.
- **💬 Real-time Messaging**: Instant one-on-one direct messages powered by Socket.io.
- **📞 WebRTC Calling**: Peer-to-peer voice and video calls with a custom signaling server.
- **🔒 Secure Authentication**: JWT-based login and registration with password hashing.
- **📦 State Management**: Redux Toolkit with persistence for a seamless user experience.
- **📱 Responsive Layout**: Fully optimized for mobile, tablet, and desktop.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd oasis
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with:
   ```env
   MONGODB_URI=mongodb://localhost:27017/oasis
   JWT_SECRET=your_super_secret_gold_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to experience the Oasis.

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, Redux Toolkit, Tailwind CSS, Framer Motion.
- **Backend**: Next.js API Routes, Socket.io, Mongoose.
- **Real-time**: Socket.io, WebRTC (simple-peer).
- **Database**: MongoDB.

---
*Precision. Luxury. Communication.*
