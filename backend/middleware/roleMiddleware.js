
const roleMiddleware = (allowedRoles) => {

    return (req, res, next) => {

        // User authenticated hai ya nahi
        if (!req.user) {

            return res.status(401).json({

                success: false,

                message: "Authentication required"

            });
        }


        // User ka role allowed hai ya nahi
        if (!allowedRoles.includes(req.user.role)) {

            return res.status(403).json({

                success: false,

                message: "Access denied. Admin role required"

            });
        }


        // Role valid hai
        next();
    };
};


module.exports = roleMiddleware;
