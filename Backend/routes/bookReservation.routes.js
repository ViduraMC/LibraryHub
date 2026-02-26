import express from "express";
import * as bookReservation from "../controller/bookReservation.controller.js";
import roleAuth from "../middleware/roleAuth.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/", auth, roleAuth("student", "teacher"), bookReservation.createBookReservation);



export default router;