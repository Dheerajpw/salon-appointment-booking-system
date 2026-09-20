
// ===============================
// Required Fields Validation
// ===============================

const validateRequiredFields = (fields) => {

    return (req, res, next) => {

        const missingFields = [];

        fields.forEach((field) => {

            if (
                req.body[field] === undefined ||
                req.body[field] === null ||
                String(req.body[field]).trim() === ""
            ) {
                missingFields.push(field);
            }

        });


        if (missingFields.length > 0) {

            return res.status(400).json({

                success: false,

                message: "Required fields are missing",

                missingFields: missingFields

            });
        }


        next();
    };
};


// ===============================
// Email Validation
// ===============================

const validateEmail = (req, res, next) => {

    const { email } = req.body;

    if (!email) {

        return res.status(400).json({

            success: false,

            message: "Email is required"

        });
    }


    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {

        return res.status(400).json({

            success: false,

            message: "Please provide a valid email"

        });
    }


    next();
};


// ===============================
// Password Validation
// ===============================

const validatePassword = (req, res, next) => {

    const { password } = req.body;


    if (!password) {

        return res.status(400).json({

            success: false,

            message: "Password is required"

        });
    }


    if (password.length < 6) {

        return res.status(400).json({

            success: false,

            message:
                "Password must be at least 6 characters long"

        });
    }


    next();
};


module.exports = {
    validateRequiredFields,
    validateEmail,
    validatePassword
};
