import Teacher from "../models/user/teacher.model.js";


//GET 
export const getMyProfile = async (req, res)=> {
  try {
    const teacher = await Teacher.findById(req.user._id).select(
      "fullName email phone address profileImageURL teacherId membershipId subject"
    );

    if(!teacher) return res.status(404).json({message: "Teacher not found!"});
    res.status(200).json({teacher});

  } catch (error) {
    res.status(500).json({message: "Server error!", error: error.message});
  }
};

//Update profile - PATCH
export const updateMyProfile = async (req, res)=> {
  const allowedFields = ["phone", "address", "subject"];
  const updates= {};
  for(const key of allowedFields){
    if(req.body[key] !== undefined) updates[key]= req.body[key];
  }

  if(Object.keys(updates).length === 0) {
    return res.status(400).json({message: "No valid fields provided for update!"});
  }

  try{
    const teacher = await Teacher.findByIdAndUpdate(
      req.user._id,
      {$set: updates},
      {new: true, runValidators: true}
    ).select("fullName email phone address subject");

    if(!teacher) return res.status(404).json({message: "Teacher not found!"});
    res.status(200).json({message: "Profile updated successfully!", teacher});
  }catch(err){
    res.status(500).json({message: "Server error!", error: err.message});
  }

};

//update password - PATCH
export const updateMyPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must differ from current password" });
    }

    try {
        const teacher = await Teacher.findById(req.user._id).select("+password");
        if (!teacher) return res.status(404).json({ message: "Teacher not found" });

        const isMatch = await teacher.comparePassword(currentPassword);
        if (!isMatch) {
          return res.status(401).json({ message: "Current password is incorrect" });
        }

        teacher.password = newPassword;
        await teacher.save();
        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};