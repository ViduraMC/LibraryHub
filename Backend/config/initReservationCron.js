import cron from "node-cron";
import { cleanUpExpiredReservations } from "../controller/bookReservation.controller.js";

const initReservation = ()=> {
  cron.schedule("*/30 * * * * ", async ()=> {
    console.log("Checking for expired reservations...");
    try {
      const count= await cleanUpExpiredReservations();
      if(count > 0){
        console.log(`Released ${count} expired books`);
      }
    } catch (error) {
      console.error("Error in auto cleanup");
    }

  });

  console.log("Reservation cron job initialized!");
};

export default initReservation;