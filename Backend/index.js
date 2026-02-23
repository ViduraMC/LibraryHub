import express from "express";
import connectDB from "./config/mongodb.js"
import seedAdmin from "./config/adminSeed.js";
import startOverdueChecker from "./config/overdueChecker.js";
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

const app = express();

connectDB().then(() => {
  seedAdmin();
  startOverdueChecker();
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

app.get("/", (req, res) => {
  res.send("API working");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});