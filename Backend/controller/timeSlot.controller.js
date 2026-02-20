import TimeSlot from "../models/computer-reservation/timeSlot.model.js";
import ComputerReservation from "../models/computer-reservation/computerReservation.model.js";


export const initializeSchoolSchedule = async (req, res)=> {
  try {
    const schoolDay= [
      {slotNumber:1, startHour:7, startMinute: 30, durationMinutes: 60 },
      {slotNumber:2, startHour: 8, startMinute: 30, durationMinutes: 60},
      {slotNumber:3, startHour: 9, startMinute: 30, durationMinutes: 60},
      {slotNumber:4, startHour: 10, startMinute: 30, durationMinutes: 60},
      {slotNumber:5, startHour: 11, startMinute: 30, durationMinutes: 60},
      {slotNumber:6, startHour: 12, startMinute: 30, durationMinutes: 60},
      {slotNumber:7, startHour: 13, startMinute: 30, durationMinutes: 60},
    ];

    await TimeSlot.insertMany(schoolDay);
    return res.status(201).json({message: "Library schedule initialized!"});

  } catch (error) {
    return res.status(400).json({error: "Schedule already exists or invalid data!"});
  }
}

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

export const deleteTimeSlot = async (req, res)=> {
  try {
    const {id}= req.params;

    const slot= await TimeSlot.findById(id);
    if(!slot) return res.status(404).json({message:"Time slot not found!"});

    //check for active or upcoming reservations which are reserved or in-use
    const activeReservations = await ComputerReservation.findOne({
      slotNumber: slot.slotNumber,
      status: {$in: ["Reserved", "In-use"]},
      slotStartTime: {$gte: new Date()} //check future or current ones
    });

    if(activeReservations){
      return res.status(400).json({message: "Cannot delete slot. Students have active reservations!"});
    }

  } catch (error) {
    return res.status(500).json({error: "Error in time slots", error});
  }
};