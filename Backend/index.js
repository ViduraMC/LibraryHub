import express from "express";
import connectDB from "./config/mongodb.js"
import seedAdmin from "./config/adminSeed.js";
import "dotenv/config";
import cors from "cors";


const app = express();

connectDB().then(() => {
  seedAdmin();
});
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("API working");
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});