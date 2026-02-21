import express from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import * as timeSlotController from "../controller/timeSlot.controller.js";

const router= express.Router();

//librarian specific
router.post("/initialize", auth, roleAuth("librarian"), timeSlotController.initializeSchoolSchedule);
router.post("/", auth, roleAuth("librarian"), timeSlotController.createTimeSlot);
router.patch("/:id", auth, roleAuth("librarian"), timeSlotController.updateTimeSlot);
router.delete("/:id", auth, roleAuth("librarian"), timeSlotController.deleteTimeSlot);


//non role specific 
router.get("/", auth, timeSlotController.getAllTimeSlots);

export default router;