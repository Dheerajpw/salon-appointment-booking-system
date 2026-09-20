
const jwt = require("jsonwebtoken");


// ========================================
// Authentication Middleware
// ========================================

const authMiddleware = (req, res, next) => {

    try {

        const authHeader =
            req.headers.authorization;


        // ========================================
        // Check Authorization Header
        // ========================================

        if (!authHeader) {

            return res.status(401).json({

                success: false,

                message:
                    "Authorization token required"

            });

        }


        // ========================================
        // Check Bearer Format
        // ========================================

        if (
            !authHeader.startsWith("Bearer ")
        ) {

            return res.status(401).json({

                success: false,

                message:
                    "Use Bearer token format"

            });

        }


        const token =
            authHeader.split(" ")[1];


        // ========================================
        // Verify Token
        // ========================================

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // ========================================
        // Attach User
        // ========================================

        req.user =
            decoded;


        next();

    } catch (error) {

        console.error(
            "Auth middleware error:",
            error.message
        );

        return res.status(401).json({

            success: false,

            message:
                "Invalid or expired token"

        });

    }

};


// ========================================
// Export
// ========================================

module.exports =
    authMiddleware;
