import express from "express";
import connectDB from "./config/mongodb.js"
import seedAdmin from "./config/adminSeed.js";
import "dotenv/config";
import cors from "cors";

// routes
import authRoutes from "./routes/auth.routes.js";


const app = express();

connectDB().then(() => {
  seedAdmin();
});
app.use(express.json());
app.use(cors());

// api routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API working");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});