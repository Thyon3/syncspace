import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import db from './config/db.js'
import cors from 'cors';
import { ENV } from './util/env.js';
import cookieParser from 'cookie-parser';

const app = express();

//middlwares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Needed for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Import API routes
import authrouter from "./routers/auth.route.js";

// Port
const port = ENV.PORT || 3000;

// Middleware
app.use(express.json());
app.use("/api/auth", authrouter);

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
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
