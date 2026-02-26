import express from "express";
import * as bookReservation from "../controller/bookReservation.controller.js";
import roleAuth from "../middleware/roleAuth.js";
import auth from "../middleware/auth.js";

const router = express.Router();

//STUDENT AND TEACHER
router.post("/", auth, roleAuth("student", "teacher"), bookReservation.createBookReservation);
router.patch("/cancel/:reservationId", auth, roleAuth("student","teacher"), bookReservation.cancelReservation);

//LIBRRIAN
router.post("/issue-book", auth, roleAuth("librarian"), bookReservation.processBorrowing);
router.post("/return-book", auth, roleAuth("librarian"), bookReservation.processReturn);

export default router;