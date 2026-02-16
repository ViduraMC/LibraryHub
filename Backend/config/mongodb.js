import mongoose from "mongoose";

const connectDB= async()=> {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to LibraryHub cluster");
  } catch (error) {
    console.error("Error connecting DB: ", error);
    process.exit();
  }
};

export default connectDB;