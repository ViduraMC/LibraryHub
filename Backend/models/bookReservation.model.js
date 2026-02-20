import mongoose from "mongoose";

const bookReservationSchema = new mongoose.Schema({

  bookId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Book",
    required: [true, "Book ID is required"]
  },
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: [true, "User ID is required"]
  },
  status:{
    type: String,
    enum:["waiting","reserved","collected","expired","cancelled"],
    default: "waiting"
  },

  //for the waiting list queue
  queuePosition:{
    type:Number,
    default: 0
  },

  //when status changes from waiting to reserved
  reservedAt:{
    type:Date
  },

  //24hrs after status changed to reserved
  expiredDate:{
    type: Date
  },

},{
  timestamps: true
});

//quickly find the next person in line for a book
bookReservationSchema.index({bookId:1, status:1, queuePosition:1});

const BookReservation = mongoose.model("BookReservation", bookReservationSchema);
export default BookReservation;