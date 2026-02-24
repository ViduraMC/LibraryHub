import express from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import * as computerReservationController from "../controller/computerReservation.controller.js";

const router = express.Router();

//STUDENT/ TEACHER
router.post("/", auth, roleAuth("student", "teacher"), computerReservationController.createReservation);
router.patch("/cancel/:id", auth, roleAuth("student", "teacher"), computerReservationController.cancelReservation);
router.get("/reservations", auth, roleAuth("student","teacher"), computerReservationController.getMyReservations);

//LIBRARIAN
router.patch("/manage/:id", auth, roleAuth("librarian"), computerReservationController.manageReservationStatus);

export default router;