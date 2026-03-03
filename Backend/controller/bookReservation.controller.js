import Book from "../models/book.model.js";
import BookReservation from "../models/bookReservation.model.js";
import BookTransaction from "../models/bookTransaction.model.js";
import User from "../models/user/user.model.js";
import Fine from "../models/fine.model.js";
import mongoose from "mongoose";

//FUNCTION
export const cleanUpExpiredReservations= async()=>{
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();
    const expired= await BookReservation.find({
      status: "reserved",
      expiredDate: {$lt: now}
    }).session(session);  //check reservations that are expired

    if(expired.length === 0){
      await session.commitTransaction();
      return 0;
    }

    for(const resv of expired){
      resv.status= "expired";
      await resv.save({session}); //mark current reservation as expired

      const nextInLine = await BookReservation.findOne({  //find user next in line
        bookId: resv.bookId,
        status: "waiting",
        queuePosition: 1
      }).session(session);

      if(nextInLine){   //give book to user next in line
        nextInLine.status= "reserved";
        nextInLine.queuePosition= 0;
        nextInLine.reservedAt=  now;
        nextInLine.expiredDate= new Date(now.getTime()+ 24*60*60*1000);
        await nextInLine.save({session});

        await BookReservation.updateMany(
          {bookId: resv.bookId, status: "waiting"},
          {$inc: {queuePosition: -1}},
          {session} //update queue position by moving 1 spot up in the queue
        );
      }else{
        await Book.findByIdAndUpdate(resv.bookId, {$inc: {availableCopies: 1}}, {session}); //if noone is waiting, put book to shelf
      }

    }

    await session.commitTransaction();
    return expired.length;

  } catch (error) {
      await session.abortTransaction();
  }finally{
    session.endSession();
  }
};

//STUDENT/ TEACHER
export const createBookReservation= async(req, res)=>{
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {bookId}= req.body;
    const userId= req.user.id;
    const MAX_RESERVATIONS=5;

    //check active reservations and ensure its less than max limit
    const activeReservationCount= await BookReservation.countDocuments({
      userId,
      status: {$in: ["waiting", "reserved"]}

    }).session(session);

    if(activeReservationCount >= MAX_RESERVATIONS){
      return res.status(400).json({error: `Reservation limit reached! You can only have ${MAX_RESERVATIONS} active requests at a time.`});
    }

    //check for unpaid fines and block reservation if any
    const unpaidFine = await Fine.findOne({
      userId,
      fineStatus: "unpaid"
    }).session(session);

    if(unpaidFine) return res.status(404).json({error: "Reservation blocked! You have oustanding unpaid fines", fineAmount: unpaidFine.fineAmount});

    //check if book exists
    const book= await Book.findById(bookId).session(session);
    if(!book) return res.status(404).json({error: "Book not found!"});

    //check for pending/active requests for the same book
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
      await book.save({session}); //if available, reserve the book and set expiry for 24 hrs and decrement available copies
    }else{
      const lastInQueue = await BookReservation.findOne({bookId, status: "waiting"})
                                .sort({queuePosition: -1})
                                .session(session);
      queuePosition = lastInQueue? lastInQueue.queuePosition+1 : 1; //updating queue postition for waiting list
    } 
    
    const reservation= await BookReservation.create([{
      userId,
      bookId,
      status,
      queuePosition,
      reservedAt,
      expiredDate
    }], {session}); //create reservation

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

