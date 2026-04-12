import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  slotNumber:{
    type:Number,
    required:true,
    unique: true,
    min:1
  },
  startHour:{
    type:Number,
    required: true,
    min:0,
    max:23
  },
  startMinute:{
    type:Number,
    default: 0,
    min:0,
    max:59
  },
  durationMinutes:{
    type:Number,
    default:60,
    min:1
  }
},{
  timestamps:true
});

const TimeSlot = mongoose.model("TimeSlot", timeSlotSchema);
export default TimeSlot;