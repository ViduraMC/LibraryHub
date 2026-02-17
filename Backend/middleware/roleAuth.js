const roleAuth = (...allowedRoles) => {
    return (req, res, next) => {
        // auth middleware must run before this (req.user should exist)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // check if user's role is in the allowed roles list
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to access this resource",
            });
        }

        next();
    };
};

export default roleAuth;
