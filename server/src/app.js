import express from "express";
import cors from "cors";
import morgan from "morgan";

import { catalogRoutes } from "./routes/catalogRoutes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow server-to-server requests or tools like curl
        if (!origin) return cb(null, true);
  
        // Allow any localhost port (Vite can change ports)
        if (origin.startsWith("http://localhost:")) return cb(null, true);
  
        // Allow your configured origin too
        if (origin === process.env.CLIENT_ORIGIN) return cb(null, true);
  
        return cb(new Error("Not allowed by CORS"));
      }
    })
  );  

  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/api/health", (req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/catalog", catalogRoutes);

  // Basic error handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  });

  return app;
}