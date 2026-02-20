import TimeSlot from "../models/computer-reservation/timeSlot.model.js";
import ComputerReservation from "../models/computer-reservation/computerReservation.model.js";

export const createTimeSlot= async (req, res)=>{
  try {
    const {slotNumber, startHour, startMinute, durationMinutes}= req.body;

    const existing= await TimeSlot.findOne({slotNumber});
    if(existing) return res.status(400).json({message: "Slot number already implemented!"});

    const newSlot = await TimeSlot.create({
      slotNumber,
      startHour,
      startMinute,
      durationMinutes
    });
    return res.status(201).json({message: "Slots added successfully", data: newSlot});

  } catch (error) {
    return res.status(500).json({error: "Error in time slots", error});
  }
};

export const getAllTimeSlots = async(req, res)=> {
  try {
    const slots = (await TimeSlot.find()).toSorted({slotNumber:1});
    return res.status(200).json({message: "Fetched time slots successfully!", data: slots});
  } catch (error) {
    return res.status(500).json({error: "Error in time slots", error});
  }
};

export const updateTimeSlot = async (req, res)=> {
  try {
    const {id}= req.params;

    const updatedSlot= await TimeSlot.findByIdAndUpdate(
      id,
      req.body,
      {returnDocument: 'after', runValidators: true}
    );

    if(!updatedSlot) return res.status(400).json({message: "Slot not found!", error});

    return res.status(200).json({message: "Slot updated successfully!", data: updatedSlot});

  } catch (error) {
    return res.status(500).json({error: "Error in time slots", error});
  }
};