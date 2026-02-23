import jwt from "jsonwebtoken";
import User from "../models/user/user.model.js";
import Student from "../models/user/student.model.js";
import Teacher from "../models/user/teacher.model.js";
import MembershipRequest from "../models/membershipRequest.model.js";
import BlacklistedToken from "../models/blacklistedToken.model.js";

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

// set password for newly approved members
// called when student/teacher clicks the link in their approval email
export const setPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        // validate input
        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: "Token and password are required",
            });
        }

        // password strength check
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        // find the membership request with this token
        const request = await MembershipRequest.findOne({
            passwordSetToken: token,
            status: "approved",
        });

        if (!request) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token",
            });
        }

        // check if token has expired
        if (request.passwordSetTokenExpiry < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Token has expired. Please contact the librarian for a new approval",
            });
        }

        // create actual user account based on applicant type
        let newUser;

        if (request.applicantType === "student") {
            newUser = await Student.create({
                fullName: request.fullName,
                email: request.email,
                password: password,
                phone: request.phone || "",
                address: request.address || "",
                role: "student",
                studentId: request.studentId,
                membershipId: request.membershipId,
                grade: request.grade || "",
                classRoom: request.classRoom || "",
                guardianName: request.guardianName || "",
                guardianPhone: request.guardianPhone || "",
            });
        } else {
            newUser = await Teacher.create({
                fullName: request.fullName,
                email: request.email,
                password: password,
                phone: request.phone || "",
                address: request.address || "",
                role: "teacher",
                teacherId: request.teacherId,
                membershipId: request.membershipId,
                subject: request.subject || "",
            });
        }

        // mark request as active and clear token
        request.status = "active";
        request.passwordSetToken = undefined;
        request.passwordSetTokenExpiry = undefined;
        await request.save();

        // remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            message: "Password set successfully. You can now login with your membership ID",
            user: userResponse,
        });
    } catch (error) {
        console.error("Set password error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

// logout — blacklist the current token
export const logout = async (req, res) => {
    try {
        // extract token from header
        const token = req.headers.authorization.split(" ")[1];

        // decode to get expiry time (exp is in seconds, Date needs milliseconds)
        const decoded = jwt.decode(token);
        const expiresAt = new Date(decoded.exp * 1000);

        // add to blacklist — TTL index will auto-remove it after it expires
        await BlacklistedToken.create({ token, expiresAt });

        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        console.error("Logout error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error while logging out",
        });
    }
};
