import express from "express";
import * as bookReservation from "../controller/bookReservation.controller.js";
import roleAuth from "../middleware/roleAuth.js";
import auth from "../middleware/auth.js";

const router = express.Router();

//STUDENT AND TEACHER
router.post("/", auth, roleAuth("student", "teacher"), bookReservation.createBookReservation);
router.patch("/cancel/:reservationId", auth, roleAuth("student", "teacher"), bookReservation.cancelReservation);
router.get("/my-reservations", auth, roleAuth("student", "teacher"), bookReservation.getMyReservations);

// LIBRARIAN
router.get("/", auth, roleAuth("librarian"), bookReservation.getReservations);
router.post("/manual-cleanup", auth, roleAuth("librarian"), bookReservation.triggerManualCleanup);
router.delete("/delete/:id", auth, roleAuth("librarian"), bookReservation.deleteReservations);
router.get("/reservations/:id", auth, roleAuth("librarian"), bookReservation.getReservationsById);

export default router;