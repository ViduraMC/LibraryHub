import express from "express";
import connectDB from "./config/mongodb.js"
import seedAdmin from "./config/adminSeed.js";
import startOverdueChecker from "./config/overdueChecker.js";
import { startComputerStatusSync } from "./config/computerSync.js";
import "dotenv/config";
import cors from "cors";

// routes
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import schoolListRoutes from "./routes/schoolList.routes.js";
import membershipRequestRoutes from "./routes/membershipRequest.routes.js";
import bookTransactionRoutes from "./routes/bookTransaction.routes.js";
import computerRoutes from "./routes/computer.routes.js";
import timeSlotRoutes from "./routes/timeSlot.routes.js";
import computerReservationRoutes from "./routes/computerReservation.routes.js";
import reportRoutes from "./routes/report.routes.js";
import bookRoutes from "./routes/book.routes.js";
import fineRoutes from "./routes/fine.routes.js";
import bookReservationRoutes from "./routes/bookReservation.routes.js";

const app = express();

connectDB().then(() => {
  seedAdmin();
  startOverdueChecker();
  startComputerStatusSync();
});
app.use(express.json());
app.use(cors());

// api routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/school-list", schoolListRoutes);
app.use("/api/membership-request", membershipRequestRoutes);
app.use("/api/transactions", bookTransactionRoutes);
app.use("/api/computer", computerRoutes);
app.use("/api/time-slot", timeSlotRoutes);
app.use("/api/computer-reservation", computerReservationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/fines", fineRoutes);
app.use("/api/book-reservation", bookReservationRoutes);

app.get("/", (req, res) => {
  res.send("API working");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});