import User from "../models/user/user.model.js";
import Computer from "../models/user/computer.model.js"
import TimeSlot from "../models/computer-reservation/timeSlot.model.js";
import ComputerReservation from "../models/computer-reservation/computerReservation.model.js";

//STUDENT / TEACHER
export const createReservation = async (req, res)=> {
  try {
    const {slotId, computerId, reservationDate}= req.body;
    const userId= req.user.id;

    const slot= await TimeSlot.findById(slotId);
    const computer= await Computer.findById(computerId);

    if(!slot || !computer){
      return res.status(404).json({error: "Computer or Time slot not found!"});
    }

    if (computer.status !== "Available"){
      return res.status(404).json({error: `Unable to make reservation, computer state is : ${computer.status}`});
    }

    const start= new Date(reservationDate);
    start.setHours(slot.startHour, slot.startMinute, 0, 0); 

    const end= new Date(start.getTime() + slot.durationMinutes*60000);  //cinvert to milliseconds

    const isOccupied = await ComputerReservation.findOne({
      computerId,
      slotStartTime: start,
      status: {$in: ["Reserved", "In-use"]}
    });

    if(isOccupied) return res.status(400).json({error: "This computer is already booked for this time slot"}); 

    const startOfDay = new Date(start).setHours(0,0,0,0);
    const endOfDay = new Date(start).setHours(23,59,59,999);

    const studentBusy = await ComputerReservation.findOne({
      userId,
      slotStartTime: {$gte: startOfDay, $lte: endOfDay},
      status: {$in: ["Reserved", "In-use"]}
    });

    if(studentBusy){
      return res.status(400).json({error: "You already have a pending or active reservation today!"});
    }

    const newBooking= await ComputerReservation.create({
      userId,
      computerId,
      slotNumber: slot.slotNumber,
      slotStartTime: start,
      slotEndTime: end,
      status: "Reserved"
    });

    return res.status(201).json({message: "Reservation confirmed!", data: newBooking});

  } catch (error) {
    return res.status(500).json({error: "Error in making reservation", error});
  }
};

//LIBRARIAN
export const updateReservationStatus = async (req, res)=> {
  try {
    const {id}= req.params;
    const {status}= req.body;

    const validStatuses=["Reserved", "In-use", "Completed", "Cancelled","Expired"];
    if(!validStatuses.includes(status)){
      return res.status(400).json({error: "Invalid status update"});
    }

    const reservation = await ComputerReservation.findById(id);
    if(!reservation) return res.status(404).json({error: "Reservation not found!"});

    const today= new Date().setHours(0,0,0,0);
    const reservationDay= new Date(reservation.reservationDate).setHours(0,0,0,0);

    if(status==="In-use" && today!== reservationDay){
      return res.status(400).json({error: "Cannot check-in for a reservation scheduled for another day!"});
    }

    const finalStates = ["Completed", "Cancelled", "Expired"];
    if(finalStates.includes(status)){
      return res.status(400).json({error: `Cannot update. This reservation is already ${reservation.status}`});
    }

    reservation.status = status;
    await reservation.save();

    return res.status(200).json({message: `Status updated to ${status}`, data: reservation});

  } catch (error) {
    return res.status(500).json({error: "Update failed", error});
  }
};