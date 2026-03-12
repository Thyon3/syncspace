import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import db from './config/db.js'
import cors from 'cors';
import { ENV } from './util/env.js';
import cookieParser from 'cookie-parser';
import { initializeSocket } from './config/socket.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
initializeSocket(httpServer);

app.set("trust proxy", true);

//

app.use(cors({
  origin: 'http://localhost:5173', // frontend URL
  credentials: true // allow cookies
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Needed for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Import API routes
import authrouter from "./routers/auth.route.js";
import messageRouter from './routers/message.route.js';
import userRouter from './routers/user.route.js';
import chatRouter from './routers/chat.route.js';
import reactionRouter from './routers/reaction.route.js';
import pinRouter from './routers/pin.route.js';
import blockRouter from './routers/block.route.js';
import privacyRouter from './routers/privacy.route.js';
import securityRouter from './routers/security.route.js';
import notificationRouter from './routers/notification.route.js';
import callRouter from './routers/call.route.js';
import mediaRouter from './routers/media.route.js';
import userStatusRouter from './routers/userStatus.route.js';
import scheduledMessageRouter from './routers/scheduledMessage.route.js';

// Port
const port = ENV.PORT || 3000;

// Middleware
app.use(express.json());
app.use("/api/auth", authrouter);
app.use("/api/messages", messageRouter);
app.use("/api/user", userRouter);
app.use("/api/chats", chatRouter);
app.use("/api/reactions", reactionRouter);
app.use("/api/pins", pinRouter);
app.use("/api/users", blockRouter);
app.use("/api/privacy", privacyRouter);
app.use("/api/security", securityRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/calls", callRouter);
app.use("/api/media", mediaRouter);
app.use("/api/status", userStatusRouter);
app.use("/api/scheduled", scheduledMessageRouter);

// Example route
app.get("/fuck", (req, res) => {
  res.send("oh this is fucked up");
});

// -------------------------------
// Serve React frontend in production
// -------------------------------
if (ENV.NODE_ENV === "production") {
  // Path to frontend build inside Docker image
  const frontendPath = path.join(__dirname, "../../frontend/dist");

  // Serve static files
  app.use(express.static(frontendPath));

  // Catch-all to serve index.html for React Router
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  // Dev fallback
  app.get("/", (req, res) => {
    res.send("Backend running in development mode");
  });
}

// Start server
db();
httpServer.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`🔌 Socket.IO initialized`);
});
