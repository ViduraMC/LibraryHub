const ComputerSchema= new Schema({
  computerNumber:{
    type: Number,
    unique: true,
    required: true,
    min:1,
    validate: {
      validator: Number.isInteger,
      message: "Computer number must be an integer"
    }
  },
  status: {
    type: String,
    enum:["Available","In-use","Maintenance"],
    default: "Available",
    required:true
  }
},{
  timestamps:true
});