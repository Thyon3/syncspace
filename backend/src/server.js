import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
console.log('current state', process.env.NODE_ENV); 
const app = express();

import authrouter from "./routers/auth.route.js";

const port = process.env.PORT || 3000;

// Needed for ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API routes
app.use("/api/auth", authrouter);

// Example route
app.get("/fuck", (req, res) => {
  res.send("oh this is fucked up");
});

// Serve frontend build in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../../frontend/dist");

  app.use(express.static(frontendPath));

  app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

} else {
  // fallback for dev mode
  app.get("/", (req, res) => {
    res.send("Backend running in development mode");
  });
}

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
