# webapp Application

This is a video calling application built using the React , Node.js  with socket.io for real-time communication.

## Features

- Real-time video calling
- Peer-to-peer connection using WebRTC
- Responsive design

## Technologies Used

- React.js
- Node.js
- Socket.io
- WebRTC
- Tailwind

## Prerequisites

Make sure you have the following installed:

- Node.js
- npm (Node Package Manager)

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Dhanashree-narkhede/webapp.git
   cd video-calling-app
   ```

2. **Install server dependencies:**
   ```sh
   cd backend
   npm install
   ```

3. **Install client dependencies:**
   ```sh
   cd frontend
   npm install
   ```

4. **Start the development servers:**

   **Server:**
 
   cd backend
   npm run dev
 

   **Client:**

   cd frontend
   npm start




## Folder Structure

```
webapp/
├── frontend/               # Frontend code (React)
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── context/
│       ├── screens/
│       ├── services/
│       ├── App.js
│       └── index.js
│
├── backend/               # Backend code (Node, Socket)
│   └── index.js
│
└── README.md             # This file
```

