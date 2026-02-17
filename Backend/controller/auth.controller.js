import jwt from "jsonwebtoken";
import User from "../models/user/user.model.js";

// generate jwt token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// login for all roles
// admin/librarian → email + password
// student/teacher → membershipId + password
export const login = async (req, res) => {
    try {
        const { email, membershipId, password } = req.body;

        // validate input
        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required",
            });
        }

        if (!email && !membershipId) {
            return res.status(400).json({
                success: false,
                message: "Email or Membership ID is required",
            });
        }

        let user;

        if (email) {
            // admin or librarian login
            user = await User.findOne({ email: email.toLowerCase() });
        } else {
            // student or teacher login
            user = await User.findOne({ membershipId });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated. Contact admin",
            });
        }

        // verify password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }

        // update last login time
        user.lastLoginAt = new Date();
        await user.save();

        // generate token
        const token = generateToken(user);

        // remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: userResponse,
        });
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
