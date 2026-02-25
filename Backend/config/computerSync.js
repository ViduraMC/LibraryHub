import cron from "node-cron";
import Computer from "../models/user/computer.model.js";
import ComputerReservation from "../models/computer-reservation/computerReservation.model.js";

export const startComputerStatusSync = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      // 1. Find active reservations (Status is lowercase in Reservation Schema)
      const activeReservations = await ComputerReservation.find({
        slotStartTime: { $lte: now },
        slotEndTime: { $gt: now },
        status: { $in: ["reserved", "in-use"] } 
      });

      const busyComputerIds = activeReservations.map(res => res.computerId);

      // 2. ACTIVATE: Available -> Reserved (Reserved is Capitalized in Computer Schema)
      await Computer.updateMany(
        {
          _id: { $in: busyComputerIds },
          status: "Available"
        },
        { $set: { status: "Reserved" } }
      );

      // 3. STRICT CLEANUP: 
      // Reset if NOT in busy list AND status is Reserved or In-use (Capitalized)
      await Computer.updateMany(
        {
          _id: { $nin: busyComputerIds },
          status: { $in: ["Reserved"] } 
        },
        { $set: { status: "Available" } }
      );

      console.log("Server Sync Successful. UTC:", now.toISOString());
    } catch (error) {
      console.error("[Cron Job Error]: ", error);
    }
  });
};