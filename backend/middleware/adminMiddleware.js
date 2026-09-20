const jwt = require("jsonwebtoken");

const adminMiddleware = (req, res, next) => {

    try {

        // Authorization header check
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Access token required"
            });
        }

        // Bearer token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format"
            });
        }

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Admin role check
        if (decoded.role !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }

        // Store user information
        req.user = decoded;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });

    }

};

module.exports = adminMiddleware;