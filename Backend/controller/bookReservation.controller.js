import Book from "../models/book.model.js";
import BookReservation from "../models/bookReservation.model.js";
import Fine from "../models/fine.model.js";
import mongoose from "mongoose";

export const createBookReservation= async(req, res)=>{
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {bookId}= req.body;
    const userId= req.user.id;

    const unpaidFine = await Fine.findOne({
      userId,
      fineStatus: "unpaid"
    }).session(session);

    if(unpaidFine) return res.status(404).json({error: "Reservation blocked! You have oustanding unpaid fines", fineAmount: unpaidFine.fineAmount});

    const book= await Book.findById(bookId).session(session);
    if(!book) return res.status(404).json({error: "Book not found!"});

    const existing= await BookReservation.findOne({
      userId,
      bookId,
      status: {$in: ["waiting", "reserved", "collected"]}
    }).session(session);

    if(existing) return res.status(400).json({error: "You already have an active request!"});
    
    let status= "waiting";
    let queuePosition = 0;
    let reservedAt= null;
    let expiredDate = null;

    if(book.availableCopies>0){
      status= "reserved";
      reservedAt= new Date();
      expiredDate= new Date(reservedAt.getTime()+ 24*60*60*1000);

      book.availableCopies-=1;
      await book.save({session});
    }else{
      const lastInQueue = await BookReservation.findOne({bookId, status: "waiting"})
                                .sort({queuePosition: -1})
                                .session(session);
      queuePosition = lastInQueue? lastInQueue.queuePosition+1 : 1;
    } 
    
    const reservation= await BookReservation.create([{
      userId,
      bookId,
      status,
      queuePosition,
      reservedAt,
      expiredDate
    }], {session});

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: status=== "reserved"? "Book reserved! Collect within 24 hours" : "Added to waiting list",
      data: reservation
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({error: "Error in making book reservation!"});    
  }
};