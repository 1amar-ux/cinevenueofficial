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

// ==========================================
// Event Subwebsite & Ticketing Engine (API v1)
// ==========================================
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/v1/events", require("./routes/event.routes"));
app.use("/api/events", require("./routes/event.routes"));

app.use("/api/v1/event-bookings", require("./routes/eventBooking.routes"));
app.use("/api/v1/my", require("./routes/eventBooking.routes"));
app.use("/api/event-bookings", require("./routes/eventBooking.routes"));

app.use("/api/v1/event-payments", require("./routes/eventPayment.routes"));
app.use("/api/v1/webhooks", require("./routes/webhook.routes"));

app.use("/api/v1/event-tickets", require("./routes/eventTicket.routes"));
app.use("/api/event-tickets", require("./routes/eventTicket.routes"));

app.use("/api/v1/ticket-verification", require("./routes/ticketVerification.routes"));
app.use("/api/ticket-verification", require("./routes/ticketVerification.routes"));

app.use("/api/v1/admin", require("./routes/adminEvent.routes"));

// ==========================================
// Movie Ticketing Engine (API v1)
// ==========================================
app.use("/api/v1/movies", require("./routes/movie.routes"));
app.use("/api/v1/theatres", require("./routes/theatre.routes"));
app.use("/api/v1/showtimes", require("./routes/showtime.routes"));
app.use("/api/v1/movie-bookings", require("./routes/movieBooking.routes"));
app.use("/api/v1/my/movie-bookings", require("./routes/movieBooking.routes"));
app.use("/api/v1/movie-payments", require("./routes/moviePayment.routes"));
app.use("/api/v1/movie-tickets", require("./routes/movieTicket.routes"));

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
