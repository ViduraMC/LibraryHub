import mongoose from "mongoose";

const computerReservationSchema= new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  computerId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Computer",
    required:true,
  },
  slotNumber:{
    type:Number,
    required: true
  },
  slotStartTime:{
    type: Date,
   
  },
  slotEndTime:{
    type:Date,
   
  },
  status:{
    type:String,
    enum: ["reserved","in-use","expired","completed","cancelled"],
    default: "reserved",
    lowercase: true,
    trim: true
  }
  
},{
  timestamps: true
});

const ComputerReservation = mongoose.model("ComputerReservation", computerReservationSchema);
export default ComputerReservation;