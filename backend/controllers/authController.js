
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ========================================
// Generate JWT Token
// ========================================

const generateToken = (user) => {

    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "1d"
        }
    );

};


// ========================================
// Register User
// ========================================

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password
        } = req.body;


        // ========================================
        // Validate Fields
        // ========================================

        if (
            !name ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Name, email and password are required"

            });

        }


        // ========================================
        // Check Existing Email
        // ========================================

        const [existingUsers] =
            await db.query(

                `SELECT id
                 FROM users
                 WHERE email = ?`,

                [email]

            );


        if (existingUsers.length > 0) {

            return res.status(409).json({

                success: false,

                message:
                    "Email already registered"

            });

        }


        // ========================================
        // Check Existing Phone
        // ========================================

        if (phone) {

            const [existingPhone] =
                await db.query(

                    `SELECT id
                     FROM users
                     WHERE phone = ?`,

                    [phone]

                );


            if (existingPhone.length > 0) {

                return res.status(409).json({

                    success: false,

                    message:
                        "Phone number already registered"

                });

            }

        }


        // ========================================
        // Hash Password
        // ========================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ========================================
        // Insert User
        // ========================================

        const [result] =
            await db.query(

                `INSERT INTO users
                (
                    name,
                    email,
                    phone,
                    password
                )
                VALUES (?, ?, ?, ?)`,

                [
                    name,
                    email,
                    phone || null,
                    hashedPassword
                ]

            );


        // ========================================
        // Response
        // ========================================

        return res.status(201).json({

            success: true,

            message:
                "User registered successfully",

            data: {

                userId:
                    result.insertId,

                name:
                    name,

                email:
                    email,

                phone:
                    phone || null,

                role:
                    "CUSTOMER"

            }

        });

    } catch (error) {

        console.error(
            "Register error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to register user",

            error:
                error.message

        });

    }

};


// ========================================
// Login User
// ========================================

const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ========================================
        // Validate Fields
        // ========================================

        if (
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"

            });

        }


        // ========================================
        // Find User
        // ========================================

        const [users] =
            await db.query(

                `SELECT *
                 FROM users
                 WHERE email = ?`,

                [email]

            );


        if (users.length === 0) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        const user =
            users[0];


        // ========================================
        // Compare Password
        // ========================================

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        // ========================================
        // Generate Token
        // ========================================

        const token =
            generateToken(user);


        // ========================================
        // Response
        // ========================================

        return res.status(200).json({

            success: true,

            message:
                "Login successful",

            token:

                token,

            data: {

                id:
                    user.id,

                name:
                    user.name,

                email:
                    user.email,

                phone:
                    user.phone,

                role:
                    user.role

            }

        });

    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to login",

            error:
                error.message

        });

    }

};


// ========================================
// Get Profile
// ========================================

const getProfile = async (req, res) => {

    try {

        const userId =
            req.user.id;


        const [users] =
            await db.query(

                `SELECT
                    id,
                    name,
                    email,
                    phone,
                    role,
                    createdAt,
                    updatedAt
                 FROM users
                 WHERE id = ?`,

                [userId]

            );


        if (users.length === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        return res.status(200).json({

            success: true,

            data:
                users[0]

        });

    } catch (error) {

        console.error(
            "Get profile error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to get profile",

            error:
                error.message

        });

    }

};


// ========================================
// Update Profile
// ========================================

const updateProfile = async (req, res) => {

    try {

        const userId =
            req.user.id;

        const {
            name,
            phone
        } = req.body;


        if (!name && !phone) {

            return res.status(400).json({

                success: false,

                message:
                    "Name or phone is required"

            });

        }


        const [result] =
            await db.query(

                `UPDATE users
                 SET
                    name = COALESCE(?, name),
                    phone = COALESCE(?, phone)
                 WHERE id = ?`,

                [
                    name || null,
                    phone || null,
                    userId
                ]

            );


        if (result.affectedRows === 0) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Profile updated successfully"

        });

    } catch (error) {

        console.error(
            "Update profile error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to update profile",

            error:
                error.message

        });

    }

};


// ========================================
// Export
// ========================================

module.exports = {

    registerUser,

    loginUser,

    getProfile,

    updateProfile

};