export const cancelReservation = async (req, res)=> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {reservationId}= req.params;
    const userId= req.user.id;

    const reservation = await BookReservation.findOne({
      _id: reservationId,
      userId,
    }).session(session);

    if(!reservation) return res.status(404).json({error: "Reservation not found!"});

    if(reservation.status==="collected" ){
      return res.status(400).json({error: "Cannot cancel a book that is already collected!"});
    }

    const bookId= reservation.bookId;
    const oldStatus= reservation.status;
    const oldQueuePos= reservation.queuePosition;

    //update queue logic
    if(oldStatus === "waiting"){
      await BookReservation.updateMany(
        {bookId, status:"waiting", queuePosition: {$gt: oldQueuePos}},
        {$inc: {queuePosition: -1}},
        {session} //move everyone behind this person
      );

    }else if(oldStatus === "reserved"){
      const nextInLine= await BookReservation.findOne({
        bookId,
        status: "waiting",
        queuePosition: 1
      }).session(session); 

      if(nextInLine){
        nextInLine.status = "reserved";
        nextInLine.queuePosition=0;
        nextInLine.reservedAt= new Date();
        nextInLine.expiredDate= new Date(Date.now()+ 24*60*60*1000);
        await nextInLine.save({session});

        await BookReservation.updateMany(
          {bookId, status: "waiting"},
          {$inc: {queuePosition: -1}},
          {session}
        );             //if reserved spot opened, assign it to person next in line

      }else{
        await Book.findByIdAndUpdate(bookId, {$inc: {availableCopies: 1}},
          {session}
        );
      }
    }

    reservation.status="cancelled";
    reservation.queuePosition=0;
    await reservation.save({session});

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({message: "Reservation cancelled successfully."});

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({error: "Error cancelling reservation!"});
  }
};

export const getMyReservations = async (req, res) => {
  try {
    const userId= req.user.id;
    const {tab} = req.query;  //'active' or 'history' tab

    const activeStatuses= ["waiting", "reserved"];
    const historyStatuses= ["collected", "expired", "cancelled", "completed"];

    const targetStatuses= tab === "history"? historyStatuses: activeStatuses; //if history tab, show all past reservations, else show active ones

    const reservation= await BookReservation.find({
      userId,
      status: {$in: targetStatuses}
    })
      .populate("bookId", "name author img")
      .sort({updatedAt: -1});

      const formattedData = reservation.map(resv => {
        const now= new Date();
        let displayStatus= resv.status;
        let timeRemaning= null;

        if(resv.status === "reserved"){
          const timeLeft= Math.max(0, resv.expiredDate- now);
          const hours= Math.floor(timeLeft / (1000*60*60));
          const minutes= Math.floor((timeLeft % (1000*60*60))/ (1000/60));
          timeRemaning= `${hours}h ${minutes}m left`;
        }

        return {
          ...resv._doc,
          displayStatus,
          timeRemaning,
          isActionRequired: resv.status === "reserved"
        };
      });

      res.status(200).json({
        success: true,
        tab: tab || "active",
        count: formattedData.length,
        data: formattedData
      });

  } catch (error) {
    res.status(500).json({error: "Failed to fetch your reservations!"});
  }
};


