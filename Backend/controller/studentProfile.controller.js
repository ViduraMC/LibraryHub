import Student from "../models/user/student.model.js";

export const getMyProfile = async(req, res)=> {
  try {
    const student= await Student.findById(req.user._id).select(
      "fullName email phone address profileImageURL studentId membershipId grade classRoom guardianName guardianPhone lastLoginAt"
    );

    if(!student) return res.status(404).json({message: "Student not found!"});

    res.status(200).json({student});


  } catch (err) {
    res.status(500).json({message: "Server error", error: err.message});
  }
};

export const updateMyProfile= async (req, res)=> {
  const allowedFields= ["phone", "address", "profileImageURL"];
  const updates= {};

  for(const key of allowedFields){
    if(req.body[key]!== undefined) updates[key] = req.body[key];
  }

  if(Object.keys(updates).lenght === 0){
    return res.status(400).json({message: "No valid fields provided for update"});
  }

  try {
    const student= await Student.findByIdAndUpdate(
      req.user._id,
      {$set: updates},
      {new: true, runValidators: true}
    ).select("fullName email phone address profileImageURL");

    if(!student) return res.status(404).json({message: "Student not found!"});

    res.status(200).json({message: "Profile updated successfully", student});

  } catch (err) {
    res.status(500).json({message: "Server error", error: err.message});
  }


};


export const updateMyPassword= async(req, res)=> {
  const {currentPassword, newPassword}= req.body;

  if(!currentPassword || !newPassword){
    return res.status(400).json({message: "Current and new password are required!"});
  }

  if(newPassword.lenght < 6 ){
    return res.status(400).json({message: "New password must be atleast 6 characters!"});
  }

  if(currentPassword === newPassword){
    return res.status(400).json({message: "New password must differ from current password!"});
  }

  try {
    const student= await Student.findById(req.user._id).select("+password");
    if(!student) return res.status(404).json({message: "Student not found!"});

    const isMatch= await student.comparePassword(currentPassword);
    if(!isMatch){
      return res.status(401).json({message: "Current password is incorrect"});
    }

    student.password = newPassword;
    await student.save();
    res.status(200).json({message: "Password updated successfully!"});

  } catch (err) {
    res.status(500).json({message: "Server error", error: err.message});
  }

};