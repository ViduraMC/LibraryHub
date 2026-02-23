import User from "../models/user/user.model.js";
import Computer from "../models/user/computer.model.js"
import TimeSlot from "../models/computer-reservation/timeSlot.model.js";
import ComputerReservation from "../models/computer-reservation/computerReservation.model.js";

export const createReservation = async (req, res)=> {
  try {
    const {slotId, computerId, reservationDate}= req.body;
    const studentId= req.user.id;

    const slot= await TimeSlot.findById(slotId);
    const computer= await TimeSlot.findById(computerId);

    if(!slot || !computer){
      return res.status(404).json({error: "Computer or Time slot not found!"});
    }

    if (computer.status !== "Available"){
      return res.status(404).json({error: `Unable to make reservation, computer state is : ${computer.status}`});
    }

    const isOccupied = await ComputerReservation.findOne({
      computerId,
      reservationDate: new Date(reservationDate),
      slotNumber: slot.slotNumber,
      status: {$in: ["Reserved", "In-use"]}
    });

    if(isOccupied) return res.status(400).json({error: "This computer is already booked for this time slot"}); 

    const studentBusy = await ComputerReservation.findOne({
      studentId,
      reservationDate: new Date(reservationDate),
      status: {$in: ["Reserved", "In-use"]}
    });

    if(studentBusy){
      return res.status(400).json({error: "You already have a pending or active reservation today!"});
    }

    const newBooking= await ComputerReservation.create({
      studentId,
      computerId,
      slotNumber: slot.slotNumber,
      reservationDate: new Date(reservationDate),
      status: "Reserved"
    });

    return res.status(201).json({message: "Reservation confirmed!", data: newBooking});

  } catch (error) {
    return res.status(500).json({error: "Error in making reservation", error});
  }
};

export const getAvailableComputers= async(req, res)=>{
  try {
    

  } catch (error) {
    return res.status(500).json({error: error.message});
  }
}
