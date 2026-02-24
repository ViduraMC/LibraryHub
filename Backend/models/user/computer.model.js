import mongoose from "mongoose";

const computerSchema= new mongoose.Schema({
  computerNumber:{
    type: Number,
    unique: true,
    required: true,
    min:1,
    validate: {
      validator: Number.isInteger,
      message: "Computer number must be an integer"
    }
  },
  status: {
    type: String,
    enum:["Available","In-use","Maintenance","Reserved"],
    default: "Available",
    required:true
  }
},{
  timestamps:true
});

const Computer = mongoose.model("Computer", computerSchema);
export default Computer;