//LIBRARIAN
export const processBorrowing= async (req, res)=> {
  const session= await mongoose.startSession();
  session.startTransaction();

  try {
    const {reservationId}= req.body;
    
    const reservation = await BookReservation.findById(reservationId).session(session);

    if(!reservation){
      return res.status(400).json({error: "Reservation not found!"});
    }

    if(reservation.status!== "reserved"){
      return res.status(400).json({error: `Cannot collect. Current status is ${reservation.status}. Only 'reserved' books can be issued!`});
    }

    //update reservation status to collected
    reservation.status="collected";
    await reservation.save({session});

    const borrowDate= new Date();
    const dueDate= new Date();
    dueDate.setDate(dueDate.getDate()+14);

    const transaction= await BookTransaction.create([{
      userId: reservation.userId,
      bookId: reservation.bookId,
      reservationId: reservation._id,
      borrowDate,
      dueDate,
      status: "active"
    }], {session}); //create transaction record for this borrowing

    await User.findByIdAndUpdate(
      reservation.userId,
      {$inc: {noOfBorrowedBooks: 1}},
      {session}
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({message: "Book issued successfully!", transaction: transaction[0]});
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({error: "Error issuing book"});
    
  }

};

export const processReturn = async (req, res)=> {
  const session= await mongoose.startSession();
  session.startTransaction();

  try {
    const {transactionId} = req.body;

    const transaction = await BookTransaction.findById(transactionId).session(session);
    if(!transaction || transaction.status=== "returned"){
      return res.status(400).json({error: "Active transaction not found or already returned"});
    } 

    //update transaction status to returned
    transaction.status= "returned";
    transaction.returnDate= new Date();
    transaction.isLate = new Date() > transaction.dueDate;
    await transaction.save({session});

    await BookReservation.findByIdAndUpdate(
      transaction.reservationId,
      {status: "completed"},
      {session}       //mark book reservation as completed
    );

    await User.findByIdAndUpdate(
      transaction.userId,
      {$inc: {noOfBorrowedBooks: -1}},
      {session}
    );

    const nextInLine= await BookReservation.findOne({
      bookId: transaction.bookId,
      status: "waiting"
    }).sort({queuePosition: 1}).session(session);

    //assign book to next in line if exists, else update available copies
    if(nextInLine){
      nextInLine.status= "reserved";
      nextInLine.queuePosition=0;
      nextInLine.reservedAt= new Date();
      nextInLine.expiredDate= new Date(Date.now()+ 24*60*60*1000);
      await nextInLine.save({session});

      await BookReservation.updateMany(
        {bookId: transaction.bookId, status: "waiting"},
        {$inc: {queuePosition: -1}},
        {session}
      );
    }else{
      await Book.findByIdAndUpdate(
        transaction.bookId,
        {$inc: {availableCopies: 1}},
        {session}
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({message: nextInLine? "Book returned and assigned to next in queue!" : "Book returned to shelf"});

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({error: "Error during return"});
  }
};

export const getReservations = async (req, res)=> {
  try {
    const {search, status}= req.query;
    let query={};

    if(status) query.status= status;

    const reservations = await BookReservation.find(query)
                          .populate("bookId", "name author")
                          .populate("userId", "fullName studentId membershipId email")
                          .sort({createdAt: -1});

    let filteredData= reservations;
    if(search){
      filteredData= reservations.filter(r=>
        r.userId?.fullName.toLowerCase().includes(search.toLowerCase())||
        r.bookId?.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.status(200).json({success:true, count:filteredData.length, data: filteredData});
    
  } catch (error) {
    res.status(500).json({error: "Failed to fetch reservations!"});
  }
};

export const triggerManualCleanup= async (req, res)=> {
  try {
    const count = await cleanUpExpiredReservations();

    if(count===0){
      return res.status(200).json({
        success: true, message: "Everything is up to date! No expired reservations found."
      });      
    }

    res.status(200).json({
        success: true,
        message: `Cleanup complete. ${count} expired reservations were released`
    });
  } catch (error) {
    res.status(500).json({error: "Failed to perform manual cleanup"});
  }
};

export const deleteReservations= async (req, res)=> {
  try {
    const {id}= req.params;
    const reservation= await BookReservation.findById(id);

    if(!reservation) return res.status(404).json({error: "Reservation not found!"});

    if(["waiting", "reserved"].includes(reservation.status)){
      return res.status(400).json({
        error: "Cannot delete active reservations!"
      });
    }

    await BookReservation.findByIdAndDelete(id);
    res.status(200).json({success: true, message: "Record permamnently erased!"});

  } catch (error) {
    res.status(500).json({error: "Delete failed!"});
  }
};

export const getReservationsById= async (req, res)=> {
  try {
    const {id}= req.params;
    const reservation= await BookReservation.findById(id)
                            .populate("bookId", "name author img availableCopies")
                            .populate("userId", "fullName email studentId membershipId");

    if(!reservation) return res.status(404).json({error: "Reservation not found!"});

    res.status(200).json({success: true, data: reservation});

  } catch (error) {
    res.status(500).json({error: "Error fetching reservation details!"});
  }
};


