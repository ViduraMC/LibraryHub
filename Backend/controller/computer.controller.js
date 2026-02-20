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
};

export const getComputerById= async (req, res)=>{
  try {
    const {id}= req.params;
    const computer= await Computer.findById(id);

    if(!computer){
      return res.status(404).json({message: "Computer not found"});
    }

    return res.status(200).json(computer);
  } catch (error) {
    if(error.kind === "ObjectId"){
      return res.status(400).json({message: "Invalid computer ID format"});
    }
    return res.status(500).json({message: "Unable to fetch computer", error});
  }
};

export const getComputerByName= async (req, res)=>{
  try {
    const {pcNumber}= req.params;
    const computer = await Computer.findOne({computerNumber: pcNumber});

    if(!computer){
      return res.status(404).json({message: `Computer #${pcNumber} not found`});
    }

    return res.status(200).json(computer);
  } catch (error) {
    return res.status(500).json({message: "Unable to fetch computer with given number", error});
  }
};

export const updateComputer = async(req, res)=> {
  try {
    const {id}= req.params;
    const {computerNumber, status}= req.body;

    const updatedPC= await Computer.findByIdAndUpdate(
      id,
      {computerNumber, status},
      {new: true, runValidators: true}
    );

    if(!updatedPC) return res.status(404).json({message: "Computer not found!"});

    return res.status(200).json({message:"Update successful", data: updatedPC});

  } catch (error) {
    return res.status(400).json({error: "Unable to update computers", error});
  }
};

export const deleteComputer= async(req, res)=>{
  try {
    const {id}= req.params;

    const pc= await Computer.findById(id);
    if(pc.status==="In-use"){
      return res.status(400).json({message: "Cannot remove a computer that is currently in use"});
    }

    await Computer.findByIdAndDelete(id);
    return res.status(200).json({message: "Computer removed successfully"});

  } catch (error) {
    return res.status(500).json({error: "Unable to remove computer", error});
  }
}