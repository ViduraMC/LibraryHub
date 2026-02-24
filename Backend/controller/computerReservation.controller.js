import User from "../models/user/user.model.js";
import Computer from "../models/user/computer.model.js";
import TimeSlot from "../models/computer-reservation/timeSlot.model.js";
import ComputerReservation from "../models/computer-reservation/computerReservation.model.js";

//STUDENT / TEACHER
export const createReservation = async (req, res) => {
  try {
    const { slotId, computerId, reservationDate } = req.body;
    const userId = req.user.id;

    const slot = await TimeSlot.findById(slotId);
    const computer = await Computer.findById(computerId);

    if (!slot || !computer) {
      return res
        .status(404)
        .json({ error: "Computer or Time slot not found!" });
    }

    if (computer.status === "Maintenance") {
      return res.status(404).json({
        error: `Unable to make reservation, computer is under : ${computer.status}`,
      });
    }

    const now = new Date();
    const start = new Date(reservationDate);
    start.setHours(slot.startHour, slot.startMinute, 0, 0);

    const maxDaysAhead = 7;
    const maxDate = new Date();
    maxDate.setDate(now.getDate() + maxDaysAhead);
    maxDate.setHours(23, 59, 59, 999);

    const gracePeriod = 15 * 60000;
    const latestPossibleBookingTime = new Date(start.getTime() + gracePeriod);

    if (start > maxDate) {
      return res.status(400).json({
        error: `You can only book up to ${maxDaysAhead} days in advance!`,
      });
    }

    if (now > latestPossibleBookingTime) {
      return res.status(400).json({
        error:
          "This slot started more than 15 mins ago, and therefore is no longer available!",
      });
    }

    const end = new Date(start.getTime() + slot.durationMinutes * 60000); //convert to milliseconds

    const isOccupied = await ComputerReservation.findOne({
      computerId,
      slotStartTime: start,
      status: { $in: ["reserved", "in-use"] },
    });

    if (isOccupied)
      return res
        .status(400)
        .json({ error: "This computer is already booked for this time slot" });

    const startOfDay = new Date(start);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(start);
    endOfDay.setHours(23, 59, 59, 999);

    const studentBusy = await ComputerReservation.findOne({
      userId,
      slotStartTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["reserved", "in-use"] },
    });

    if (studentBusy) {
      return res.status(400).json({
        error: "You already have a pending or active reservation today!",
      });
    }

    const newBooking = await ComputerReservation.create({
      userId,
      computerId,
      slotNumber: slot.slotNumber,
      slotStartTime: start,
      slotEndTime: end,
      status: "reserved",
    });

    if (newBooking) {
      const now = new Date();
      if (start <= now && end > now) {
        await Computer.findByIdAndUpdate(computerId, {
          status: "Reserved",
        });
      }
    }

    return res
      .status(201)
      .json({ message: "Reservation confirmed!", data: newBooking });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error in making reservation", error });
  }
};

export const getMyReservations = async (req, res) => {
  try {
    const userId = req.user.id;

    const reservations = await ComputerReservation.find({ userId })
      .populate("computerId", "createdAt")
      .sort({ slotStartTime: -1 });

    return res.status(200).json({
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Failed to fetch your reservations!" });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reservation = await ComputerReservation.findById(id);
    if (!reservation)
      return res.status(404).json({ error: "Reservation not found!" });

    if (reservation.userId.toString() !== userId) {
      return res.status(404).json({
        error: "Unauthorized: You can only cancel your own reservations!",
      });
    }

    if (reservation.status !== "reserved") {
      return res.status(404).json({
        error: `Cannot cancel reservation, status is : ${reservation.status}`,
      });
    }

    reservation.status = "cancelled";
    await reservation.save();

    await Computer.findByIdAndUpdate(reservation.computerId, {
      status: "Available",
    });

    return res.status(200).json({
      message: "Reservation cancelled successfully!",
      data: reservation,
    });
  } catch (error) {
    return res.status(500).json({ error: "Cancellation failed!", error });
  }
};

//LIBRARIAN
export const manageReservationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reservation = await ComputerReservation.findById(id);
    if (!reservation)
      return res.status(404).json({ error: "Reservation not found!" });

    const targetStatus = status.toLowerCase();

    const terminalStates = ["cancelled", "completed", "expired"];
    if (terminalStates.includes(reservation.status.toLowerCase())) {
      return res
        .status(400)
        .json({ error: `This reservation is already ${reservation.status}` });
    }

    const now = new Date();
    const isCurrentSlot =
      now >= reservation.slotStartTime && now <= reservation.slotEndTime;
    const gracePeriod = 15 * 60 * 1000;
    const expiryThreshold = new Date(
      reservation.slotStartTime.getTime() + gracePeriod,
    );

    if (targetStatus === "expired") {
      if (now < expiryThreshold) {
        return res.status(400).json({
          error: "Can't expire yet. The student still has time to show up!",
        });
      }

      await Computer.findByIdAndUpdate(reservation.computerId, {
        status: "Available",
      });
    }

    if (targetStatus === "completed" || targetStatus === "cancelled") {
      await Computer.findByIdAndUpdate(reservation.computerId, {
        status: "Available",
      });
    }

    if (targetStatus === "in-use") {
      if (now > reservation.slotEndTime) {
        return res
          .status(400)
          .json({ error: "This slot time has already ended!" });
      }

      await Computer.findByIdAndUpdate(reservation.computerId, {
        status: "In-use",
      });
    }

    reservation.status = targetStatus;
    await reservation.save();

    return res.status(200).json({
      message: `Status updated to ${targetStatus}`,
      data: reservation,
    });
  } catch (error) {
    return res.status(500).json({ error: "Update failed", error });
  }
};

export const getAllReservations = async (req, res) => {
  try {
    const { date, status } = req.query;
    let query = {};

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    query.slotStartTime = { $gte: startOfDay, $lte: endOfDay };

    if (status) {
      query.status = status.toLowerCase();
    }

    const reservations = await ComputerReservation.find(query)
      .populate("userId", "fullName membershipId ")
      .populate("computerId", "computerNumber")
      .sort({ slotStartTime: 1 });

    return res.status(200).json({
      succes: true,
      count: reservations.length,
      viewingDate: startOfDay.toDateString(),
      data: reservations,
    });
  } catch (error) {
    return res.status(500).json({ error: "Error fetching reservations!" });
  }
};
