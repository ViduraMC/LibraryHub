import cron from "node-cron";
import Computer from "../models/user/computer.model.js";
import ComputerReservation from "../models/computer-reservation/computerReservation.model.js";

export const startComputerStatusSync = ()=> {
  cron.schedule('* * * * *', async ()=> {
    try {
      const now = new Date();

      const activeReservations = await ComputerReservation.find({
        slotStartTime: {$lte: now},
        slotEndTime: {$gt: now},
        status: {$in: ["reserved", "in-use"]}
      });

      const busyComputerIds= activeReservations.map(res=> res.computerId);

      await Computer.updateMany(
        {
          _id: {$in: busyComputerIds},
          status: "Available"
        },
        {$set: {status: "Reserved"}}
      );

      await Computer.updateMany(
        {
          _id: {$nin: busyComputerIds},
          status: {$in: ["Reserved", "In-use"]}
        },
        {$set: {status: "Available"}}
      );

      // console.log(`[Cron Job] Sync successful at ${now.toLocaleTimeString()}`);

    } catch (error) {
      console.log("[Cron Job Error]: ", error);
    }
  });

};