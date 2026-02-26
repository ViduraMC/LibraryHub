import express from "express";
import auth from "../middleware/auth.js";
import roleAuth from "../middleware/roleAuth.js";
import * as computerController from "../controller/computer.controller.js";

const router= express.Router();

//librarian specific routes
router.post("/", auth, roleAuth("librarian"), computerController.addComputer);
router.patch("/:id", auth, roleAuth("librarian"), computerController.updateComputer);
router.delete("/:id", auth, roleAuth("librarian"), computerController.deleteComputer);

//non role specific routes
router.get("/", auth, computerController.getAllComputers);
router.get("/id/:id", auth,  computerController.getComputerById);
router.get("/pcNumber/:pcNumber", auth, computerController.getComputerByName);


export default router;