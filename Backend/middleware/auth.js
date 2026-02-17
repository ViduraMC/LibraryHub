import jwt from "jsonwebtoken";
import User from "../models/user/user.model.js";

const auth = async (req, res, next) => {
    try {
        // get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided",
            });
        }

        // extract token (remove "Bearer " prefix)
        const token = authHeader.split(" ")[1];

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // find user by id from token and attach to request
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid token. User not found",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account is deactivated",
            });
        }

        // attach user to request object for use in controllers
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export default auth;
