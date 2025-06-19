const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const Database = require("./src/models/Database");
const routes = require("./src/routes");
const { setupSecurity } = require("./src/config/security");

const app = express();
const PORT = process.env.PORT || 3000;

setupSecurity(app);

app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://larissaiishikawa.github.io",
            "https://joke-manager.vercel.app",
            /https:\/\/.*\.vercel\.app$/
          ]
        : ["http://localhost:3001", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP",
});
app.use(limiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

Database.connect();

app.use("/api", routes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
