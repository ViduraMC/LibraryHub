import Computer from "../models/user/computer.model";

export const addComputer = async (req, res)=> {
  try {
    const {computerNumber, status }= req.body;

    if(!Number.isInteger(Number(computerNumber))){
      return res.status(400).json({message: "Invalid input: Computer number must be a whole integer!"});
    }

    const existingComputer = await Computer.findOne({computerNumber});
    if(existingComputer){
      return res.status(400).json({message: `Computer #${computerNumber} already exists!` });
    }

    const newPc= await Computer.create({
      computerNumber,
      status: status || "Available"
    });

    res.status(201).json({message: "Computer successfully registered!", data: newPc});

  } catch (error) {
    res.status(500).json({error: "Unable to add computer: ", error});
  }
};

export const getAllComputers = async (req, res)=>{
  try {
    
    const computers= await Computer.find().sort({computerNumber:1});
    res.status(200).json({message: "Successfully fetched computers", data: computers});

  } catch (error) {
    return res.status(500).json({error: "Unable to fetch all computers", error});
  }
}