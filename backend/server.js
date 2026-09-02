require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { swaggerUi, swaggerSpec } = require("./config/swagger");

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// =========================
// Middleware
// =========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// Routes
// =========================
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/movies", require("./routes/movieRoutes"));
app.use("/api/theatres", require("./routes/theatreRoutes"));
app.use("/api/shows", require("./routes/showRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// =========================
// Swagger API Docs
// =========================
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =========================
// Health Check
// =========================
app.get("/", (req, res) => {
  res.json({
    status: "Running",
    project: "CineVenue Backend",
    version: "1.0.0",
  });
});

// =========================
// Socket.IO
// =========================
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("joinShow", (showId) => {
    socket.join(showId);
  });

  socket.on("seatLocked", (data) => {
    io.to(data.showId).emit("seatUpdated", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected");
  });
});

// =========================
// Start Server
// =========================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server Running on Port ${PORT}`);
});
