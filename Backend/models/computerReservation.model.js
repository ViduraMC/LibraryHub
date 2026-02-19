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
    required: true
  },
  slotEndTime:{
    type:Date,
    required:true
  },
  status:{
    type:String,
    enum: ["Reserved","In-use","expired","completed","cancelled"],
    default: "Reserved"
  }
  
},{
  timestamps: true
});

const ComputerReservation = mongoose.model("ComputerReservation", computerReservationSchema);
export default ComputerReservation;